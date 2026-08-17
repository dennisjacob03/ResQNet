const mongoose = require('mongoose');

const shelterAssignmentSchema = new mongoose.Schema(
  {
    shelterAssignmentId: {
      type: String,
      unique: true,
    },
    shelterId: {
      type: String,
      required: [true, 'Shelter ID is required'],
      ref: 'Shelter',
    },
    animalId: {
      type: String,
      required: [true, 'Animal ID is required'],
      ref: 'Animal',
    },
    cageId: {
      type: String,
      required: [true, 'Cage ID is required'],
      ref: 'Cage',
    },
    animalCategoryId: {
      type: String,
      required: [true, 'Animal category ID is required'],
      ref: 'Category',
    },
    arrivalDate: {
      type: Date,
      required: [true, 'Arrival date is required'],
    },
    releaseDate: {
      type: Date,
      default: null,
    },
    initialObservation: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate shelterAssignmentId (e.g. SA-0001) before save
shelterAssignmentSchema.pre('save', async function () {
  if (!this.shelterAssignmentId) {
    const records = await mongoose
      .model('ShelterAssignment')
      .find({}, { shelterAssignmentId: 1 })
      .lean();

    let maxSeq = 0;
    records.forEach((r) => {
      if (r.shelterAssignmentId) {
        const match = r.shelterAssignmentId.match(/^SA-(\d+)$/i);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxSeq) maxSeq = num;
        }
      }
    });

    this.shelterAssignmentId = `SA-${String(maxSeq + 1).padStart(4, '0')}`;
  }
});

module.exports = mongoose.model('ShelterAssignment', shelterAssignmentSchema);
