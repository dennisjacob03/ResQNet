const mongoose = require('mongoose');

const animalSchema = new mongoose.Schema(
  {
    animalId: {
      type: String,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    species: {
      type: String,
      required: [true, 'Species is required'],
      trim: true,
    },
    breed: {
      type: String,
      default: '',
      trim: true,
    },
    gender: {
      type: String,
      enum: {
        values: ['Male', 'Female', 'Unknown'],
        message: '{VALUE} is not a valid gender',
      },
      default: 'Unknown',
    },
    approxAge: {
      type: Number,
      default: 0,
      min: 0,
    },
    color: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ['Rescued', 'Adopted', 'Released', 'Dead'],
        message: '{VALUE} is not a valid animal status',
      },
      default: 'Rescued',
    },
    photo: {
      type: String, // Base64 encoded image
      default: '',
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

// Auto-generate animalId (e.g. ANL-0001) before save
animalSchema.pre('save', async function () {
  if (!this.animalId) {
    const records = await mongoose
      .model('Animal')
      .find({}, { animalId: 1 })
      .lean();

    let maxSeq = 0;
    records.forEach((r) => {
      if (r.animalId) {
        const match = r.animalId.match(/^ANL-(\d+)$/i);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxSeq) maxSeq = num;
        }
      }
    });

    this.animalId = `ANL-${String(maxSeq + 1).padStart(4, '0')}`;
  }
});

module.exports = mongoose.model('Animal', animalSchema);
