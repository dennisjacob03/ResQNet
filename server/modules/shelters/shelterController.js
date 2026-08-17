const Shelter = require('./shelterModel');
const User = require('../users/userModel');

// @desc    Get all shelters (with optional search and status filters)
// @route   GET /api/shelters
// @access  Public / Authenticated
const getAllShelters = async (req, res) => {
  try {
    const { search, status } = req.query;
    const filter = { isDeleted: { $ne: true } };

    if (status && status !== 'All') {
      filter.status = status;
    }

    if (search && search.trim()) {
      const term = search.trim();
      filter.$or = [
        { shelterName: { $regex: term, $options: 'i' } },
        { shelterNumber: { $regex: term, $options: 'i' } },
        { shelterEmail: { $regex: term, $options: 'i' } },
      ];
    }

    const shelters = await Shelter.find(filter)
      .sort({ createdAt: -1 })
      .populate('userId', 'fullName email phoneNumber city state');

    res.status(200).json({
      success: true,
      count: shelters.length,
      shelters,
    });
  } catch (error) {
    console.error('Get All Shelters Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single shelter by ID or shelterNumber
// @route   GET /api/shelters/:id
// @access  Public / Authenticated
const getShelterById = async (req, res) => {
  try {
    const { id } = req.params;
    let shelter;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      shelter = await Shelter.findById(id).populate(
        'userId',
        'fullName email phoneNumber city state'
      );
    } else {
      shelter = await Shelter.findOne({
        shelterNumber: id.toUpperCase(),
      }).populate('userId', 'fullName email phoneNumber city state');
    }

    if (!shelter || shelter.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Shelter not found.',
      });
    }

    res.status(200).json({ success: true, shelter });
  } catch (error) {
    console.error('Get Shelter By ID Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new shelter directly (Admin)
// @route   POST /api/shelters
// @access  Private/Admin
const createShelter = async (req, res) => {
  try {
    const {
      shelterName,
      shelterEmail,
      shelterPhoneNumber,
      registrationType = 'STATE_TRUST_SOCIETY',
      registrationNumber = '',
      latitude,
      longitude,
      totalStaffs = 0,
      totalCages = 0,
      occupiedCages = 0,
      status = 'UNDER_MAINTENANCE',
      userId,
    } = req.body;

    if (!shelterName || !shelterEmail || !shelterPhoneNumber || latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: shelterName, shelterEmail, shelterPhoneNumber, latitude, longitude.',
      });
    }

    const shelter = await Shelter.create({
      shelterName: shelterName.trim(),
      shelterEmail: shelterEmail.trim().toLowerCase(),
      shelterPhoneNumber: Number(shelterPhoneNumber),
      registrationType,
      registrationNumber: registrationNumber ? registrationNumber.trim().toUpperCase() : '',
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      totalStaffs: Number(totalStaffs),
      totalCages: Number(totalCages),
      occupiedCages: Number(occupiedCages),
      status,
      userId: userId || req.user._id,
    });

    const populated = await Shelter.findById(shelter._id).populate(
      'userId',
      'fullName email phoneNumber city state'
    );

    res.status(201).json({
      success: true,
      message: `Shelter ${shelter.shelterNumber} created successfully.`,
      shelter: populated,
    });
  } catch (error) {
    console.error('Create Shelter Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update an existing shelter (Admin / Shelter Manager)
// @route   PUT /api/shelters/:id
// @access  Private
const updateShelter = async (req, res) => {
  try {
    const { id } = req.params;
    const shelter = await Shelter.findById(id);

    if (!shelter || shelter.isDeleted) {
      return res.status(404).json({ success: false, message: 'Shelter not found.' });
    }

    const allowedUpdates = [
      'shelterName',
      'shelterEmail',
      'shelterPhoneNumber',
      'registrationType',
      'registrationNumber',
      'latitude',
      'longitude',
      'totalStaffs',
      'totalCages',
      'occupiedCages',
      'status',
      'userId',
    ];

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === 'registrationNumber' && typeof req.body[field] === 'string') {
          shelter[field] = req.body[field].trim().toUpperCase();
        } else {
          shelter[field] = req.body[field];
        }
      }
    });

    await shelter.save();

    const updated = await Shelter.findById(shelter._id).populate(
      'userId',
      'fullName email phoneNumber city state'
    );

    res.status(200).json({
      success: true,
      message: `Shelter ${shelter.shelterNumber} updated successfully.`,
      shelter: updated,
    });
  } catch (error) {
    console.error('Update Shelter Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a shelter (Soft delete - preserves historical records)
// @route   DELETE /api/shelters/:id
// @access  Private/Admin
const deleteShelter = async (req, res) => {
  try {
    const { id } = req.params;
    const shelter = await Shelter.findById(id);

    if (!shelter || shelter.isDeleted) {
      return res.status(404).json({ success: false, message: 'Shelter not found.' });
    }

    // Soft delete shelter
    shelter.isDeleted = true;
    shelter.status = 'CLOSED';
    shelter.deletedAt = new Date();
    await shelter.save();

    res.status(200).json({
      success: true,
      message: `Shelter ${shelter.shelterNumber} has been deactivated (soft deleted) successfully.`,
    });
  } catch (error) {
    console.error('Delete Shelter Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllShelters,
  getShelterById,
  createShelter,
  updateShelter,
  deleteShelter,
};
