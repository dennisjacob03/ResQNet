const express = require('express');
const router = express.Router();
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getAnimals,
  createAnimal,
  updateAnimal,
  deleteAnimal,
} = require('./animalController');

// Category Routes
router.route('/categories')
  .get(getCategories)
  .post(createCategory);

router.route('/categories/:id')
  .put(updateCategory)
  .delete(deleteCategory);

// Animal Routes
router.route('/')
  .get(getAnimals)
  .post(createAnimal);

router.route('/:id')
  .put(updateAnimal)
  .delete(deleteAnimal);

module.exports = router;
