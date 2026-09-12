const Shelter = require('./shelterModel');
const User = require('../users/userModel');
const Capacity = require('./capacityModel');
const Cage = require('./cageModel');
const Animal = require('../animals/animalModel');
const ShelterAssignment = require('./shelterAssignmentModel');

/**
 * Helper to evaluate whether a shelter has entered all 3 setup requirements:
 * 1. Capacity table details (at least 1 category capacity with totalCapacity > 0)
 * 2. Cage table details (at least 1 cage configured)
 * 3. Animal details (at least 1 animal registered/assigned to shelter)
 */
const checkShelterSetupReadiness = async (shelterId) => {
  const [capacities, cageCount, animalCount, assignmentCount] = await Promise.all([
    Capacity.find({ shelterId }).lean(),
    Cage.countDocuments({ shelterId }),
    Animal.countDocuments({ shelterId, isDeleted: { $ne: true } }),
    ShelterAssignment.countDocuments({ shelterId }),
  ]);

  const totalCapSum = capacities.reduce((acc, c) => acc + (c.totalCapacity || 0), 0);
  const hasCapacity = capacities.length > 0 && totalCapSum > 0;
  const hasCages = cageCount > 0;
  const effectiveAnimalCount = Math.max(animalCount, assignmentCount);
  const hasAnimals = effectiveAnimalCount > 0;
  const isReady = hasCapacity && hasCages && hasAnimals;

  const missingItems = [];
  if (!hasCapacity) missingItems.push('Capacity details (Category wise)');
  if (!hasCages) missingItems.push('Cage details');
  if (!hasAnimals) missingItems.push('Animal registry details');

  return {
    isReady,
    hasCapacity,
    hasCages,
    hasAnimals,
    capacityCount: capacities.length,
    totalCapacitySum: totalCapSum,
    cageCount,
    animalCount: effectiveAnimalCount,
    missingItems,
  };
};

