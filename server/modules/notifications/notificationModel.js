const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    notificationId: {
      type: String,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: {
        values: [
          'Welcome',
          'ShelterApplication',
          'Rescue',
          'Adoption',
          'Volunteer',
          'Veterinary',
          'Vaccination',
          'Medicine',
          'Alert',
          'System',
          'General',
        ],
        message: '{VALUE} is not a valid notification type',
      },
      default: 'General',
    },
    priority: {
      type: String,
      enum: {
        values: ['Low', 'Medium', 'High', 'Emergency'],
        message: '{VALUE} is not a valid priority level',
      },
      default: 'Low',
    },
    status: {
      type: String,
      enum: {
        values: ['Read', 'Unread'],
        message: '{VALUE} is not a valid notification status',
      },
      default: 'Unread',
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate notificationId (e.g. NTF-0001) before save
notificationSchema.pre('save', async function () {
  if (!this.notificationId) {
    const count = await mongoose.model('Notification').countDocuments();
    const rand = Math.floor(1000 + Math.random() * 9000);
    this.notificationId = `NTF-${String(count + 1).padStart(4, '0')}-${rand}`;
  }
});

module.exports = mongoose.model('Notification', notificationSchema);
