const mongoose = require('mongoose');

const vetStaffApplicationSchema = new mongoose.Schema(
  {
    vetStaffApplicationId: {
      type: String,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    password: {
      type: String,
      default: '',
    },
    district: {
      type: String,
      default: '',
      trim: true,
    },
    city: {
      type: String,
      default: '',
      trim: true,
    },
    position: {
      type: String,
      enum: ['Veterinary Doctor', 'Veterinary Nurse'],
      default: 'Veterinary Doctor',
    },
    councilRegistrationNumber: {
      type: String,
      required: [true, 'Veterinary Council registration number is required'],
      trim: true,
    },
    qualification: {
      type: String,
      default: 'BVSc & AH',
      trim: true,
    },
    specialization: {
      type: String,
      default: 'General Canine & Feline Medicine',
      trim: true,
    },
    experienceYears: {
      type: Number,
      default: 0,
      min: 0,
    },
    targetShelterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shelter',
      default: null, // null means Open to All Shelters
    },
    targetShelterName: {
      type: String,
      default: 'All Shelters (Open)',
      trim: true,
    },
    assignedShelterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shelter',
      default: null,
    },
    assignedShelterName: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ['Pending', 'Interview Scheduled', 'Approved', 'Rejected'],
        message: '{VALUE} is not a valid application status',
      },
      default: 'Pending',
    },
    resume: {
      type: String, // Base64 or bio text
      default: '',
    },
    applicationDate: {
      type: Date,
      default: Date.now,
    },
    // Interview Scheduling Details
    interviewScheduleDate: {
      type: Date,
      default: null,
    },
    interviewTimeSlot: {
      type: String,
      default: '',
      trim: true,
    },
    interviewLocation: {
      type: String,
      default: '',
      trim: true,
    },
    interviewInterviewer: {
      type: String,
      default: '',
      trim: true,
    },
    interviewNotes: {
      type: String,
      default: '',
      trim: true,
    },
    // Interview Evaluation Report Details
    interviewReport: {
      type: String,
      default: '',
      trim: true,
    },
    interviewReportDate: {
      type: Date,
      default: null,
    },
    interviewReportDecision: {
      type: String,
      enum: ['Approved', 'Rejected', null],
      default: null,
    },
    interviewChecks: {
      licenseVerified: { type: Boolean, default: false },
      surgicalCompetence: { type: Boolean, default: false },
      animalHandlingReadiness: { type: Boolean, default: false },
      shelterAgreement: { type: Boolean, default: false },
    },
    rejectionReason: {
      type: String,
      default: '',
      trim: true,
    },
    // Assigned Vet Staff Identifiers upon approval
    vetStaffId: {
      type: String,
      default: null,
    },
    vetStaffNumber: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate vetStaffApplicationId (e.g. VSA-0001) before save
vetStaffApplicationSchema.pre('save', async function () {
  if (!this.vetStaffApplicationId) {
    const records = await mongoose
      .model('VetStaffApplication')
      .find({}, { vetStaffApplicationId: 1 })
      .lean();

    let maxSeq = 0;
    records.forEach((r) => {
      if (r.vetStaffApplicationId) {
        const match = r.vetStaffApplicationId.match(/^VSA-(\d+)$/i);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxSeq) maxSeq = num;
        }
      }
    });

    this.vetStaffApplicationId = `VSA-${String(maxSeq + 1).padStart(4, '0')}`;
  }
});

module.exports = mongoose.model('VetStaffApplication', vetStaffApplicationSchema);
