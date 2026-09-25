const mongoose = require('mongoose');

const medicineStockSchema = new mongoose.Schema(
  {
    medicineStockId: {
      type: String,
      unique: true,
    },
    shelterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shelter',
      required: [true, 'Shelter ID is required'],
    },
    // The vet staff member who added/last updated this entry
    addedByVetStaffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'VetStaff',
      default: null,
    },
    addedByName: {
      type: String,
      default: '',
      trim: true,
    },
    medicineName: {
      type: String,
      required: [true, 'Medicine name is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: {
        values: [
          'Antibiotic',
          'Antiparasitic',
          'Anti-inflammatory',
          'Anesthetic',
          'Vaccine',
          'Supplement',
          'Antiseptic',
          'Other',
        ],
        message: '{VALUE} is not a valid category',
      },
      default: 'Other',
    },
    unit: {
      type: String,
      enum: {
        values: ['Tablet', 'Capsule', 'Vial', 'Bottle', 'Sachet', 'Tube', 'Ampoule', 'Strip'],
        message: '{VALUE} is not a valid unit',
      },
      default: 'Tablet',
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0, 'Quantity cannot be negative'],
    },
    lowStockThreshold: {
      type: Number,
      default: 10,
      min: [0, 'Threshold cannot be negative'],
    },
    expiryDate: {
      type: Date,
      default: null,
    },
    batchNumber: {
      type: String,
      default: '',
      trim: true,
    },
    supplier: {
      type: String,
      default: '',
      trim: true,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual: severity level based on quantity vs threshold
medicineStockSchema.virtual('severity').get(function () {
  if (this.quantity === 0) return 'Out of Stock';
  if (this.quantity <= this.lowStockThreshold / 2) return 'Critical';
  if (this.quantity <= this.lowStockThreshold) return 'Low';
  return 'Adequate';
});

medicineStockSchema.set('toJSON', { virtuals: true });
medicineStockSchema.set('toObject', { virtuals: true });

// Auto-generate medicineStockId (e.g. MS-0001)
medicineStockSchema.pre('save', async function () {
  if (!this.medicineStockId) {
    const records = await mongoose
      .model('MedicineStock')
      .find({}, { medicineStockId: 1 })
      .lean();

    let maxSeq = 0;
    records.forEach((r) => {
      if (r.medicineStockId) {
        const match = r.medicineStockId.match(/^MS-(\d+)$/i);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxSeq) maxSeq = num;
        }
      }
    });

    this.medicineStockId = `MS-${String(maxSeq + 1).padStart(4, '0')}`;
  }
});

module.exports = mongoose.model('MedicineStock', medicineStockSchema);
