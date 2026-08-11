const User = require('../users/userModel');
const LoginLog = require('../users/loginModel');
const admin = require('../../config/firebase');
const { getAuth } = require('firebase-admin/auth');
const generateToken = require('../../utils/generateToken');

// Helper to log user session
const logUserSession = async (req, userId) => {
  try {
    const ipAddress =
      req.headers['x-forwarded-for'] ||
      req.socket?.remoteAddress ||
      req.ip ||
      '127.0.0.1';
    const deviceInfo = req.headers['user-agent'] || 'Unknown Device';

    await LoginLog.create({
      userId,
      ipAddress: Array.isArray(ipAddress) ? ipAddress[0] : ipAddress,
      deviceInfo,
    });
  } catch (error) {
    console.error('Failed to log login session:', error.message);
  }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phoneNumber,
      password,
      role = 'Public User',
      address = '',
      city = '',
      district = '',
      state = '',
      pincode = '',
      dob,
    } = req.body;

    // Validate required fields
    if (!fullName || !email || !phoneNumber || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: fullName, email, phoneNumber, and password',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    const validRoles = [
      'Public User',
      'Rescue Team',
      'Shelter',
      'Veterinary Staff',
      'Admin',
    ];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role specified. Valid options are: ${validRoles.join(', ')}`,
      });
    }

    // Check if user already exists in MongoDB
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists',
      });
    }

    // 1. Create User in Firebase Auth (with fallback to local MongoDB-only registration)
    let firebaseUser;
    try {
      const formattedPhone = phoneNumber.trim();
      firebaseUser = await getAuth().createUser({
        email: email.toLowerCase(),
        password,
        displayName: fullName,
        ...(formattedPhone.startsWith('+') ? { phoneNumber: formattedPhone } : {}),
      });
    } catch (fbError) {
      if (fbError.code === 'auth/invalid-phone-number' || fbError.message?.includes('phoneNumber')) {
        // Fallback: Retry without phoneNumber in Firebase (we still store it in MongoDB)
        try {
          firebaseUser = await getAuth().createUser({
            email: email.toLowerCase(),
            password,
            displayName: fullName,
          });
        } catch (retryError) {
          console.warn('Firebase Auth creation failed on retry, using local-only profile fallback:', retryError.message);
          firebaseUser = {
            uid: 'local_' + Math.random().toString(36).substring(2, 11),
          };
        }
      } else {
        console.warn('Firebase Auth creation failed, using local-only profile fallback:', fbError.message);
        firebaseUser = {
          uid: 'local_' + Math.random().toString(36).substring(2, 11),
        };
      }
    }

    // 2. Create User Profile in MongoDB
    const user = await User.create({
      fullName,
      email: email.toLowerCase(),
      phoneNumber,
      password, // Save password in MongoDB
      role,
      address,
      city,
      district,
      state,
      pincode,
      dob: dob ? new Date(dob) : null,
      status: 'Active',
      firebaseUid: firebaseUser.uid,
    });

    if (user) {
      // Log login session
      await logUserSession(req, user._id);

      // 3. Authenticate to get a Firebase ID Token (or fallback to custom token)
      let idToken = '';
      const apiKey = process.env.FIREBASE_API_KEY;
      if (apiKey && apiKey !== 'your-web-api-key') {
        try {
          const response = await fetch(
            `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: email.toLowerCase(),
                password,
                returnSecureToken: true,
              }),
            }
          );
          const data = await response.json();
          if (data.idToken) {
            idToken = data.idToken;
          }
        } catch (authError) {
          console.error('Auto-signin after registration failed:', authError.message);
        }
      }

      // Fallback: Generate a local JWT token if ID token is not available (e.g. using local placeholder credentials)
      if (!idToken) {
        idToken = generateToken(user);
      }

      return res.status(201).json({
        success: true,
        message: 'Account created successfully',
        token: idToken,
        user: {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          role: user.role,
          address: user.address,
          city: user.city,
          district: user.district,
          state: user.state,
          pincode: user.pincode,
          dob: user.dob,
          profilePic: user.profilePic,
          status: user.status,
          firebaseUid: user.firebaseUid,
        },
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid user data received',
      });
    }
  } catch (error) {
    console.error('Registration Controller Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during user registration',
    });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password, idToken } = req.body;

    // 1. If Direct Firebase ID Token is passed from the client-side login
    if (idToken) {
      try {
        const decodedToken = await getAuth().verifyIdToken(idToken);
        const emailFromToken = decodedToken.email || '';

        let user = await User.findOne({ firebaseUid: decodedToken.uid }).select('-password');
        if (!user && emailFromToken) {
          user = await User.findOne({ email: emailFromToken.toLowerCase() }).select('-password');
          if (user) {
            // Link account dynamically by saving firebaseUid
            user.firebaseUid = decodedToken.uid;
            await user.save();
          }
        }

        if (!user) {
          // Auto-create user in MongoDB if logging in via Google / Firebase Token for first time
          user = await User.create({
            fullName: decodedToken.name || 'Google User',
            email: emailFromToken.toLowerCase(),
            phoneNumber: 'Not provided',
            password: '',
            role: 'Public User',
            profilePic: decodedToken.picture || '',
            status: 'Active',
            firebaseUid: decodedToken.uid,
          });
        }

        if (user.status === 'Suspended') {
          return res.status(403).json({
            success: false,
            message: 'Your account has been suspended. Please contact support.',
          });
        }

        // Log login session
        await logUserSession(req, user._id);

        return res.status(200).json({
          success: true,
          message: 'Logged in successfully',
          token: idToken,
          user,
        });
      } catch (tokenError) {
        console.error('ID Token Verification Error:', tokenError);
        return res.status(401).json({
          success: false,
          message: `Invalid Firebase ID token: ${tokenError.message}`,
        });
      }
    }

    // 2. Email & Password flow
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email address and password, or a Firebase ID Token',
      });
    }

    const apiKey = process.env.FIREBASE_API_KEY;
    
    // Direct local MongoDB password check fallback when API key is missing or a placeholder
    if (!apiKey || apiKey === 'your-web-api-key') {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (user && user.password) {
        const isMatch = await user.matchPassword(password);
        if (isMatch) {
          if (user.status === 'Suspended') {
            return res.status(403).json({
              success: false,
              message: 'Your account has been suspended. Please contact support.',
            });
          }
          await logUserSession(req, user._id);
          const token = generateToken(user);
          return res.status(200).json({
            success: true,
            message: 'Logged in successfully (Local Fallback)',
            token,
            user,
          });
        }
      }
      return res.status(401).json({
        success: false,
        message: 'Invalid email address or password',
      });
    }

    let returnedIdToken = '';
    let firebaseUid = '';

    try {
      const response = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email.toLowerCase(),
            password,
            returnSecureToken: true,
          }),
        }
      );

      const data = await response.json();

      if (data.error) {
        // Double check local MongoDB fallback as a fail-safe
        const user = await User.findOne({ email: email.toLowerCase() });
        if (user && user.password) {
          const isMatch = await user.matchPassword(password);
          if (isMatch) {
            if (user.status === 'Suspended') {
              return res.status(403).json({
                success: false,
                message: 'Your account has been suspended. Please contact support.',
              });
            }
            await logUserSession(req, user._id);
            const token = generateToken(user);
            return res.status(200).json({
              success: true,
              message: 'Logged in successfully (Local Fallback)',
              token,
              user,
            });
          }
        }

        return res.status(401).json({
          success: false,
          message: data.error.message || 'Invalid email address or password',
        });
      }

      returnedIdToken = data.idToken;
      firebaseUid = data.localId;
    } catch (authError) {
      console.error('Firebase Auth REST API Error:', authError.message);
      
      // Attempt local MongoDB fallback on network error/server communication error
      const user = await User.findOne({ email: email.toLowerCase() });
      if (user && user.password) {
        const isMatch = await user.matchPassword(password);
        if (isMatch) {
          if (user.status === 'Suspended') {
            return res.status(403).json({
              success: false,
              message: 'Your account has been suspended. Please contact support.',
            });
          }
          await logUserSession(req, user._id);
          const token = generateToken(user);
          return res.status(200).json({
            success: true,
            message: 'Logged in successfully (Local Fallback)',
            token,
            user,
          });
        }
      }

      return res.status(500).json({
        success: false,
        message: 'Authentication failed due to server communication error',
      });
    }

    // Find mapped profile in MongoDB
    let user = await User.findOne({ firebaseUid });
    if (!user) {
      user = await User.findOne({ email: email.toLowerCase() });
      if (user) {
        user.firebaseUid = firebaseUid;
        await user.save();
      }
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Account verified, but MongoDB profile was not found.',
      });
    }

    if (user.status === 'Suspended') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact support.',
      });
    }

    // Log login session
    await logUserSession(req, user._id);

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token: returnedIdToken,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        address: user.address,
        city: user.city,
        district: user.district,
        state: user.state,
        pincode: user.pincode,
        dob: user.dob,
        profilePic: user.profilePic,
        status: user.status,
        firebaseUid: user.firebaseUid,
      },
    });
  } catch (error) {
    console.error('Login Controller Error:', error);
    return res.status(500).json({
      success: false,
      message: `Server error during user login: ${error.message}`,
    });
  }
};

