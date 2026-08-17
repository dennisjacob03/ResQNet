const mongoose = require('mongoose');

const rescueAssignmentSchema = new mongoose.Schema(
  {
    rescueAssignmentId: {
      type: String,
      unique: true,
    },
    rescueRequestId: {
      type: String,
      required: [true, 'Rescue request ID is required'],
      ref: 'RescueRequest',
    },
    rescueTeamId: {
      type: String,
      required: [true, 'Rescue team ID is required'],
      ref: 'RescueTeam',
    },
    acceptedTime: {
      type: Date,
      default: null,
    },
    completedTime: {
      type: Date,
      default: null,
    },
    remarks: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate rescueAssignmentId (e.g. RA-0001) before save
rescueAssignmentSchema.pre('save', async function () {
  if (!this.rescueAssignmentId) {
    const records = await mongoose
      .model('RescueAssignment')
      .find({}, { rescueAssignmentId: 1 })
      .lean();

    let maxSeq = 0;
    records.forEach((r) => {
      if (r.rescueAssignmentId) {
        const match = r.rescueAssignmentId.match(/^RA-(\d+)$/i);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxSeq) maxSeq = num;
        }
      }
    });

    this.rescueAssignmentId = `RA-${String(maxSeq + 1).padStart(4, '0')}`;
  }
});

module.exports = mongoose.model('RescueAssignment', rescueAssignmentSchema);
