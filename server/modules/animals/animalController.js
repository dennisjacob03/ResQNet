const mongoose = require('mongoose');
const Category = require('./categoryModel');
const Animal = require('./animalModel');

// Default initial categories to seed if collection is empty
const INITIAL_CATEGORIES = [
  {
    categoryName: 'Dog',
    description: 'Canine species including all domesticated breeds, stray dogs, and puppies.',
    status: 'Active',
  },
  {
    categoryName: 'Cat',
    description: 'Feline species including domestic cats, kittens, and feral rescue cats.',
    status: 'Active',
  },
  {
    categoryName: 'Bird',
    description: 'Avian species including pigeons, parrots, injured wild birds, and raptors.',
    status: 'Active',
  },
  {
    categoryName: 'Cow',
    description: 'Bovine animals including street cattle, calves, and rescued dairy cows.',
    status: 'Active',
  },
  {
    categoryName: 'Other',
    description: 'Other rescued wildlife, horses, goats, rabbits, reptiles, and miscellaneous fauna.',
    status: 'Active',
  },
];

/* ─────────────────────────────────────────────
   CATEGORY CONTROLLERS
───────────────────────────────────────────── */

// @desc    Get all animal categories (auto-seeds defaults if empty)
// @route   GET /api/animals/categories
// @access  Public / Authenticated
const getCategories = async (req, res) => {
  try {
    let categories = await Category.find().sort({ createdAt: 1 });

    // Seed defaults if empty
    if (categories.length === 0) {
      for (const item of INITIAL_CATEGORIES) {
        await Category.create(item);
      }
      categories = await Category.find().sort({ createdAt: 1 });
    }

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    console.error('Error fetching animal categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories: ' + error.message,
    });
  }
};

