const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema(
  {
    medicalRecordId: {
      type: String,
      unique: true,
    },
    animalId: {
      type: String,
      required: [true, 'Animal ID is required'],
      ref: 'Animal',
    },
    type: {
      type: String,
      enum: {
        values: ['Diagnosis', 'Treatment', 'Surgery'],
        message: '{VALUE} is not a valid medical record type',
      },
      required: [true, 'Medical record type is required'],
    },
    report: {
      type: String,
      default: '',
      trim: true,
    },
    reportDate: {
      type: Date,
      required: [true, 'Report date is required'],
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

// Auto-generate medicalRecordId (e.g. MR-0001) before save
medicalRecordSchema.pre('save', async function () {
  if (!this.medicalRecordId) {
    const records = await mongoose
      .model('MedicalRecord')
      .find({}, { medicalRecordId: 1 })
      .lean();

    let maxSeq = 0;
    records.forEach((r) => {
      if (r.medicalRecordId) {
        const match = r.medicalRecordId.match(/^MR-(\d+)$/i);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxSeq) maxSeq = num;
        }
      }
    });

    this.medicalRecordId = `MR-${String(maxSeq + 1).padStart(4, '0')}`;
  }
});

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
