const mongoose = require('mongoose');

const vaccinationSchema = new mongoose.Schema(
  {
    vaccinationId: {
      type: String,
      unique: true,
    },
    animalId: {
      type: String,
      required: [true, 'Animal ID is required'],
      ref: 'Animal',
    },
    animalObjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Animal',
      default: null,
    },
    animalName: {
      type: String,
      default: '',
      trim: true,
    },
    species: {
      type: String,
      default: 'Dog',
      trim: true,
    },
    shelterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shelter',
      default: null,
    },
    vaccineName: {
      type: String,
      required: [true, 'Vaccine name is required'],
      trim: true,
    },
    dateGiven: {
      type: Date,
      required: [true, 'Vaccination date is required'],
      default: Date.now,
    },
    nextDueDate: {
      type: Date,
      default: null,
    },
    administeredBy: {
      type: String,
      default: '',
      trim: true,
    },
    batchNumber: {
      type: String,
      default: '',
      trim: true,
    },
    remarks: {
      type: String,
      default: '',
      trim: true,
    },
    reminderSent: {
      type: Boolean,
      default: false,
    },
    lastReminderDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate vaccinationId (e.g. VAC-0001) before save
vaccinationSchema.pre('save', async function () {
  if (!this.vaccinationId) {
    const records = await mongoose
      .model('Vaccination')
      .find({}, { vaccinationId: 1 })
      .lean();

    let maxSeq = 0;
    records.forEach((r) => {
      if (r.vaccinationId) {
        const match = r.vaccinationId.match(/^VAC-(\d+)$/i);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxSeq) maxSeq = num;
        }
      }
    });

    this.vaccinationId = `VAC-${String(maxSeq + 1).padStart(4, '0')}`;
  }
});

module.exports = mongoose.model('Vaccination', vaccinationSchema);
