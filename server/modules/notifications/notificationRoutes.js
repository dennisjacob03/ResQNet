const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/authMiddleware');
const {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification,
} = require('./notificationController');

// All notification routes are protected
router.use(protect);

router.route('/')
  .get(getMyNotifications)
  .post(createNotification);

router.patch('/read-all', markAllAsRead);
router.patch('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);

module.exports = router;
