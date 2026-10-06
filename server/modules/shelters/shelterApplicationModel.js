const mongoose = require('mongoose');

const shelterApplicationSchema = new mongoose.Schema(
  {
    shelterApplicationId: {
      type: String,
      unique: true,
    },
    applicantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    applicantName: {
      type: String,
      trim: true,
      default: '',
    },
    registrationType: {
      type: String,
      required: [true, 'Registration type is required'],
      enum: {
        values: [
          'NGO_DARPAN',
          'MCA_CIN',
          'NGO_PAN',
          'AWBI_ID',
          'STATE_TRUST_SOCIETY',
        ],
        message: '{VALUE} is not a valid registration type',
      },
      trim: true,
    },
    registrationNumber: {
      type: String,
      required: [true, 'Official registration number is required'],
      trim: true,
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
    address: {
      type: String,
      default: '',
      trim: true,
    },
    city: {
      type: String,
      default: '',
      trim: true,
    },
    district: {
      type: String,
      default: '',
      trim: true,
    },
    state: {
      type: String,
      default: '',
      trim: true,
    },
    pincode: {
      type: String,
      default: '',
      trim: true,
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
    },
    totalCages: {
      type: Number,
      required: [true, 'Total number of cages is required'],
      min: 0,
    },
    occupiedCages: {
      type: Number,
      required: [true, 'Number of occupied cages is required'],
      min: 0,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },
    applicationStatus: {
      type: String,
      enum: ['Pending', 'Site Visit', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    reviewNote: {
      type: String,
      default: '',
    },
    siteVisitScheduleDate: {
      type: Date,
      default: null,
    },
    siteVisitValuationPeriod: {
      type: String,
      default: '',
    },
    siteVisitReport: {
      type: String,
      default: '',
    },
    siteVisitReportDate: {
      type: Date,
      default: null,
    },
    siteVisitNotes: {
      type: String,
      default: '',
    },
    siteVisitInspector: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate a human-readable shelterApplicationId and format registrationNumber before save
shelterApplicationSchema.pre('save', async function () {
  if (this.registrationNumber && typeof this.registrationNumber === 'string') {
    this.registrationNumber = this.registrationNumber.trim().toUpperCase();
  }
  if (!this.shelterApplicationId) {
    const count = await mongoose.model('ShelterApplication').countDocuments();
    this.shelterApplicationId = `SA-${String(count + 1).padStart(4, '0')}`;
  }
});

module.exports = mongoose.model('ShelterApplication', shelterApplicationSchema);
