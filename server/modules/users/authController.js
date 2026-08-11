const User = require('../users/userModel');
const Login = require('../users/loginModel');
const generateToken = require('../../utils/generateToken');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res) => {
  try {
    const { fullName, email, phoneNumber, password, role, dob, address, city, district, state, pincode } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    // Create user
    const user = await User.create({
      fullName,
      email,
      phoneNumber,
      password,
      role: role || 'Public User',
      dob,
      address,
      city,
      district,
      state,
      pincode,
    });

    if (user) {
      // Record login session
      await Login.create({ userId: user._id, loginTime: new Date() });

      res.status(201).json({
        success: true,
        data: {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          status: user.status,
          token: generateToken(user._id, user.role),
        },
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Check for email & select password field explicitly
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Optional: Validate if requested role matches assigned role
    if (role && user.role !== role) {
      return res.status(403).json({ success: false, message: `Account registered as ${user.role}, not ${role}` });
    }

    // Verify status
    if (user.status === 'Inactive') {
      return res.status(403).json({ success: false, message: 'Your account is currently inactive' });
    }

    // Match password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Record login timestamp
    await Login.create({ userId: user._id, loginTime: new Date() });

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        profilePic: user.profilePic,
        token: generateToken(user._id, user.role),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};