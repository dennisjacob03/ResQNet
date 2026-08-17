const Notification = require('./notificationModel');

/**
 * Helper to create a notification easily from any controller/middleware
 */
const createNotificationHelper = async ({
  userId,
  title,
  message,
  type = 'General',
  priority = 'Low',
  metadata = {},
}) => {
  try {
    if (!userId || !title || !message) {
      console.warn('createNotificationHelper skipped: Missing required parameters');
      return null;
    }

    const notification = await Notification.create({
      userId,
      title: title.trim(),
      message: message.trim(),
      type,
      priority,
      metadata,
      status: 'Unread',
    });

    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error.message);
    return null;
  }
};

/**
 * @desc    Get all notifications for the authenticated user
 * @route   GET /api/notifications
 * @access  Private
 */
const getMyNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    let notifications = await Notification.find({ userId, isDeleted: { $ne: true } }).sort({ createdAt: -1 });

    // If existing user has 0 notifications, seed a warm welcome notification
    if (notifications.length === 0) {
      const welcome = await Notification.create({
        userId,
        title: 'Welcome to ResQNet! 🐾',
        message: `Greetings ${req.user.fullName || 'there'}! Welcome to ResQNet. We are delighted to have you join our animal welfare and rescue network.`,
        type: 'Welcome',
        priority: 'Medium',
        status: 'Unread',
      });
      notifications = [welcome];
    }

    const unreadCount = notifications.filter((n) => n.status === 'Unread').length;

    res.status(200).json({
      success: true,
      count: notifications.length,
      unreadCount,
      notifications,
    });
  } catch (error) {
    console.error('Get Notifications Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Mark a single notification as Read
 * @route   PATCH /api/notifications/:id/read
 * @access  Private
 */
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId: req.user._id, isDeleted: { $ne: true } },
      { status: 'Read' },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.status(200).json({ success: true, notification });
  } catch (error) {
    console.error('Mark As Read Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Mark all notifications as Read for the authenticated user
 * @route   PATCH /api/notifications/read-all
 * @access  Private
 */
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user._id, status: 'Unread', isDeleted: { $ne: true } }, { status: 'Read' });

    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark All Read Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Delete a notification (Soft delete - archived in database)
 * @route   DELETE /api/notifications/:id
 * @access  Private
 */
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId: req.user._id, isDeleted: { $ne: true } },
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.status(200).json({ success: true, message: 'Notification removed successfully' });
  } catch (error) {
    console.error('Delete Notification Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Create a notification manually (e.g. user activity trigger from client or admin)
 * @route   POST /api/notifications
 * @access  Private
 */
const createNotification = async (req, res) => {
  try {
    const { title, message, type = 'General', priority = 'Low', metadata = {} } = req.body;
    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'Title and message are required' });
    }

    const notification = await Notification.create({
      userId: req.user._id,
      title: title.trim(),
      message: message.trim(),
      type,
      priority,
      metadata,
      status: 'Unread',
    });

    res.status(201).json({ success: true, notification });
  } catch (error) {
    console.error('Create Notification Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createNotificationHelper,
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification,
};
