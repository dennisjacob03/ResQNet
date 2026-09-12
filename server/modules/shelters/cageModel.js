const mongoose = require('mongoose');

const cageSchema = new mongoose.Schema(
  {
    cageId: {
      type: String,
      unique: true,
    },
    shelterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shelter',
      required: [true, 'Shelter reference is required'],
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category reference is required'],
    },
    cageNumber: {
      type: Number,
      required: [true, 'Cage number is required'],
    },
    type: {
      type: String,
      enum: ['Initial', 'Normal', 'Quarantine', 'Recovery'],
      default: 'Normal',
    },
    status: {
      type: String,
      enum: ['AVAILABLE', 'OCCUPIED', 'MAINTENANCE'],
      default: 'AVAILABLE',
    },
    animalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Animal',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate cageId (e.g. CAGE-0001) before save
cageSchema.pre('save', async function () {
  if (!this.cageId) {
    const records = await mongoose
      .model('Cage')
      .find({}, { cageId: 1 })
      .lean();

    let maxSeq = 0;
    records.forEach((r) => {
      if (r.cageId) {
        const match = r.cageId.match(/^CAGE-(\d+)$/i);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxSeq) maxSeq = num;
        }
      }
    });

    this.cageId = `CAGE-${String(maxSeq + 1).padStart(4, '0')}`;
  }
});

module.exports = mongoose.model('Cage', cageSchema);
