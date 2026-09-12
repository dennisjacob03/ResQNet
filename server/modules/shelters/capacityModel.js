const mongoose = require('mongoose');

const capacitySchema = new mongoose.Schema(
  {
    capacityId: {
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
    totalCapacity: {
      type: Number,
      default: 0,
      min: 0,
    },
    occupiedCapacity: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate capacityId (e.g. CAP-0001) before save
capacitySchema.pre('save', async function () {
  if (!this.capacityId) {
    const records = await mongoose
      .model('Capacity')
      .find({}, { capacityId: 1 })
      .lean();

    let maxSeq = 0;
    records.forEach((r) => {
      if (r.capacityId) {
        const match = r.capacityId.match(/^CAP-(\d+)$/i);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxSeq) maxSeq = num;
        }
      }
    });

    this.capacityId = `CAP-${String(maxSeq + 1).padStart(4, '0')}`;
  }
});

module.exports = mongoose.model('Capacity', capacitySchema);
