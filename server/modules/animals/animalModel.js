const mongoose = require('mongoose');

const animalSchema = new mongoose.Schema(
  {
    animalId: {
      type: String,
      unique: true,
    },
    name: {
      type: String,
      default: '',
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    shelterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shelter',
      default: null,
    },
    shelterName: {
      type: String,
      default: '',
      trim: true,
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
      enum: ['Male', 'Female', 'Unknown'],
      default: 'Unknown',
    },
    approxAge: {
      type: String,
      default: '',
    },
    color: {
      type: String,
      default: '',
      trim: true,
    },
    // Media
    photo: {
      type: String,
      default: '',
    },
    facePhoto: {
      type: String,
      default: '',
    },
    fullBodyPhoto: {
      type: String,
      default: '',
    },
    photos: {
      type: [String],
      default: [],
    },
    video: {
      type: String,
      default: '',
    },
    // Physical & Demographics
    currentSize: {
      type: String,
      enum: ['Small', 'Medium', 'Large', 'Extra Large', ''],
      default: 'Medium',
    },
    weight: {
      type: String,
      default: '',
      trim: true,
    },
    // Altered & Medical Status
    neutered: {
      type: Boolean,
      default: false,
    },
    spayedNeutered: {
      type: Boolean,
      default: false,
    },
    vaccinations: [
      {
        name: { type: String, default: '' },
        date: { type: String, default: '' },
        status: { type: String, default: 'Completed' },
      },
    ],
    vaccinationDate: {
      type: String,
      default: '',
      trim: true,
    },
    microchipped: {
      type: Boolean,
      default: false,
    },
    microchipNumber: {
      type: String,
      default: '',
      trim: true,
    },
    specialMedicalNeeds: {
      type: String,
      default: 'None',
      trim: true,
    },
    // Behavioral & Training
    energyLevel: {
      type: String,
      enum: ['Calm', 'Low', 'Moderate', 'High', 'Very High', ''],
      default: 'Moderate',
    },
    training: {
      type: String,
      default: 'House-trained, Basic commands',
      trim: true,
    },
    // Story & Descriptions
    about: {
      type: String,
      default: '',
      trim: true,
    },
    backgroundStory: {
      type: String,
      default: '',
      trim: true,
    },
    // Shelter Information
    shelterCity: {
      type: String,
      default: '',
      trim: true,
    },
    shelterState: {
      type: String,
      default: '',
      trim: true,
    },
    shelterRegistrationNumber: {
      type: String,
      default: '',
      trim: true,
    },
    cageNumber: {
      type: String,
      default: '',
      trim: true,
    },
    healthCondition: {
      type: String,
      default: 'Healthy',
      trim: true,
    },
    status: {
      type: String,
      enum: ['Available', 'Adoption Pending', 'Adopted', 'Rescued', 'Under Treatment', 'Critical', 'Released', 'Dead'],
      default: 'Available',
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
