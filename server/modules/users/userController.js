const User = require('./userModel');
const LoginLog = require('./loginModel');

// @desc    Get all users with optional filtering & search
// @route   GET /api/users
// @access  Private (Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const { search, role, status, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const query = {};

    // Filter by deleted status (unless explicitly requested)
    if (status === 'Deleted') {
      query.$or = [{ status: 'Deleted' }, { isDeleted: true }];
    } else if (status && status !== 'All') {
      query.status = status;
      query.isDeleted = { $ne: true };
    } else {
      query.isDeleted = { $ne: true };
    }

    // Filter by role
    if (role && role !== 'All') {
      query.role = role;
    }

    // Search by name, email, phone, city, state, district
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { fullName: searchRegex },
        { email: searchRegex },
        { phoneNumber: searchRegex },
        { city: searchRegex },
        { district: searchRegex },
        { state: searchRegex },
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const users = await User.find(query)
      .select('-password')
      .sort(sortOptions);

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error('Error fetching users:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message,
    });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private (Admin only)
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Optionally fetch recent login history
    const recentLogins = await LoginLog.find({ userId: user._id })
      .sort({ loginTime: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      user,
      recentLogins,
    });
  } catch (error) {
    console.error('Error fetching user:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user details',
      error: error.message,
    });
  }
};

// @desc    Update user status (Active / Inactive / Suspended)
// @route   PUT /api/users/:id/status
// @access  Private (Admin only)
exports.updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = ['Active', 'Inactive', 'Suspended'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Valid values: ${validStatuses.join(', ')}`,
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Prevent admin from suspending themselves
    if (req.user._id.toString() === user._id.toString() && status === 'Suspended') {
      return res.status(400).json({
        success: false,
        message: 'You cannot suspend your own admin account',
      });
    }

    user.status = status;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User status updated to ${status}`,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    console.error('Error updating user status:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update user status',
      error: error.message,
    });
  }
};

// @desc    Update user role
// @route   PUT /api/users/:id/role
// @access  Private (Admin only)
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

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
        message: `Invalid role. Valid values: ${validRoles.join(', ')}`,
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Prevent admin from changing their own role to non-admin
    if (req.user._id.toString() === user._id.toString() && role !== 'Admin') {
      return res.status(400).json({
        success: false,
        message: 'You cannot remove your own Admin role',
      });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User role updated to ${role}`,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    console.error('Error updating user role:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update user role',
      error: error.message,
    });
  }
};

// @desc    Create a new user directly by Admin
// @route   POST /api/users
// @access  Private (Admin only)
exports.createUser = async (req, res) => {
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
      status = 'Active',
      isEmailVerified = true,
      isPhoneVerified = true,
    } = req.body;

    if (!fullName || !email || !phoneNumber || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide fullName, email, phoneNumber, and password',
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
        message: `Invalid role. Valid options: ${validRoles.join(', ')}`,
      });
    }

    // Check if email is already registered
    const userExists = await User.findOne({ email: email.toLowerCase().trim() });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists',
      });
    }

    const newUser = await User.create({
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      phoneNumber: phoneNumber.trim(),
      password,
      role,
      address: address.trim(),
      city: city.trim(),
      district: district.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      status,
      isEmailVerified: Boolean(isEmailVerified),
      isPhoneVerified: Boolean(isPhoneVerified),
    });

    const userObj = newUser.toObject();
    delete userObj.password;

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: userObj,
    });
  } catch (error) {
    console.error('Error creating user:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to create user',
      error: error.message,
    });
  }
};

// @desc    Delete user (Soft delete - preserves audit logs and historical references)
// @route   DELETE /api/users/:id
// @access  Private (Admin only)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Prevent admin from deleting themselves
    if (req.user._id.toString() === user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own admin account',
      });
    }

    // Perform Soft Delete (preserve record and immutable login/audit logs)
    user.isDeleted = true;
    user.status = 'Deleted';
    user.deletedAt = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.fullName} has been removed (soft deleted) successfully`,
    });
  } catch (error) {
    console.error('Error deleting user:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message,
    });
  }
};

// @desc    Get aggregate user statistics for Admin Dashboard
// @route   GET /api/users/stats
// @access  Private (Admin only)
exports.getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ isDeleted: { $ne: true } });
    const activeUsers = await User.countDocuments({ status: 'Active', isDeleted: { $ne: true } });
    const suspendedUsers = await User.countDocuments({ status: 'Suspended', isDeleted: { $ne: true } });
    const inactiveUsers = await User.countDocuments({ status: 'Inactive', isDeleted: { $ne: true } });
    const deletedUsers = await User.countDocuments({ $or: [{ status: 'Deleted' }, { isDeleted: true }] });
    const verifiedEmailUsers = await User.countDocuments({ isEmailVerified: true, isDeleted: { $ne: true } });
    const verifiedPhoneUsers = await User.countDocuments({ isPhoneVerified: true, isDeleted: { $ne: true } });

    // Group by Role
    const roleAggregation = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
        },
      },
    ]);

    const roleBreakdown = {
      'Public User': 0,
      'Rescue Team': 0,
      'Shelter': 0,
      'Veterinary Staff': 0,
      'Admin': 0,
    };

    roleAggregation.forEach((item) => {
      if (roleBreakdown.hasOwnProperty(item._id)) {
        roleBreakdown[item._id] = item.count;
      }
    });

    // Recent Signups this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const signupsThisMonth = await User.countDocuments({
      createdAt: { $gte: startOfMonth },
    });

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        suspendedUsers,
        inactiveUsers,
        verifiedEmailUsers,
        verifiedPhoneUsers,
        signupsThisMonth,
        roleBreakdown,
      },
    });
  } catch (error) {
    console.error('Error fetching user stats:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user statistics',
      error: error.message,
    });
  }
};
