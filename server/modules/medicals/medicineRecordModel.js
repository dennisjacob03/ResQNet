const mongoose = require('mongoose');

const medicineRecordSchema = new mongoose.Schema(
  {
    medicineRecordId: {
      type: String,
      unique: true,
    },
    animalId: {
      type: String,
      required: [true, 'Animal ID is required'],
      ref: 'Animal',
    },
    medicineName: {
      type: String,
      required: [true, 'Medicine name is required'],
      trim: true,
    },
    route: {
      type: String,
      enum: {
        values: ['Oral', 'Injection', 'Topical'],
        message: '{VALUE} is not a valid administration route',
      },
      required: [true, 'Administration route is required'],
    },
    dosage: {
      type: String,
      required: [true, 'Dosage is required'],
      trim: true,
    },
    frequency: {
      type: String,
      required: [true, 'Frequency is required'],
      trim: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate medicineRecordId (e.g. MED-0001) before save
medicineRecordSchema.pre('save', async function () {
  if (!this.medicineRecordId) {
    const records = await mongoose
      .model('MedicineRecord')
      .find({}, { medicineRecordId: 1 })
      .lean();

    let maxSeq = 0;
    records.forEach((r) => {
      if (r.medicineRecordId) {
        const match = r.medicineRecordId.match(/^MED-(\d+)$/i);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxSeq) maxSeq = num;
        }
      }
    });

    this.medicineRecordId = `MED-${String(maxSeq + 1).padStart(4, '0')}`;
  }
});

module.exports = mongoose.model('MedicineRecord', medicineRecordSchema);