// @desc    Create a new animal category
// @route   POST /api/animals/categories
// @access  Admin / Shelter
const createCategory = async (req, res) => {
  try {
    const { categoryName, description, status } = req.body;

    if (!categoryName || !categoryName.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required',
      });
    }

    // Check if category name already exists (case-insensitive)
    const existing = await Category.findOne({
      categoryName: { $regex: new RegExp(`^${categoryName.trim()}$`, 'i') },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Category "${categoryName.trim()}" already exists (ID: ${existing.categoryId})`,
      });
    }

    const category = await Category.create({
      categoryName: categoryName.trim(),
      description: description ? description.trim() : '',
      status: status === 'Inactive' ? 'Inactive' : 'Active',
    });

    res.status(201).json({
      success: true,
      message: `Category "${category.categoryName}" created successfully with ID ${category.categoryId}`,
      data: category,
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create category: ' + error.message,
    });
  }
};

// @desc    Update animal category
// @route   PUT /api/animals/categories/:id
// @access  Admin
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { categoryName, description, status } = req.body;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    if (categoryName && categoryName.trim()) {
      // Check duplicate name
      const duplicate = await Category.findOne({
        _id: { $ne: id },
        categoryName: { $regex: new RegExp(`^${categoryName.trim()}$`, 'i') },
      });
      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: `Category name "${categoryName.trim()}" is already used by another record.`,
        });
      }
      category.categoryName = categoryName.trim();
    }

    if (description !== undefined) category.description = description.trim();
    if (status !== undefined) category.status = status;

    await category.save();

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: category,
    });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update category: ' + error.message,
    });
  }
};

// @desc    Delete animal category
// @route   DELETE /api/animals/categories/:id
// @access  Admin
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    await Category.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: `Category ${category.categoryId} (${category.categoryName}) deleted successfully`,
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete category: ' + error.message,
    });
  }
};

/* ─────────────────────────────────────────────
   ANIMAL CONTROLLERS
───────────────────────────────────────────── */

// @desc    Get all registered animals
// @route   GET /api/animals
// @access  Public / Authenticated
const getAnimals = async (req, res) => {
  try {
    const { species, status, healthCondition, search } = req.query;
    const query = { isDeleted: false };

    if (species && species !== 'All') {
      query.species = { $regex: new RegExp(`^${species}$`, 'i') };
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (healthCondition && healthCondition !== 'All') {
      query.healthCondition = healthCondition;
    }

    if (search) {
      query.$or = [
        { animalId: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { breed: { $regex: search, $options: 'i' } },
        { shelterName: { $regex: search, $options: 'i' } },
        { cageNumber: { $regex: search, $options: 'i' } },
      ];
    }

    let animals = await Animal.find(query)
      .populate({
        path: 'shelterId',
        select: 'shelterName shelterNumber registrationNumber registrationType shelterPhoneNumber shelterEmail userId',
        populate: { path: 'userId', select: 'city state address phoneNumber email fullName' },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: animals.length,
      data: animals,
      animals,
    });
  } catch (error) {
    console.error('Error fetching animals:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch animals: ' + error.message,
    });
  }
};

// @desc    Get single animal by ID or animalId
// @route   GET /api/animals/:id
// @access  Public / Authenticated
const getAnimalById = async (req, res) => {
  try {
    const { id } = req.params;
    let query = { isDeleted: { $ne: true } };

    if (mongoose.Types.ObjectId.isValid(id)) {
      query.$or = [{ _id: id }, { animalId: id }];
    } else {
      query.animalId = id;
    }

    const animal = await Animal.findOne(query).populate({
      path: 'shelterId',
      select: 'shelterName shelterNumber registrationNumber registrationType shelterPhoneNumber shelterEmail userId',
      populate: { path: 'userId', select: 'city state address phoneNumber email fullName' },
    });

    if (!animal) {
      return res.status(404).json({
        success: false,
        message: 'Animal record not found',
      });
    }

    res.status(200).json({
      success: true,
      animal,
      data: animal,
    });
  } catch (error) {
    console.error('Error fetching animal details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch animal details: ' + error.message,
    });
  }
};

// @desc    Create / Register a new animal
// @route   POST /api/animals
// @access  Admin / Shelter
const createAnimal = async (req, res) => {
  try {
    const {
      name,
      species,
      breed,
      gender,
      approxAge,
      color,
      cageNumber,
      healthCondition,
      status,
      photo,
      facePhoto,
      fullBodyPhoto,
      photos,
      video,
      currentSize,
      weight,
      neutered,
      spayedNeutered,
      vaccinations,
      vaccinationDate,
      microchipped,
      microchipNumber,
      specialMedicalNeeds,
      energyLevel,
      training,
      about,
      backgroundStory,
      shelterCity,
      shelterState,
      shelterRegistrationNumber,
      shelterName,
      shelterId,
    } = req.body;

    if (!species || !species.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Animal species is required',
      });
    }

    const isNeutered = neutered !== undefined ? Boolean(neutered) : Boolean(spayedNeutered);

    const animal = await Animal.create({
      name: name ? name.trim() : '',
      species: species.trim(),
      breed: breed ? breed.trim() : '',
      gender: gender || 'Unknown',
      approxAge: approxAge ? String(approxAge).trim() : '',
      color: color ? color.trim() : '',
      cageNumber: cageNumber ? cageNumber.trim() : '',
      healthCondition: healthCondition || 'Healthy',
      status: status || 'Available',
      photo: photo || facePhoto || '',
      facePhoto: facePhoto || photo || '',
      fullBodyPhoto: fullBodyPhoto || '',
      photos: Array.isArray(photos) ? photos : [],
      video: video || '',
      currentSize: currentSize || 'Medium',
      weight: weight ? String(weight).trim() : '',
      neutered: isNeutered,
      spayedNeutered: isNeutered,
      vaccinations: Array.isArray(vaccinations) ? vaccinations : [],
      vaccinationDate: vaccinationDate || '',
      microchipped: Boolean(microchipped),
      microchipNumber: microchipNumber || '',
      specialMedicalNeeds: specialMedicalNeeds || 'None',
      energyLevel: energyLevel || 'Moderate',
      training: training || 'House-trained, Basic commands',
      about: about ? about.trim() : '',
      backgroundStory: backgroundStory ? backgroundStory.trim() : '',
      shelterCity: shelterCity ? shelterCity.trim() : '',
      shelterState: shelterState ? shelterState.trim() : '',
      shelterRegistrationNumber: shelterRegistrationNumber ? shelterRegistrationNumber.trim() : '',
      shelterName: shelterName ? shelterName.trim() : 'Central Animal Registry',
      shelterId: shelterId || null,
      userId: req.user?._id || null,
    });

    res.status(201).json({
      success: true,
      message: `Animal ${animal.name ? animal.name + ' ' : ''}(${animal.animalId}) registered successfully`,
      data: animal,
      animal,
    });
  } catch (error) {
    console.error('Error registering animal:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register animal: ' + error.message,
    });
  }
};

// @desc    Update animal record
// @route   PUT /api/animals/:id
// @access  Admin / Shelter
const updateAnimal = async (req, res) => {
  try {
    const { id } = req.params;
    const animal = await Animal.findById(id);

    if (!animal) {
      return res.status(404).json({
        success: false,
        message: 'Animal record not found',
      });
    }

    const fields = [
      'name',
      'species',
      'breed',
      'gender',
      'approxAge',
      'color',
      'cageNumber',
      'healthCondition',
      'status',
      'photo',
      'facePhoto',
      'fullBodyPhoto',
      'photos',
      'video',
      'currentSize',
      'weight',
      'neutered',
      'spayedNeutered',
      'vaccinations',
      'vaccinationDate',
      'microchipped',
      'microchipNumber',
      'specialMedicalNeeds',
      'energyLevel',
      'training',
      'about',
      'backgroundStory',
      'shelterCity',
      'shelterState',
      'shelterRegistrationNumber',
      'shelterName',
      'shelterId',
    ];

    fields.forEach((f) => {
      if (req.body[f] !== undefined) {
        animal[f] = req.body[f];
      }
    });

    if (req.body.spayedNeutered !== undefined && req.body.neutered === undefined) {
      animal.neutered = Boolean(req.body.spayedNeutered);
    }
    if (req.body.neutered !== undefined && req.body.spayedNeutered === undefined) {
      animal.spayedNeutered = Boolean(req.body.neutered);
    }

    await animal.save();

    res.status(200).json({
      success: true,
      message: 'Animal record updated successfully',
      data: animal,
      animal,
    });
  } catch (error) {
    console.error('Error updating animal:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update animal: ' + error.message,
    });
  }
};

// @desc    Delete animal record
// @route   DELETE /api/animals/:id
// @access  Admin
const deleteAnimal = async (req, res) => {
  try {
    const { id } = req.params;
    const animal = await Animal.findById(id);

    if (!animal) {
      return res.status(404).json({
        success: false,
        message: 'Animal not found',
      });
    }

    animal.isDeleted = true;
    animal.deletedAt = new Date();
    await animal.save();

    res.status(200).json({
      success: true,
      message: `Animal ${animal.animalId} removed from registry`,
    });
  } catch (error) {
    console.error('Error deleting animal:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete animal: ' + error.message,
    });
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getAnimals,
  getAnimalById,
  createAnimal,
  updateAnimal,
  deleteAnimal,
};
