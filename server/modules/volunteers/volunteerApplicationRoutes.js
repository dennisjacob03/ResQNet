const express = require('express');
const router = express.Router();
const {
  submitVolunteerApplication,
  getMyVolunteerApplication,
  getAllVolunteerApplications,
  scheduleVolunteerVisit,
  submitVolunteerVisitReport,
} = require('./volunteerApplicationController');
const { protect, authorizeRoles, requireCompleteProfile } = require('../../middleware/authMiddleware');

// Public User Routes
router.post('/apply', protect, requireCompleteProfile, submitVolunteerApplication);
router.get('/my-application', protect, getMyVolunteerApplication);

// Admin & Rescue Team Management Routes
router.get('/applications', protect, authorizeRoles('Admin', 'Rescue Team'), getAllVolunteerApplications);
router.put('/applications/:id/visit', protect, authorizeRoles('Admin', 'Rescue Team'), scheduleVolunteerVisit);
router.post('/applications/:id/visit-report', protect, authorizeRoles('Admin', 'Rescue Team'), submitVolunteerVisitReport);
router.put('/applications/:id/visit-report', protect, authorizeRoles('Admin', 'Rescue Team'), submitVolunteerVisitReport);

module.exports = router;
