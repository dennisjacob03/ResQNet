const express = require('express');
const router = express.Router();
const {
  createRescueRequest,
  getUserRescueRequests,
  getRescueRequestById,
  getRescueTeamBroadcasts,
  acceptRescueRequest,
  declineRescueRequest,
  updateRescueStage,
  getNearbySheltersForIntake,
  routeToShelter,
  confirmShelterAdmission,
  getShelterIncomingIntakes,
  getAllRescueTeamsAndSheltersMap,
} = require('./rescueRequestController');
const { protect, authorizeRoles, requireCompleteProfile } = require('../../middleware/authMiddleware');

// Public User Rescue Request Routes
router.post('/', protect, requireCompleteProfile, createRescueRequest);
router.get('/my-requests', protect, getUserRescueRequests);
router.get('/map-data', getAllRescueTeamsAndSheltersMap);

// Rescue Team Operational Routes
router.get('/broadcasts', protect, authorizeRoles('Rescue Team', 'Admin'), getRescueTeamBroadcasts);
router.post('/:id/accept', protect, authorizeRoles('Rescue Team', 'Admin'), acceptRescueRequest);
router.post('/:id/decline', protect, authorizeRoles('Rescue Team', 'Admin'), declineRescueRequest);
router.put('/:id/stage', protect, authorizeRoles('Rescue Team', 'Admin'), updateRescueStage);
router.get('/:id/nearby-shelters', protect, authorizeRoles('Rescue Team', 'Admin'), getNearbySheltersForIntake);
router.post('/:id/route-shelter', protect, authorizeRoles('Rescue Team', 'Admin'), routeToShelter);

// Shelter Intake Confirmation & Tracking Routes
router.get('/shelter-incoming', protect, authorizeRoles('Shelter', 'Admin'), getShelterIncomingIntakes);
router.post('/:id/confirm-admission', protect, authorizeRoles('Shelter', 'Admin'), confirmShelterAdmission);

// Single Request Detailed View
router.get('/:id', protect, getRescueRequestById);

module.exports = router;
