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
    vetUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    vetName: {
      type: String,
      default: 'Veterinary Doctor',
      trim: true,
    },
    type: {
      type: String,
      enum: {
        values: ['Diagnosis', 'Treatment', 'Surgery', 'Routine Checkup'],
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
      default: Date.now,
    },
    vitals: {
      temperature: { type: String, default: '' },
      weight: { type: String, default: '' },
      pulse: { type: String, default: '' },
      mucosalColor: { type: String, default: '' },
    },
    isSurgery: {
      type: Boolean,
      default: false,
    },
    surgeryDetails: {
      procedureName: { type: String, default: '' },
      anesthesia: { type: String, default: '' },
      surgeon: { type: String, default: '' },
      postOpCare: { type: String, default: '' },
    },
    nextVisitDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['Ongoing', 'Critical', 'Improving', 'Completed'],
      default: 'Ongoing',
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
