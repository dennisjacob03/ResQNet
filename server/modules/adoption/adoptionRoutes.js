const express = require('express');
const router = express.Router();
const { protect, authorizeRoles, requireCompleteProfile } = require('../../middleware/authMiddleware');
const {
  createAdoptionApplication,
  getMyApplications,
  checkPetApplication,
  getShelterApplications,
  getApplicationById,
  updateApplicationStatus,
  scheduleAppointment,
  submitVisitReport,
  withdrawApplication,
} = require('./adoptionController');

// Applicant routes
router.post('/', protect, requireCompleteProfile, createAdoptionApplication);
router.get('/my', protect, getMyApplications);
router.get('/check/:petId', protect, checkPetApplication);
router.put('/:id/withdraw', protect, requireCompleteProfile, withdrawApplication);

// Shelter & Admin management routes
router.get('/shelter', protect, authorizeRoles('Shelter', 'Admin'), getShelterApplications);
router.put('/:id/status', protect, authorizeRoles('Shelter', 'Admin'), updateApplicationStatus);
router.put('/:id/appointment', protect, authorizeRoles('Shelter', 'Admin'), scheduleAppointment);
router.post('/:id/visit-report', protect, authorizeRoles('Shelter', 'Admin'), submitVisitReport);

// Single application details (applicant, shelter, or admin)
router.get('/:id', protect, getApplicationById);

module.exports = router;
