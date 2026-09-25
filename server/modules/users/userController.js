const User = require('./userModel');
const LoginLog = require('./loginModel');
const RescueTeam = require('../rescues/rescueTeamModel');
const Shelter = require('../shelters/shelterModel');
const VetStaff = require('../shelters/vetStaffModel');
const { getAuth } = require('firebase-admin/auth');
const { sendAdminCreatedUserEmail } = require('../../utils/emailService');

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

    // Prevent any admin account from being suspended
    if (user.role === 'Admin' && status === 'Suspended') {
      return res.status(400).json({
        success: false,
        message: 'An Admin user account cannot be suspended',
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

// @desc    Create a new user directly by Admin with role-based details & credentials
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
      state = 'Kerala',
      pincode = '',
      status = 'Active',
      isEmailVerified = true,
      isPhoneVerified = true,
      dob = null,
      // Rescue Team specific
      teamName,
      vehicleNumber,
      vehicleType,
      operatingDistrict,
      coverageZone,
      totalMembers,
      equipment,
      latitude,
      longitude,
      availability,
      // Shelter specific
      shelterName,
      registrationType,
      registrationNumber,
      shelterPhoneNumber,
      shelterEmail,
      totalStaffs,
      totalCages,
      occupiedCages,
      shelterStatus,
      // Veterinary Staff specific
      shelterId,
      position,
      councilRegistrationNumber,
      qualification,
      specialization,
      experience,
      joiningDate,
      // Admin specific
      adminDepartment,
      adminAccessLevel,
    } = req.body;

    // Validate role (Admin cannot be provisioned here)
    const validRoles = [
      'Public User',
      'Rescue Team',
      'Shelter',
      'Veterinary Staff',
    ];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Provisioning Admin accounts directly is not permitted. Valid options: ${validRoles.join(', ')}`,
      });
    }

    // Resolve effective full name based on role:
    // For Rescue Team: teamName is used as the account full name
    // For Shelter: shelterName is used as the account full name
    let resolvedFullName = (fullName || '').trim();

    if (role === 'Rescue Team') {
      if (!teamName || !teamName.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Rescue Team Name is required',
        });
      }
      if (teamName.trim().length < 3) {
        return res.status(400).json({
          success: false,
          message: 'Rescue Team Name must be at least 3 characters',
        });
      }
      resolvedFullName = teamName.trim();
    } else if (role === 'Shelter') {
      if (!shelterName || !shelterName.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Shelter Facility Name is required',
        });
      }
      if (shelterName.trim().length < 3) {
        return res.status(400).json({
          success: false,
          message: 'Shelter Facility Name must be at least 3 characters',
        });
      }
      resolvedFullName = shelterName.trim();
    } else {
      // Public User & Veterinary Staff require standard personal full name
      if (!resolvedFullName) {
        return res.status(400).json({
          success: false,
          message: 'Full Name is required',
        });
      }

      if (resolvedFullName.length < 2 || !/^[a-zA-Z\s.]+$/.test(resolvedFullName)) {
        return res.status(400).json({
          success: false,
          message: 'Full Name must be at least 2 characters and contain only letters, dots, and spaces',
        });
      }
    }

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required',
      });
    }

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address (e.g. name@example.com)',
      });
    }

    if (!phoneNumber || !phoneNumber.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required',
      });
    }

    const cleanPhone = phoneNumber.trim().replace(/\D/g, '').slice(-10);
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        message: 'Phone number must be a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9',
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Temporary password is required',
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Temporary password must be at least 8 characters long',
      });
    }

    // Role-specific validations
    if (role === 'Rescue Team') {
      if (!vehicleType) {
        return res.status(400).json({
          success: false,
          message: 'Vehicle type is required for Rescue Team',
        });
      }
      if (!vehicleNumber || !vehicleNumber.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Vehicle registration number is required for Rescue Team',
        });
      }
      const vNum = vehicleNumber.trim().toUpperCase();
      if (!/^[A-Z]{2}[ -]?[0-9]{1,2}[ -]?[A-Z]{1,3}[ -]?[0-9]{4}$/i.test(vNum)) {
        return res.status(400).json({
          success: false,
          message: 'Enter a valid Indian vehicle number (e.g. KL-07-AB-1234)',
        });
      }
      if (!operatingDistrict || !operatingDistrict.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Operating District is required for Rescue Team',
        });
      }
    } else if (role === 'Shelter') {
      if (!registrationType) {
        return res.status(400).json({
          success: false,
          message: 'Registration Type is required for Shelter',
        });
      }
      if (!registrationNumber || registrationNumber.trim().length < 3) {
        return res.status(400).json({
          success: false,
          message: 'Registration Number is required for Shelter (min 3 characters)',
        });
      }
      const numCages = Number(totalCages);
      if (isNaN(numCages) || numCages < 1) {
        return res.status(400).json({
          success: false,
          message: 'Total cages must be a positive number of at least 1',
        });
      }
    } else if (role === 'Veterinary Staff') {
      if (!position) {
        return res.status(400).json({
          success: false,
          message: 'Position is required for Veterinary Staff (e.g. Veterinary Doctor or Veterinary Nurse)',
        });
      }
      if (!councilRegistrationNumber || councilRegistrationNumber.trim().length < 4) {
        return res.status(400).json({
          success: false,
          message: 'Council Registration Number is mandatory for Veterinary Staff (min 4 characters)',
        });
      }
      if (!qualification || !qualification.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Qualification is required for Veterinary Staff',
        });
      }
      if (!shelterId) {
        return res.status(400).json({
          success: false,
          message: 'Please assign the Veterinary Staff to a Shelter',
        });
      }
    }

    // Check if email is already registered
    const userExists = await User.findOne({ email: email.toLowerCase().trim() });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists',
      });
    }

    // Provision user in Firebase Auth if available
    let firebaseUid = null;
    try {
      const fbUser = await getAuth().createUser({
        email: email.toLowerCase().trim(),
        password: password,
        displayName: resolvedFullName,
      });
      firebaseUid = fbUser.uid;
    } catch (fbErr) {
      console.warn('Firebase Auth creation skipped/failed:', fbErr.message);
    }

    // Create User record in MongoDB
    const newUser = await User.create({
      fullName: resolvedFullName,
      email: email.toLowerCase().trim(),
      phoneNumber: cleanPhone,
      password,
      role,
      address: address.trim(),
      city: city.trim(),
      district: district.trim() || operatingDistrict?.trim() || '',
      state: state.trim() || 'Kerala',
      pincode: pincode.trim(),
      status,
      isEmailVerified: Boolean(isEmailVerified),
      isPhoneVerified: Boolean(isPhoneVerified),
      dob: dob ? new Date(dob) : null,
      ...(firebaseUid ? { firebaseUid } : {}),
    });

    let roleRecord = null;

    // Create corresponding entity based on role
    if (role === 'Rescue Team') {
      roleRecord = await RescueTeam.create({
        userId: newUser._id,
        teamName: resolvedFullName,
        vehicleNumber: vehicleNumber.trim().toUpperCase(),
        vehicleType,
        operatingDistrict: operatingDistrict.trim(),
        contactPhone: cleanPhone,
        latitude: latitude ? Number(latitude) : 9.9312,
        longitude: longitude ? Number(longitude) : 76.2673,
        currentLocation: {
          latitude: latitude ? Number(latitude) : 9.9312,
          longitude: longitude ? Number(longitude) : 76.2673,
          updatedAt: new Date(),
        },
        availability: availability || 'Available',
        status: status === 'Active' ? 'Active' : 'Inactive',
      });
    } else if (role === 'Shelter') {
      const shelterContactNum = shelterPhoneNumber
        ? Number(String(shelterPhoneNumber).replace(/\D/g, '').slice(-10))
        : Number(cleanPhone);

      roleRecord = await Shelter.create({
        userId: newUser._id,
        shelterName: resolvedFullName,
        registrationType: registrationType || 'STATE_TRUST_SOCIETY',
        registrationNumber: registrationNumber.trim().toUpperCase(),
        shelterEmail: (shelterEmail || email).toLowerCase().trim(),
        shelterPhoneNumber: shelterContactNum || Number(cleanPhone),
        latitude: latitude ? Number(latitude) : 9.9312,
        longitude: longitude ? Number(longitude) : 76.2673,
        totalStaffs: totalStaffs !== undefined ? Math.max(0, Number(totalStaffs)) : 1,
        totalCages: Math.max(1, Number(totalCages) || 10),
        occupiedCages: occupiedCages !== undefined ? Math.max(0, Number(occupiedCages)) : 0,
        shelterStatus: shelterStatus || 'OPEN',
        status: status === 'Active' ? 'Active' : 'Inactive',
      });
    } else if (role === 'Veterinary Staff') {
      let targetShelter = null;
      if (shelterId) {
        targetShelter = await Shelter.findById(shelterId);
      }
      if (!targetShelter) {
        targetShelter = await Shelter.findOne({ status: 'Active' });
      }

      if (targetShelter) {
        roleRecord = await VetStaff.create({
          shelterId: targetShelter._id,
          userId: newUser._id,
          fullName: resolvedFullName,
          email: email.toLowerCase().trim(),
          phone: cleanPhone,
          councilRegistrationNumber: councilRegistrationNumber.trim(),
          qualification: qualification?.trim() || 'BVSc & AH',
          specialization: specialization?.trim() || 'General Practice',
          position: position || 'Veterinary Doctor',
          experience: experience !== undefined ? Math.max(0, Number(experience)) : 0,
          joiningDate: joiningDate ? new Date(joiningDate) : new Date(),
          availability: 'Available',
          status: status === 'Active' ? 'Active' : 'Inactive',
        });
      }
    }

    // Dispatch credentials email with temporary password to the user's email address
    let emailSent = false;
    try {
      const emailRes = await sendAdminCreatedUserEmail(newUser.email, {
        fullName: newUser.fullName,
        role: newUser.role,
        temporaryPassword: password,
        roleDetails: roleRecord ? roleRecord.toObject() : {},
      });
      emailSent = emailRes?.success || false;
      console.log(`📧 Credentials email sent to ${newUser.email}:`, emailSent);
    } catch (emailErr) {
      console.warn('Failed to send admin created user email:', emailErr.message);
    }

    const userObj = newUser.toObject();
    delete userObj.password;

    res.status(201).json({
      success: true,
      message: `User "${userObj.fullName}" created successfully as ${userObj.role}. Temporary password sent to ${newUser.email}.`,
      user: userObj,
      roleRecord,
      emailSent,
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
