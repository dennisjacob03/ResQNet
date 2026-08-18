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
    const { species, status, search } = req.query;
    const query = { isDeleted: false };

    if (species && species !== 'All') {
      query.species = { $regex: new RegExp(`^${species}$`, 'i') };
    }

    if (status && status !== 'All') {
      query.status = status;
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

    let animals = await Animal.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: animals.length,
      data: animals,
    });
  } catch (error) {
    console.error('Error fetching animals:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch animals: ' + error.message,
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
      shelterName,
      shelterId,
    } = req.body;

    if (!species || !species.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Animal species is required',
      });
    }

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
      photo: photo || '',
      shelterName: shelterName ? shelterName.trim() : 'Central Animal Registry',
      shelterId: shelterId || null,
      userId: req.user?._id || null,
    });

    res.status(201).json({
      success: true,
      message: `Animal ${animal.name ? animal.name + ' ' : ''}(${animal.animalId}) registered successfully`,
      data: animal,
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
      'shelterName',
    ];

    fields.forEach((f) => {
      if (req.body[f] !== undefined) {
        animal[f] = req.body[f];
      }
    });

    await animal.save();

    res.status(200).json({
      success: true,
      message: 'Animal record updated successfully',
      data: animal,
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
  createAnimal,
  updateAnimal,
  deleteAnimal,
};
