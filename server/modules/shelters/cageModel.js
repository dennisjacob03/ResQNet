const mongoose = require('mongoose');

const cageSchema = new mongoose.Schema(
  {
    cageId: {
      type: String,
      unique: true,
    },
    shelterId: {
      type: String,
      required: [true, 'Shelter ID is required'],
      ref: 'Shelter',
    },
    categoryId: {
      type: String,
      required: [true, 'Category ID is required'],
      ref: 'Category',
    },
    cageNumber: {
      type: Number,
      required: [true, 'Cage number is required'],
    },
    type: {
      type: String,
      enum: {
        values: ['Initial', 'Normal', 'Quarantine', 'Recovery'],
        message: '{VALUE} is not a valid cage type',
      },
      required: [true, 'Cage type is required'],
    },
    status: {
      type: String,
      enum: {
        values: ['AVAILABLE', 'OCCUPIED', 'MAINTENANCE'],
        message: '{VALUE} is not a valid cage status',
      },
      default: 'AVAILABLE',
    },
    animalId: {
      type: String,
      ref: 'Animal',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate cageId (e.g. CGE-0001) before save
cageSchema.pre('save', async function () {
  if (!this.cageId) {
    const records = await mongoose
      .model('Cage')
      .find({}, { cageId: 1 })
      .lean();

    let maxSeq = 0;
    records.forEach((r) => {
      if (r.cageId) {
        const match = r.cageId.match(/^CGE-(\d+)$/i);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxSeq) maxSeq = num;
        }
      }
    });

    this.cageId = `CGE-${String(maxSeq + 1).padStart(4, '0')}`;
  }
});

module.exports = mongoose.model('Cage', cageSchema);
