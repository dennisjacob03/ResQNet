const mongoose = require('mongoose');

const rescueRequestSchema = new mongoose.Schema(
  {
    rescueRequestId: {
      type: String,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    categoryId: {
      type: String,
      required: [true, 'Category ID is required'],
      ref: 'Category',
    },
    type: {
      type: String,
      enum: {
        values: ['Injured', 'Lost', 'Aggressive', 'Abandoned', 'Sick', 'Dead'],
        message: '{VALUE} is not a valid rescue type',
      },
      required: [true, 'Rescue type is required'],
    },
    priority: {
      type: String,
      enum: {
        values: ['Low', 'Medium', 'High', 'Emergency'],
        message: '{VALUE} is not a valid priority level',
      },
      default: 'Medium',
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    image: {
      type: String, // Base64 encoded image
      default: '',
    },
    latitude: {
      type: Number,
      required: [true, 'Latitude is required'],
    },
    longitude: {
      type: Number,
      required: [true, 'Longitude is required'],
    },
    status: {
      type: String,
      enum: {
        values: ['Pending', 'Accepted', 'In Transit', 'Completed', 'Cancelled'],
        message: '{VALUE} is not a valid rescue status',
      },
      default: 'Pending',
    },
    rescuedAt: {
      type: Date,
      default: null,
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

// Auto-generate rescueRequestId (e.g. RR-0001) before save
rescueRequestSchema.pre('save', async function () {
  if (!this.rescueRequestId) {
    const records = await mongoose
      .model('RescueRequest')
      .find({}, { rescueRequestId: 1 })
      .lean();

    let maxSeq = 0;
    records.forEach((r) => {
      if (r.rescueRequestId) {
        const match = r.rescueRequestId.match(/^RR-(\d+)$/i);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxSeq) maxSeq = num;
        }
      }
    });

    this.rescueRequestId = `RR-${String(maxSeq + 1).padStart(4, '0')}`;
  }
});

module.exports = mongoose.model('RescueRequest', rescueRequestSchema);
