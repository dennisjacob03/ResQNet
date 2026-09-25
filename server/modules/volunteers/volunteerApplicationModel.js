const mongoose = require('mongoose');

const volunteerApplicationSchema = new mongoose.Schema(
  {
    volunteerApplicationId: {
      type: String,
      unique: true,
    },
    volunteerId: {
      type: String,
      default: '',
      trim: true,
    },
    applicantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Applicant ID is required'],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    district: {
      type: String,
      required: [true, 'District is required'],
      trim: true,
    },
    city: {
      type: String,
      default: '',
      trim: true,
    },
    state: {
      type: String,
      default: 'Kerala',
      trim: true,
    },
    address: {
      type: String,
      default: '',
      trim: true,
    },
    emergencyContact: {
      name: { type: String, default: '', trim: true },
      phone: { type: String, default: '', trim: true },
      relation: { type: String, default: '', trim: true },
    },
    availability: {
      type: [String],
      default: ['Weekends'],
    },
    interests: {
      type: [String],
      default: ['Animal Feeding & Care'],
    },
    skills: {
      type: [String],
      default: [],
    },
    experienceNotes: {
      type: String,
      default: '',
      trim: true,
    },
    hasVehicle: {
      type: Boolean,
      default: false,
    },
    vehicleType: {
      type: String,
      enum: {
        values: ['None', 'Bike', 'Car', 'Van', 'Other', ''],
        message: '{VALUE} is not a valid vehicle type',
      },
      default: 'None',
    },
    vehicleNumber: {
      type: String,
      default: '',
      trim: true,
      uppercase: true,
    },
    agreedToTerms: {
      type: Boolean,
      default: true,
    },
    applicationStatus: {
      type: String,
      enum: ['Pending', 'Volunteer Visit', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    visitScheduleDate: {
      type: Date,
      default: null,
    },
    visitValuationPeriod: {
      type: String,
      default: '',
      trim: true,
    },
    visitCoordinator: {
      type: String,
      default: '',
      trim: true,
    },
    visitNotes: {
      type: String,
      default: '',
      trim: true,
    },
    visitReport: {
      type: String,
      default: '',
      trim: true,
    },
    visitReportDate: {
      type: Date,
      default: null,
    },
    visitReportDecision: {
      type: String,
      default: '',
    },
    visitChecks: {
      identityVerified: {
        type: Boolean,
        default: false,
      },
      animalHandlingReady: {
        type: Boolean,
        default: false,
      },
      safetyOrientationDone: {
        type: Boolean,
        default: false,
      },
      commitmentAgreement: {
        type: Boolean,
        default: false,
      },
    },
    managedByRescueTeamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RescueTeam',
      default: null,
    },
    managedByRescueTeamName: {
      type: String,
      default: '',
      trim: true,
    },
    assignedRescueTeamNumber: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate volunteerApplicationId (e.g. VAP-0001) before save
volunteerApplicationSchema.pre('save', async function () {
  if (this.vehicleNumber && typeof this.vehicleNumber === 'string') {
    this.vehicleNumber = this.vehicleNumber.trim().toUpperCase();
  }

  if (!this.volunteerApplicationId) {
    const records = await mongoose
      .model('VolunteerApplication')
      .find({}, { volunteerApplicationId: 1 })
      .lean();

    let maxSeq = 0;
    records.forEach((r) => {
      if (r.volunteerApplicationId) {
        const match = r.volunteerApplicationId.match(/^VAP-(\d+)$/i);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxSeq) maxSeq = num;
        }
      }
    });

    this.volunteerApplicationId = `VAP-${String(maxSeq + 1).padStart(4, '0')}`;
  }

  // Generate official volunteerId (e.g. VOL-0001) if approved and missing
  if (this.applicationStatus === 'Approved' && !this.volunteerId) {
    const approvedRecords = await mongoose
      .model('VolunteerApplication')
      .find({ volunteerId: { $exists: true, $ne: '' } }, { volunteerId: 1 })
      .lean();

    let maxVolSeq = 0;
    approvedRecords.forEach((r) => {
      if (r.volunteerId) {
        const match = r.volunteerId.match(/^VOL-(\d+)$/i);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxVolSeq) maxVolSeq = num;
        }
      }
    });

    this.volunteerId = `VOL-${String(maxVolSeq + 1).padStart(4, '0')}`;
  }

  if (this.applicantId && !this.userId) {
    this.userId = this.applicantId;
  } else if (this.userId && !this.applicantId) {
    this.applicantId = this.userId;
  }
});

module.exports = mongoose.model('VolunteerApplication', volunteerApplicationSchema);
