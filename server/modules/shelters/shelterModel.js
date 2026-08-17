const mongoose = require('mongoose');

const shelterSchema = new mongoose.Schema(
  {
    shelterNumber: {
      type: String,
      unique: true,
    },
    shelterApplicationId: {
      type: String,
      default: null,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    registrationType: {
      type: String,
      enum: [
        'NGO_DARPAN',
        'MCA_CIN',
        'NGO_PAN',
        'AWBI_ID',
        'STATE_TRUST_SOCIETY',
      ],
      trim: true,
      default: 'STATE_TRUST_SOCIETY',
    },
    registrationNumber: {
      type: String,
      trim: true,
      default: '',
    },
    shelterName: {
      type: String,
      required: [true, 'Shelter name is required'],
      trim: true,
    },
    shelterEmail: {
      type: String,
      required: [true, 'Shelter email is required'],
      trim: true,
      lowercase: true,
    },
    shelterPhoneNumber: {
      type: Number,
      required: [true, 'Shelter contact number is required'],
    },
    latitude: {
      type: Number,
      required: [true, 'Latitude is required'],
    },
    longitude: {
      type: Number,
      required: [true, 'Longitude is required'],
    },
    totalStaffs: {
      type: Number,
      required: [true, 'Total number of staff is required'],
      min: 0,
      default: 0,
    },
    totalCages: {
      type: Number,
      required: [true, 'Total number of cages is required'],
      min: 0,
      default: 0,
    },
    occupiedCages: {
      type: Number,
      required: [true, 'Number of occupied cages is required'],
      min: 0,
      default: 0,
    },
    status: {
      type: String,
      enum: ['OPEN', 'FULL', 'UNDER_MAINTENANCE', 'CLOSED'],
      default: 'UNDER_MAINTENANCE',
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

// Auto-generate sequential shelterNumber (e.g. SH-0001, SH-0002...) before save
shelterSchema.pre('save', async function () {
  if (this.registrationNumber && typeof this.registrationNumber === 'string') {
    this.registrationNumber = this.registrationNumber.trim().toUpperCase();
  }
  if (!this.shelterNumber) {
    // Find the shelter with the highest sequential number
    const shelters = await mongoose
      .model('Shelter')
      .find({}, { shelterNumber: 1 })
      .lean();

    let maxSeq = 0;
    shelters.forEach((s) => {
      if (s.shelterNumber) {
        const match = s.shelterNumber.match(/^SH-(\d+)$/i) || s.shelterNumber.match(/^S(\d+)$/i);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxSeq) maxSeq = num;
        }
      }
    });

    const nextSeq = maxSeq + 1;
    this.shelterNumber = `SH-${String(nextSeq).padStart(4, '0')}`;
  }
});

module.exports = mongoose.model('Shelter', shelterSchema);
