const mongoose = require('mongoose');

const rescueVolunteerApplicationSchema = new mongoose.Schema(
  {
    volunteerApplicationId: {
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
    vehicleNumber: {
      type: String,
      default: '',
      trim: true,
      uppercase: true,
    },
    vehicleType: {
      type: String,
      enum: {
        values: ['Van', 'Ambulance', 'Bike', 'Car', 'Other', ''],
        message: '{VALUE} is not a valid vehicle type',
      },
      default: '',
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

// Auto-generate volunteerApplicationId (e.g. RVA-0001) before save
rescueVolunteerApplicationSchema.pre('save', async function () {
  if (!this.volunteerApplicationId) {
    const records = await mongoose
      .model('RescueVolunteerApplication')
      .find({}, { volunteerApplicationId: 1 })
      .lean();

    let maxSeq = 0;
    records.forEach((r) => {
      if (r.volunteerApplicationId) {
        const match = r.volunteerApplicationId.match(/^RVA-(\d+)$/i);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxSeq) maxSeq = num;
        }
      }
    });

    this.volunteerApplicationId = `RVA-${String(maxSeq + 1).padStart(4, '0')}`;
  }
});

module.exports = mongoose.model(
  'RescueVolunteerApplication',
  rescueVolunteerApplicationSchema
);
