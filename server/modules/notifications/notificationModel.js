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
    const records = await mongoose
      .model('Notification')
      .find({}, { notificationId: 1 })
      .lean();

    let maxSeq = 0;
    records.forEach((r) => {
      if (r.notificationId) {
        const match = r.notificationId.match(/^NTF-(\d+)$/i);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxSeq) maxSeq = num;
        }
      }
    });

    this.notificationId = `NTF-${String(maxSeq + 1).padStart(4, '0')}`;
  }
});

module.exports = mongoose.model('Notification', notificationSchema);