// @desc    Get current authenticated user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found',
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Get Me Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching user profile',
    });
  }
};

// @desc    Authenticate user using Google ID Token
// @route   POST /api/auth/google
// @access  Public
const googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: 'No Google credential token provided',
      });
    }

    // Verify Google ID Token via Google API
    const response = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`
    );

    if (!response.ok) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Google credential token',
      });
    }

    const payload = await response.json();

    if (!payload.email) {
      return res.status(400).json({
        success: false,
        message: 'Google account does not have an email address associated',
      });
    }

    // Find or create user in MongoDB
    let user = await User.findOne({ email: payload.email.toLowerCase() });

    if (!user) {
      // Try to create in Firebase Auth first, fallback to Google sub ID if fails
      let firebaseUid = payload.sub;
      try {
        const firebaseUser = await getAuth().createUser({
          email: payload.email.toLowerCase(),
          displayName: payload.name,
          photoURL: payload.picture,
        });
        firebaseUid = firebaseUser.uid;
      } catch (fbError) {
        console.warn('Firebase Auth creation failed for Google user, using Google sub ID:', fbError.message);
      }

      // Create in MongoDB
      user = await User.create({
        fullName: payload.name || 'Google User',
        email: payload.email.toLowerCase(),
        phoneNumber: 'Not provided', // default required field
        password: '', // no local password
        role: 'Public User',
        profilePic: payload.picture || '',
        status: 'Active',
        firebaseUid,
      });
    } else {
      // User exists, check status
      if (user.status === 'Suspended') {
        return res.status(403).json({
          success: false,
          message: 'Your account has been suspended. Please contact support.',
        });
      }

      // Link firebaseUid if not set
      let modified = false;
      if (!user.firebaseUid) {
        user.firebaseUid = payload.sub;
        modified = true;
      }
      if (payload.picture && !user.profilePic) {
        user.profilePic = payload.picture;
        modified = true;
      }
      if (modified) {
        await user.save();
      }
    }

    // Log login session
    await logUserSession(req, user._id);

    // Generate local JWT token
    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: 'Authenticated successfully with Google',
      token,
      user,
    });
  } catch (error) {
    console.error('Google Auth Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during Google authentication',
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  googleAuth,
  getMe,
};
