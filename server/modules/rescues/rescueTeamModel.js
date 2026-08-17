const mongoose = require('mongoose');

const rescueTeamSchema = new mongoose.Schema(
  {
    teamId: {
      type: String,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    rescueTeamNumber: {
      type: String,
      unique: true,
    },
    vehicleNumber: {
      type: String,
      required: [true, 'Vehicle number is required'],
      trim: true,
      uppercase: true,
    },
    vehicleType: {
      type: String,
      enum: {
        values: ['Van', 'Ambulance', 'Bike', 'Car', 'Other'],
        message: '{VALUE} is not a valid vehicle type',
      },
      required: [true, 'Vehicle type is required'],
    },
    operatingDistrict: {
      type: String,
      required: [true, 'Operating district is required'],
      trim: true,
    },
    availability: {
      type: String,
      enum: {
        values: ['Available', 'Busy', 'Offline'],
        message: '{VALUE} is not a valid availability status',
      },
      default: 'Available',
    },
    status: {
      type: String,
      enum: {
        values: ['Active', 'Inactive'],
        message: '{VALUE} is not a valid status',
      },
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate teamId and rescueTeamNumber before save
rescueTeamSchema.pre('save', async function () {
  if (!this.teamId || !this.rescueTeamNumber) {
    const records = await mongoose
      .model('RescueTeam')
      .find({}, { teamId: 1 })
      .lean();

    let maxSeq = 0;
    records.forEach((r) => {
      if (r.teamId) {
        const match = r.teamId.match(/^RT-(\d+)$/i);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxSeq) maxSeq = num;
        }
      }
    });

    const nextSeq = maxSeq + 1;

    if (!this.teamId) {
      this.teamId = `RT-${String(nextSeq).padStart(4, '0')}`;
    }
    if (!this.rescueTeamNumber) {
      this.rescueTeamNumber = `RTN${String(nextSeq).padStart(3, '0')}`;
    }
  }
});

module.exports = mongoose.model('RescueTeam', rescueTeamSchema);
