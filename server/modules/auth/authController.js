const User = require('../users/userModel');
const LoginLog = require('../users/loginModel');
const admin = require('../../config/firebase');
const { getAuth } = require('firebase-admin/auth');
const generateToken = require('../../utils/generateToken');
const { sendPasswordResetEmail, sendVerificationEmail, sendWelcomeEmail } = require('../../utils/emailService');
const { createNotificationHelper } = require('../notifications/notificationController');

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
      otp,
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

    // Enforce Dual Verification (Both Phone & Email must be verified)
    if (!req.body.isPhoneVerified) {
      return res.status(400).json({
        success: false,
        message: 'Phone number verification is required before registration',
      });
    }

    if (!otp) {
      return res.status(400).json({
        success: false,
        message: 'Email verification OTP code is required for registration',
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const key = `${cleanEmail}_email_verification`;
    const storedRecord = otpStore.get(key);

    if (!storedRecord || storedRecord.code !== otp.trim() || Date.now() > storedRecord.expiresAt) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired email verification OTP. Please check your email and try again.',
      });
    }

    // Clear email OTP after successful verification
    otpStore.delete(key);

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

    // 2. Create User Profile in MongoDB with both verification flags set to true
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
      isEmailVerified: true,
      isPhoneVerified: true,
    });

    if (user) {
      // Send welcome email asynchronously
      sendWelcomeEmail(user).catch((err) => console.error('Failed to send welcome email:', err));
      
      // Dispatch Welcome in-app notification
      createNotificationHelper({
        userId: user._id,
        title: 'Welcome to ResQNet! 🐾',
        message: `Greetings ${user.fullName}! Welcome to ResQNet. We are delighted to have you join our animal welfare and rescue network. You can report emergencies, adopt pets, and register shelters.`,
        type: 'Welcome',
        priority: 'Medium',
      }).catch((err) => console.error('Failed to create welcome notification:', err));

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
            phoneNumber: decodedToken.phone_number || 'Not provided',
            password: '',
            role: 'Public User',
            profilePic: decodedToken.picture || '',
            status: 'Active',
            isEmailVerified: true,
            isPhoneVerified: Boolean(decodedToken.phone_number),
            firebaseUid: decodedToken.uid,
          });

          // Dispatch Welcome in-app notification for new Google user
          createNotificationHelper({
            userId: user._id,
            title: 'Welcome to ResQNet! 🐾',
            message: `Greetings ${user.fullName}! Welcome to ResQNet. We are delighted to have you join our animal welfare and rescue network. You can report emergencies, adopt pets, and register shelters.`,
            type: 'Welcome',
            priority: 'Medium',
          }).catch((err) => console.error('Failed to create welcome notification:', err));
        } else {
          let updated = false;
          if (!user.isEmailVerified) {
            user.isEmailVerified = true;
            updated = true;
          }
          if (decodedToken.picture && !user.profilePic) {
            user.profilePic = decodedToken.picture;
            updated = true;
          }
          if (updated) {
            await user.save();
          }
        }

        if (user.isDeleted || user.status === 'Deleted') {
          return res.status(403).json({
            success: false,
            message: 'Your account has been deactivated. Please contact support.',
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
        const token = generateToken(user);

        return res.status(200).json({
          success: true,
          message: 'Logged in successfully',
          token,
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
          if (user.isDeleted || user.status === 'Deleted') {
            return res.status(403).json({
              success: false,
              message: 'Your account has been deactivated. Please contact support.',
            });
          }
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
            if (user.isDeleted || user.status === 'Deleted') {
              return res.status(403).json({
                success: false,
                message: 'Your account has been deactivated. Please contact support.',
              });
            }
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
          if (user.isDeleted || user.status === 'Deleted') {
            return res.status(403).json({
              success: false,
              message: 'Your account has been deactivated. Please contact support.',
            });
          }
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

    if (user.isDeleted || user.status === 'Deleted') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.',
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
    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
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
        isEmailVerified: true,
        firebaseUid,
      });

      // Dispatch Welcome in-app notification for new Google user
      createNotificationHelper({
        userId: user._id,
        title: 'Welcome to ResQNet! 🐾',
        message: `Greetings ${user.fullName}! Welcome to ResQNet. We are delighted to have you join our animal welfare and rescue network. You can report emergencies, adopt pets, and register shelters.`,
        type: 'Welcome',
        priority: 'Medium',
      }).catch((err) => console.error('Failed to create welcome notification:', err));
    } else {
      // User exists, check status
      if (user.status === 'Suspended') {
        return res.status(403).json({
          success: false,
          message: 'Your account has been suspended. Please contact support.',
        });
      }

      // Link firebaseUid and verify email if not set
      let modified = false;
      if (!user.isEmailVerified) {
        user.isEmailVerified = true;
        modified = true;
      }
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

// OTP Memory Cache Store
const otpStore = new Map();

// @desc    Send OTP to user email
// @route   POST /api/auth/send-otp
// @access  Public
const sendOtp = async (req, res) => {
  try {
    const { email, reason = 'forgot_password' } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    if (!user && reason === 'forgot_password') {
      return res.status(404).json({ success: false, message: 'No account registered with this email address' });
    }

    if (user && reason === 'email_verification') {
      return res.status(400).json({ success: false, message: 'An account with this email address already exists' });
    }

    // Generate 6-digit OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const key = `${cleanEmail}_${reason}`;
    
    // Expire in 10 minutes (600,000 ms)
    otpStore.set(key, { code: otpCode, expiresAt: Date.now() + 600000 });

    // Trigger Email Dispatch
    if (reason === 'email_verification' || reason === 'shelter_email_verification') {
      await sendVerificationEmail(cleanEmail, otpCode, req.body.fullName || req.body.shelterName || 'Shelter Partner');
    } else {
      await sendPasswordResetEmail(user || { email: cleanEmail, fullName: 'Valued User' }, otpCode);
    }

    return res.status(200).json({
      success: true,
      message: `A 6-digit verification code has been sent to ${cleanEmail}`,
    });
  } catch (error) {
    console.error('Send OTP Error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to send OTP code' });
  }
};

// @desc    Verify OTP code
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOtp = async (req, res) => {
  try {
    const { email, otp, reason = 'forgot_password' } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email address and OTP code are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const key = `${cleanEmail}_${reason}`;
    const storedRecord = otpStore.get(key);

    if (!storedRecord) {
      return res.status(400).json({ success: false, message: 'No OTP request found for this email address. Please request a new code.' });
    }

    if (Date.now() > storedRecord.expiresAt) {
      otpStore.delete(key);
      return res.status(400).json({ success: false, message: 'Verification OTP has expired. Please request a new code.' });
    }

    if (storedRecord.code !== otp.trim()) {
      return res.status(400).json({ success: false, message: 'Invalid verification OTP code. Please check and try again.' });
    }

    return res.status(200).json({
      success: true,
      message: 'OTP code verified successfully',
    });
  } catch (error) {
    console.error('Verify OTP Error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to verify OTP code' });
  }
};

// @desc    Reset user password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword, reason = 'forgot_password' } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email, OTP code, and new password are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const key = `${cleanEmail}_${reason}`;
    const storedRecord = otpStore.get(key);

    if (!storedRecord || storedRecord.code !== otp.trim() || Date.now() > storedRecord.expiresAt) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP session. Please request a new code.' });
    }

    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found' });
    }

    user.password = newPassword;
    await user.save();

    // Clear OTP after successful reset
    otpStore.delete(key);

    return res.status(200).json({
      success: true,
      message: 'Your password has been reset successfully. You can now log in.',
    });
  } catch (error) {
    console.error('Reset Password Error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to reset password' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { fullName, phoneNumber, dob, address, city, district, state, pincode, isPhoneVerified } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User authorization token required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found' });
    }

    // Phone number is MANDATORY
    if (!phoneNumber || !phoneNumber.trim()) {
      return res.status(400).json({ success: false, message: 'Phone number is mandatory and cannot be empty' });
    }

    const cleanPhone = phoneNumber.trim();

    // If phone number is changed or was not verified, require phone verification
    if (cleanPhone !== user.phoneNumber && !isPhoneVerified) {
      return res.status(400).json({
        success: false,
        message: 'Phone number verification (OTP) is required when updating phone number.',
      });
    }

    if (fullName) user.fullName = fullName.trim();
    user.phoneNumber = cleanPhone;
    if (dob !== undefined && dob !== '') user.dob = new Date(dob);
    if (address !== undefined) user.address = address;
    if (city !== undefined) user.city = city;
    if (district !== undefined) user.district = district;
    if (state !== undefined) user.state = state;
    if (pincode !== undefined) user.pincode = pincode;
    if (isPhoneVerified) user.isPhoneVerified = true;

    // If a profile picture file was uploaded via multer
    if (req.file) {
      // Store as /uploads/<filename> path accessible via static serving
      user.profilePic = `/uploads/${req.file.filename}`;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user,
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to update profile' });
  }
};

// @desc    Change logged-in user's password
// @route   POST /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current password and new password are required.' });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Google/Firebase-only accounts may have no password set
    if (!user.password) {
      return res.status(400).json({
        success: false,
        message: 'Your account uses Google sign-in and does not have a password. Please use "Forgot Password" to set one.',
      });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    }

    user.password = newPassword;
    await user.save(); // pre-save hook will hash the new password

    return res.status(200).json({ success: true, message: 'Password changed successfully.' });
  } catch (error) {
    console.error('Change Password Error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to change password.' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  googleAuth,
  getMe,
  sendOtp,
  verifyOtp,
  resetPassword,
  updateProfile,
  changePassword,
};