// @desc    Get all shelters (with optional search and status filters)
// @route   GET /api/shelters
// @access  Public / Authenticated
const getAllShelters = async (req, res) => {
  try {
    const { search, status, shelterStatus, currentStatus } = req.query;
    const filter = { isDeleted: { $ne: true } };

    if (status && status !== 'All') {
      filter.status = status;
    }

    const opStatus = shelterStatus || currentStatus;
    if (opStatus && opStatus !== 'All') {
      filter.$or = [{ shelterStatus: opStatus }, { currentStatus: opStatus }];
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
      shelterStatus = 'UNDER_MAINTENANCE',
      currentStatus = 'UNDER_MAINTENANCE',
      status = 'Active',
      userId,
    } = req.body;

    if (!shelterName || !shelterEmail || !shelterPhoneNumber || latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: shelterName, shelterEmail, shelterPhoneNumber, latitude, longitude.',
      });
    }

    const initialShelterStatus = req.body.shelterStatus || req.body.currentStatus || (req.body.status && ['OPEN', 'FULL', 'UNDER_MAINTENANCE', 'CLOSED'].includes(req.body.status) ? req.body.status : 'UNDER_MAINTENANCE');

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
      shelterStatus: initialShelterStatus,
      status: ['Active', 'Inactive'].includes(status) ? status : 'Active',
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
      'shelterStatus',
      'currentStatus',
      'status',
      'userId',
    ];

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === 'registrationNumber' && typeof req.body[field] === 'string') {
          shelter.registrationNumber = req.body[field].trim().toUpperCase();
        } else if (field === 'currentStatus' || field === 'shelterStatus') {
          shelter.shelterStatus = req.body[field];
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
    shelter.status = 'Inactive';
    shelter.shelterStatus = 'CLOSED';
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

// @desc    Get current authenticated shelter user's shelter details and setup readiness
// @route   GET /api/shelters/my-shelter
// @access  Private (Shelter Manager)
const getMyShelter = async (req, res) => {
  try {
    const userId = req.user._id;
    const userEmail = req.user.email ? req.user.email.toLowerCase().trim() : '';

    let shelter = await Shelter.findOne({
      $or: [
        { userId },
        { shelterEmail: userEmail },
      ],
      isDeleted: { $ne: true },
    }).populate('userId', 'fullName email phoneNumber city state');

    if (!shelter) {
      return res.status(404).json({
        success: false,
        message: 'No registered shelter found associated with this account.',
      });
    }

    // Check setup readiness (capacities, cages, animals)
    const setupReadiness = await checkShelterSetupReadiness(shelter._id);

    res.status(200).json({
      success: true,
      shelter,
      setupReadiness,
    });
  } catch (error) {
    console.error('Get My Shelter Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update current authenticated shelter's operational status (OPEN, FULL, UNDER_MAINTENANCE, CLOSED)
// @route   PATCH /api/shelters/my-shelter/status
// @access  Private (Shelter Manager)
const updateMyShelterStatus = async (req, res) => {
  try {
    const opStatus = req.body.shelterStatus || req.body.currentStatus;
    const validStatuses = ['OPEN', 'FULL', 'UNDER_MAINTENANCE', 'CLOSED'];

    if (!validStatuses.includes(opStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid operational status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const userId = req.user._id;
    const userEmail = req.user.email ? req.user.email.toLowerCase().trim() : '';

    let shelter = await Shelter.findOne({
      $or: [
        { userId },
        { shelterEmail: userEmail },
      ],
      isDeleted: { $ne: true },
    });

    if (!shelter) {
      return res.status(404).json({
        success: false,
        message: 'No registered shelter found associated with this account.',
      });
    }

    // ENFORCE SETUP REQUIREMENT: If trying to change away from UNDER_MAINTENANCE, verify readiness
    if (opStatus !== 'UNDER_MAINTENANCE') {
      const readiness = await checkShelterSetupReadiness(shelter._id);
      if (!readiness.isReady) {
        return res.status(400).json({
          success: false,
          message: `Cannot change operational status from UNDER_MAINTENANCE until facility details are filled. Missing: ${readiness.missingItems.join(', ')}.`,
          setupReadiness: readiness,
        });
      }
    }

    shelter.shelterStatus = opStatus;
    await shelter.save();

    const setupReadiness = await checkShelterSetupReadiness(shelter._id);

    res.status(200).json({
      success: true,
      message: `Shelter operational status updated to ${opStatus}.`,
      shelter,
      setupReadiness,
    });
  } catch (error) {
    console.error('Update My Shelter Status Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ─────────────────────────────────────────────────────────────
   CAPACITY & CAGE & ANIMAL MANAGEMENT FOR SHELTER MANAGERS
───────────────────────────────────────────────────────────── */

// @desc    Get capacities for the logged-in shelter
// @route   GET /api/shelters/my-shelter/capacities
// @access  Private (Shelter Manager)
const getMyShelterCapacities = async (req, res) => {
  try {
    const userId = req.user._id;
    const userEmail = req.user.email ? req.user.email.toLowerCase().trim() : '';

    const shelter = await Shelter.findOne({
      $or: [{ userId }, { shelterEmail: userEmail }],
      isDeleted: { $ne: true },
    });

    if (!shelter) {
      return res.status(404).json({ success: false, message: 'Shelter not found.' });
    }

    const capacities = await Capacity.find({ shelterId: shelter._id })
      .populate('categoryId', 'categoryName description')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: capacities.length, capacities });
  } catch (error) {
    console.error('Get Shelter Capacities Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add or Update capacity for a category in the logged-in shelter
// @route   POST /api/shelters/my-shelter/capacities
// @access  Private (Shelter Manager)
const saveMyShelterCapacity = async (req, res) => {
  try {
    const userId = req.user._id;
    const userEmail = req.user.email ? req.user.email.toLowerCase().trim() : '';

    const shelter = await Shelter.findOne({
      $or: [{ userId }, { shelterEmail: userEmail }],
      isDeleted: { $ne: true },
    });

    if (!shelter) {
      return res.status(404).json({ success: false, message: 'Shelter not found.' });
    }

    const { categoryId, totalCapacity, occupiedCapacity = 0 } = req.body;

    if (!categoryId || totalCapacity === undefined || Number(totalCapacity) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid categoryId and totalCapacity (> 0) are required.',
      });
    }

    let capacity = await Capacity.findOne({ shelterId: shelter._id, categoryId });

    if (capacity) {
      capacity.totalCapacity = Number(totalCapacity);
      capacity.occupiedCapacity = Number(occupiedCapacity);
      await capacity.save();
    } else {
      capacity = await Capacity.create({
        shelterId: shelter._id,
        categoryId,
        totalCapacity: Number(totalCapacity),
        occupiedCapacity: Number(occupiedCapacity),
      });
    }

    const populated = await Capacity.findById(capacity._id).populate('categoryId', 'categoryName description');
    const setupReadiness = await checkShelterSetupReadiness(shelter._id);

    res.status(200).json({
      success: true,
      message: 'Category capacity saved successfully.',
      capacity: populated,
      setupReadiness,
    });
  } catch (error) {
    console.error('Save Shelter Capacity Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get cages for the logged-in shelter
// @route   GET /api/shelters/my-shelter/cages
// @access  Private (Shelter Manager)
const getMyShelterCages = async (req, res) => {
  try {
    const userId = req.user._id;
    const userEmail = req.user.email ? req.user.email.toLowerCase().trim() : '';

    const shelter = await Shelter.findOne({
      $or: [{ userId }, { shelterEmail: userEmail }],
      isDeleted: { $ne: true },
    });

    if (!shelter) {
      return res.status(404).json({ success: false, message: 'Shelter not found.' });
    }

    const cages = await Cage.find({ shelterId: shelter._id })
      .populate('categoryId', 'categoryName')
      .populate('animalId', 'name species breed')
      .sort({ cageNumber: 1 });

    res.status(200).json({ success: true, count: cages.length, cages });
  } catch (error) {
    console.error('Get Shelter Cages Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a cage in the logged-in shelter
// @route   POST /api/shelters/my-shelter/cages
// @access  Private (Shelter Manager)
const createMyShelterCage = async (req, res) => {
  try {
    const userId = req.user._id;
    const userEmail = req.user.email ? req.user.email.toLowerCase().trim() : '';

    const shelter = await Shelter.findOne({
      $or: [{ userId }, { shelterEmail: userEmail }],
      isDeleted: { $ne: true },
    });

    if (!shelter) {
      return res.status(404).json({ success: false, message: 'Shelter not found.' });
    }

    const { categoryId, cageNumber, type = 'Normal', status = 'AVAILABLE', animalId = null } = req.body;

    if (!categoryId || !cageNumber) {
      return res.status(400).json({
        success: false,
        message: 'categoryId and cageNumber are required to create a cage.',
      });
    }

    const existingCage = await Cage.findOne({ shelterId: shelter._id, cageNumber: Number(cageNumber) });
    if (existingCage) {
      return res.status(400).json({
        success: false,
        message: `Cage #${cageNumber} already exists in your facility.`,
      });
    }

    const cage = await Cage.create({
      shelterId: shelter._id,
      categoryId,
      cageNumber: Number(cageNumber),
      type,
      status,
      animalId: animalId || null,
    });

    const populated = await Cage.findById(cage._id)
      .populate('categoryId', 'categoryName')
      .populate('animalId', 'name species breed');

    const setupReadiness = await checkShelterSetupReadiness(shelter._id);

    res.status(201).json({
      success: true,
      message: `Cage #${cage.cageNumber} created successfully.`,
      cage: populated,
      setupReadiness,
    });
  } catch (error) {
    console.error('Create Shelter Cage Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a cage in the logged-in shelter
// @route   DELETE /api/shelters/my-shelter/cages/:cageId
// @access  Private (Shelter Manager)
const deleteMyShelterCage = async (req, res) => {
  try {
    const userId = req.user._id;
    const userEmail = req.user.email ? req.user.email.toLowerCase().trim() : '';

    const shelter = await Shelter.findOne({
      $or: [{ userId }, { shelterEmail: userEmail }],
      isDeleted: { $ne: true },
    });

    if (!shelter) {
      return res.status(404).json({ success: false, message: 'Shelter not found.' });
    }

    const { cageId } = req.params;
    await Cage.findOneAndDelete({ _id: cageId, shelterId: shelter._id });

    const setupReadiness = await checkShelterSetupReadiness(shelter._id);

    res.status(200).json({
      success: true,
      message: 'Cage removed successfully.',
      setupReadiness,
    });
  } catch (error) {
    console.error('Delete Shelter Cage Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get animals for the logged-in shelter
// @route   GET /api/shelters/my-shelter/animals
// @access  Private (Shelter Manager)
const getMyShelterAnimals = async (req, res) => {
  try {
    const userId = req.user._id;
    const userEmail = req.user.email ? req.user.email.toLowerCase().trim() : '';

    const shelter = await Shelter.findOne({
      $or: [{ userId }, { shelterEmail: userEmail }],
      isDeleted: { $ne: true },
    });

    if (!shelter) {
      return res.status(404).json({ success: false, message: 'Shelter not found.' });
    }

    const animals = await Animal.find({ shelterId: shelter._id, isDeleted: { $ne: true } })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: animals.length, animals });
  } catch (error) {
    console.error('Get Shelter Animals Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Register a new animal in the logged-in shelter
// @route   POST /api/shelters/my-shelter/animals
// @access  Private (Shelter Manager)
const createMyShelterAnimal = async (req, res) => {
  try {
    const userId = req.user._id;
    const userEmail = req.user.email ? req.user.email.toLowerCase().trim() : '';

    const shelter = await Shelter.findOne({
      $or: [{ userId }, { shelterEmail: userEmail }],
      isDeleted: { $ne: true },
    });

    if (!shelter) {
      return res.status(404).json({ success: false, message: 'Shelter not found.' });
    }

    const {
      name,
      species,
      breed = '',
      gender = 'Unknown',
      approxAge = '',
      color = '',
      cageNumber = '',
      healthCondition = 'Healthy',
      status = 'Rescued',
      neutered = false,
      spayedNeutered = false,
      about = '',
      photo = '',
      facePhoto = '',
      fullBodyPhoto = '',
      photos = [],
      video = '',
      currentSize = 'Medium',
      weight = '',
      vaccinations = [],
      vaccinationDate = '',
      microchipped = false,
      microchipNumber = '',
      specialMedicalNeeds = 'None',
      energyLevel = 'Moderate',
      training = 'House-trained, Basic commands',
      backgroundStory = '',
      shelterCity = '',
      shelterState = '',
      shelterRegistrationNumber = '',
    } = req.body;

    if (!species || !species.trim()) {
      return res.status(400).json({ success: false, message: 'Species is required.' });
    }

    const isNeutered = neutered !== undefined ? Boolean(neutered) : Boolean(spayedNeutered);

    const animal = await Animal.create({
      name: name ? name.trim() : '',
      species: species.trim(),
      breed: breed.trim(),
      gender,
      approxAge,
      color,
      cageNumber,
      healthCondition,
      status,
      neutered: isNeutered,
      spayedNeutered: isNeutered,
      about: about ? about.trim() : '',
      photo: photo || facePhoto || '',
      facePhoto: facePhoto || photo || '',
      fullBodyPhoto: fullBodyPhoto || '',
      photos: Array.isArray(photos) ? photos : [],
      video: video || '',
      currentSize: currentSize || 'Medium',
      weight: weight ? String(weight).trim() : '',
      vaccinations: Array.isArray(vaccinations) ? vaccinations : [],
      vaccinationDate: vaccinationDate || '',
      microchipped: Boolean(microchipped),
      microchipNumber: microchipNumber || '',
      specialMedicalNeeds: specialMedicalNeeds || 'None',
      energyLevel: energyLevel || 'Moderate',
      training: training || 'House-trained, Basic commands',
      backgroundStory: backgroundStory ? backgroundStory.trim() : '',
      shelterCity: shelterCity || shelter.city || '',
      shelterState: shelterState || shelter.state || '',
      shelterRegistrationNumber: shelterRegistrationNumber || shelter.registrationNumber || '',
      shelterId: shelter._id,
      shelterName: shelter.shelterName,
      userId: req.user._id,
    });

    const setupReadiness = await checkShelterSetupReadiness(shelter._id);

    res.status(201).json({
      success: true,
      message: `Animal ${animal.name || animal.animalId} registered successfully.`,
      animal,
      setupReadiness,
    });
  } catch (error) {
    console.error('Create Shelter Animal Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a category capacity for the logged-in shelter
// @route   DELETE /api/shelters/my-shelter/capacities/:capacityId
// @access  Private (Shelter Manager)
const deleteMyShelterCapacity = async (req, res) => {
  try {
    const userId = req.user._id;
    const userEmail = req.user.email ? req.user.email.toLowerCase().trim() : '';

    const shelter = await Shelter.findOne({
      $or: [{ userId }, { shelterEmail: userEmail }],
      isDeleted: { $ne: true },
    });

    if (!shelter) {
      return res.status(404).json({ success: false, message: 'Shelter not found.' });
    }

    const { capacityId } = req.params;
    await Capacity.findOneAndDelete({ _id: capacityId, shelterId: shelter._id });

    const setupReadiness = await checkShelterSetupReadiness(shelter._id);

    res.status(200).json({
      success: true,
      message: 'Category capacity removed successfully.',
      setupReadiness,
    });
  } catch (error) {
    console.error('Delete Shelter Capacity Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a cage in the logged-in shelter (status, type, assigned animal)
// @route   PUT /api/shelters/my-shelter/cages/:cageId
// @access  Private (Shelter Manager)
const updateMyShelterCage = async (req, res) => {
  try {
    const userId = req.user._id;
    const userEmail = req.user.email ? req.user.email.toLowerCase().trim() : '';

    const shelter = await Shelter.findOne({
      $or: [{ userId }, { shelterEmail: userEmail }],
      isDeleted: { $ne: true },
    });

    if (!shelter) {
      return res.status(404).json({ success: false, message: 'Shelter not found.' });
    }

    const { cageId } = req.params;
    const cage = await Cage.findOne({ _id: cageId, shelterId: shelter._id });

    if (!cage) {
      return res.status(404).json({ success: false, message: 'Cage not found.' });
    }

    const { type, status, animalId, categoryId, cageNumber } = req.body;
    if (type !== undefined) cage.type = type;
    if (status !== undefined) cage.status = status;
    if (animalId !== undefined) cage.animalId = animalId || null;
    if (categoryId !== undefined) cage.categoryId = categoryId;
    if (cageNumber !== undefined) cage.cageNumber = Number(cageNumber);

    await cage.save();

    const populated = await Cage.findById(cage._id)
      .populate('categoryId', 'categoryName')
      .populate('animalId', 'name species breed');

    res.status(200).json({
      success: true,
      message: `Cage #${cage.cageNumber} updated successfully.`,
      cage: populated,
    });
  } catch (error) {
    console.error('Update Shelter Cage Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllShelters,
  getShelterById,
  getMyShelter,
  updateMyShelterStatus,
  createShelter,
  updateShelter,
  deleteShelter,
  getMyShelterCapacities,
  saveMyShelterCapacity,
  deleteMyShelterCapacity,
  getMyShelterCages,
  createMyShelterCage,
  updateMyShelterCage,
  deleteMyShelterCage,
  getMyShelterAnimals,
  createMyShelterAnimal,
};
