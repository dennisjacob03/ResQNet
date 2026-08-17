const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateUserStatus,
  updateUserRole,
  createUser,
  deleteUser,
  getUserStats,
} = require('./userController');
const { protect, authorizeRoles } = require('../../middleware/authMiddleware');

// All routes here are restricted to Admin users
router.use(protect);
router.use(authorizeRoles('Admin'));

// User analytics
router.get('/stats', getUserStats);

// User CRUD
router.get('/', getAllUsers);
router.post('/', createUser);
router.get('/:id', getUserById);
router.put('/:id/status', updateUserStatus);
router.put('/:id/role', updateUserRole);
router.delete('/:id', deleteUser);

module.exports = router;
