const mongoose = require('mongoose');

const adoptionApplicationSchema = new mongoose.Schema(
  {
    adoptionId: {
      type: String,
      unique: true,
    },
    animalId: {
      type: String,
      required: [true, 'Animal ID is required'],
      ref: 'Animal',
    },
    shelterId: {
      type: String,
      required: [true, 'Shelter ID is required'],
      ref: 'Shelter',
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    applicationDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: {
        values: ['Pending', 'Approved', 'Rejected', 'Completed'],
        message: '{VALUE} is not a valid adoption status',
      },
      default: 'Pending',
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

// Auto-generate adoptionId (e.g. ADO-0001) before save
adoptionApplicationSchema.pre('save', async function () {
  if (!this.adoptionId) {
    const records = await mongoose
      .model('AdoptionApplication')
      .find({}, { adoptionId: 1 })
      .lean();

    let maxSeq = 0;
    records.forEach((r) => {
      if (r.adoptionId) {
        const match = r.adoptionId.match(/^ADO-(\d+)$/i);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxSeq) maxSeq = num;
        }
      }
    });

    this.adoptionId = `ADO-${String(maxSeq + 1).padStart(4, '0')}`;
  }
});

module.exports = mongoose.model('AdoptionApplication', adoptionApplicationSchema);
