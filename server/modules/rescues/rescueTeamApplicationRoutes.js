const express = require('express');
const router = express.Router();
const {
  submitRescueTeamApplication,
  getMyRescueTeamApplication,
  getAllRescueTeamApplications,
  scheduleTeamVisit,
  submitTeamVisitReport,
} = require('./rescueTeamApplicationController');
const { protect, authorizeRoles, requireCompleteProfile } = require('../../middleware/authMiddleware');

// Public User Routes
router.post('/apply', protect, requireCompleteProfile, submitRescueTeamApplication);
router.get('/my-application', protect, getMyRescueTeamApplication);

// Admin Routes
router.get('/applications', protect, authorizeRoles('Admin'), getAllRescueTeamApplications);
router.put('/applications/:id/visit', protect, authorizeRoles('Admin'), scheduleTeamVisit);
router.post('/applications/:id/visit-report', protect, authorizeRoles('Admin'), submitTeamVisitReport);
router.put('/applications/:id/visit-report', protect, authorizeRoles('Admin'), submitTeamVisitReport);

module.exports = router;
