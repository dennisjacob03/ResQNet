const express = require('express');
const router = express.Router();
const {
  submitApplication,
  getMyApplication,
  getAllApplications,
  reviewApplication,
} = require('./shelterApplicationController');
const {
  getAllShelters,
  getShelterById,
  createShelter,
  updateShelter,
  deleteShelter,
} = require('./shelterController');
const { protect, authorizeRoles } = require('../../middleware/authMiddleware');
const { validateShelterRegistration } = require('./shelterValidation');

// Application routes
router.post('/apply', protect, validateShelterRegistration, submitApplication);
router.get('/my-application', protect, getMyApplication);
router.get('/applications', protect, authorizeRoles('Admin'), getAllApplications);
router.put('/applications/:id/review', protect, authorizeRoles('Admin'), reviewApplication);

// Shelter CRUD routes
router.get('/', getAllShelters);
router.get('/:id', getShelterById);
router.post('/', protect, authorizeRoles('Admin'), validateShelterRegistration, createShelter);
router.put('/:id', protect, authorizeRoles('Admin', 'Shelter'), updateShelter);
router.delete('/:id', protect, authorizeRoles('Admin'), deleteShelter);

module.exports = router;

