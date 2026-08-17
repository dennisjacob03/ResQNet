const admin = require('../config/firebase');
const { getAuth } = require('firebase-admin/auth');
const jwt = require('jsonwebtoken');
const User = require('../modules/users/userModel');

// Protect routes - Firebase / JWT verification
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      let decodedUser = null;
      let tokenVerifyError = null;

      // 1. Try Firebase Token verification first
      try {
        const decodedToken = await getAuth().verifyIdToken(token);
        
        // Find user by firebaseUid or email
        let user = await User.findOne({ firebaseUid: decodedToken.uid }).select('-password');
        if (!user && decodedToken.email) {
          user = await User.findOne({ email: decodedToken.email.toLowerCase() }).select('-password');
          if (user) {
            // Dynamically link account by updating firebaseUid
            user.firebaseUid = decodedToken.uid;
            await user.save();
          }
        }
        decodedUser = user;
      } catch (fbError) {
        tokenVerifyError = fbError.message;
      }

      // 2. Fallback to custom JWT if not verified by Firebase
      if (!decodedUser) {
        try {
          const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || 'resqnet_secret_jwt_key_2026'
          );
          decodedUser = await User.findById(decoded.id).select('-password');
        } catch (jwtError) {
          // 3. Fallback: If token was a Firebase token that expired, try decoding it to resolve the active user
          try {
            const decodedUnverified = jwt.decode(token);
            if (decodedUnverified && (decodedUnverified.user_id || decodedUnverified.uid || decodedUnverified.email || decodedUnverified.id)) {
              const query = [];
              if (decodedUnverified.id) query.push({ _id: decodedUnverified.id });
              if (decodedUnverified.user_id) query.push({ firebaseUid: decodedUnverified.user_id });
              if (decodedUnverified.uid) query.push({ firebaseUid: decodedUnverified.uid });
              if (decodedUnverified.email) query.push({ email: decodedUnverified.email.toLowerCase() });

              if (query.length > 0) {
                decodedUser = await User.findOne({ $or: query }).select('-password');
              }
            }
          } catch (decodeErr) {
            console.error('Fallback decode error:', decodeErr);
          }

          if (!decodedUser) {
            console.error('Token verification error:', tokenVerifyError || jwtError.message);
            return res.status(401).json({
              success: false,
              message: 'Not authorized, token failed verification',
            });
          }
        }
      }

      if (!decodedUser) {
        return res
          .status(401)
          .json({ success: false, message: 'User not found or account deactivated' });
      }

      if (decodedUser.status === 'Suspended') {
        return res
          .status(403)
          .json({ success: false, message: 'Your account has been suspended' });
      }

      req.user = decodedUser;
      return next();
    } catch (error) {
      console.error('Auth Middleware Error:', error.message);
      return res
        .status(401)
        .json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: 'Not authorized, no token provided' });
  }
};

// Role-Based Access Control (RBAC) middleware
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user ? req.user.role : 'Guest'}' is not authorized to access this resource`,
      });
    }
    next();
  };
};

module.exports = {
  protect,
  authorizeRoles,
};
