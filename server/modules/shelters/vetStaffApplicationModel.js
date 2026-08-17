const mongoose = require('mongoose');

const vetStaffApplicationSchema = new mongoose.Schema(
  {
    vetStaffApplicationId: {
      type: String,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    resume: {
      type: String, // Base64 encoded file
      default: '',
    },
    applicationDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: {
        values: ['Pending', 'Approved', 'Rejected'],
        message: '{VALUE} is not a valid application status',
      },
      default: 'Pending',
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate vetStaffApplicationId (e.g. VSA-0001) before save
vetStaffApplicationSchema.pre('save', async function () {
  if (!this.vetStaffApplicationId) {
    const records = await mongoose
      .model('VetStaffApplication')
      .find({}, { vetStaffApplicationId: 1 })
      .lean();

    let maxSeq = 0;
    records.forEach((r) => {
      if (r.vetStaffApplicationId) {
        const match = r.vetStaffApplicationId.match(/^VSA-(\d+)$/i);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxSeq) maxSeq = num;
        }
      }
    });

    this.vetStaffApplicationId = `VSA-${String(maxSeq + 1).padStart(4, '0')}`;
  }
});

module.exports = mongoose.model('VetStaffApplication', vetStaffApplicationSchema);
