const mongoose = require('mongoose');

const shelterAssignmentSchema = new mongoose.Schema(
  {
    shelterAssignmentId: {
      type: String,
      unique: true,
    },
    shelterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shelter',
      required: [true, 'Shelter reference is required'],
    },
    animalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Animal',
      required: [true, 'Animal reference is required'],
    },
    cageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cage',
      default: null,
    },
    animalCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    arrivalDate: {
      type: Date,
      default: Date.now,
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

// Auto-generate shelterAssignmentId (e.g. SHA-0001) before save
shelterAssignmentSchema.pre('save', async function () {
  if (!this.shelterAssignmentId) {
    const records = await mongoose
      .model('ShelterAssignment')
      .find({}, { shelterAssignmentId: 1 })
      .lean();

    let maxSeq = 0;
    records.forEach((r) => {
      if (r.shelterAssignmentId) {
        const match = r.shelterAssignmentId.match(/^SHA-(\d+)$/i);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxSeq) maxSeq = num;
        }
      }
    });

    this.shelterAssignmentId = `SHA-${String(maxSeq + 1).padStart(4, '0')}`;
  }
});

module.exports = mongoose.model('ShelterAssignment', shelterAssignmentSchema);
