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
} = require('./shelterController');
const { protect, authorizeRoles } = require('../../middleware/authMiddleware');
const { validateShelterRegistration } = require('./shelterValidation');

// Application routes
router.post('/apply', protect, validateShelterRegistration, submitApplication);
router.get('/my-application', protect, getMyApplication);
router.get('/applications', protect, authorizeRoles('Admin'), getAllApplications);
router.put('/applications/:id/review', protect, authorizeRoles('Admin'), reviewApplication);

// Shelter Management routes for logged-in Shelter Managers
router.get('/my-shelter', protect, getMyShelter);
router.patch('/my-shelter/status', protect, updateMyShelterStatus);

// Shelter Setup & Data Management (Capacities, Cages, Animals)
router.get('/my-shelter/capacities', protect, getMyShelterCapacities);
router.post('/my-shelter/capacities', protect, saveMyShelterCapacity);
router.delete('/my-shelter/capacities/:capacityId', protect, deleteMyShelterCapacity);
router.get('/my-shelter/cages', protect, getMyShelterCages);
router.post('/my-shelter/cages', protect, createMyShelterCage);
router.put('/my-shelter/cages/:cageId', protect, updateMyShelterCage);
router.delete('/my-shelter/cages/:cageId', protect, deleteMyShelterCage);
router.get('/my-shelter/animals', protect, getMyShelterAnimals);
router.post('/my-shelter/animals', protect, createMyShelterAnimal);

// Shelter CRUD routes
router.get('/', getAllShelters);
router.get('/:id', getShelterById);
router.post('/', protect, authorizeRoles('Admin'), validateShelterRegistration, createShelter);
router.put('/:id', protect, authorizeRoles('Admin', 'Shelter'), updateShelter);
router.delete('/:id', protect, authorizeRoles('Admin'), deleteShelter);

module.exports = router;

