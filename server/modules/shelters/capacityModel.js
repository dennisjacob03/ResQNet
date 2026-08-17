const mongoose = require('mongoose');

const capacitySchema = new mongoose.Schema(
  {
    capacityId: {
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
    totalCapacity: {
      type: Number,
      required: [true, 'Total capacity is required'],
      min: 0,
      default: 0,
    },
    occupiedCapacity: {
      type: Number,
      required: [true, 'Occupied capacity is required'],
      min: 0,
      default: 0,
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
