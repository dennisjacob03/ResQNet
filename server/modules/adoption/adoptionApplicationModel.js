const mongoose = require('mongoose');

const adoptionApplicationSchema = new mongoose.Schema(
  {
    adoptionId: {
      type: String,
      unique: true,
      index: true,
    },
    // Selected pet reference
    pet_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Animal',
      required: [true, 'Pet ID is required'],
      index: true,
    },
    // User who applied (contact details can be populated from User)
    applicant_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Applicant ID is required'],
      index: true,
    },
    // Associated shelter (for shelter management portal)
    shelter_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shelter',
      default: null,
      index: true,
    },
    // Application status
    application_status: {
      type: String,
      enum: {
        values: [
          'Pending',
          'Under Review',
          'Shelter Visit',
          'Approved',
          'Rejected',
          'Withdrawn',
        ],
        message: '{VALUE} is not a valid application status',
      },
      default: 'Pending',
      index: true,
    },
    // Housing type
    housing_type: {
      type: String,
      enum: {
        values: ['House', 'Apartment', 'Townhouse', 'Mobile Home', 'Other'],
        message: '{VALUE} is not a valid housing type',
      },
      required: [true, 'Housing type is required'],
    },
    // Ownership status
    ownership_status: {
      type: String,
      enum: {
        values: ['Own', 'Rent'],
        message: '{VALUE} is not a valid ownership status',
      },
      required: [true, 'Ownership status is required'],
    },
    // Landlord details (required when ownership_status is 'Rent')
    landlord_details: {
      name: {
        type: String,
        trim: true,
        default: '',
      },
      phone: {
        type: String,
        trim: true,
        default: '',
      },
    },
    // Agreements
    agreements: {
      return_policy: {
        type: Boolean,
        required: [true, 'Return policy agreement is required'],
        default: false,
      },
    },
    // Timestamp when submitted
    submitted_at: {
      type: Date,
      default: Date.now,
    },
    // Optional applicant notes/message
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    // Shelter visit appointment
    appointment: {
      date: {
        type: Date,
        default: null,
      },
      time: {
        type: String,
        trim: true,
        default: '',
      },
      location: {
        type: String,
        trim: true,
        default: '',
      },
      notes: {
        type: String,
        trim: true,
        default: '',
      },
      status: {
        type: String,
        enum: ['None', 'Scheduled', 'Completed', 'Cancelled'],
        default: 'None',
      },
      scheduledAt: {
        type: Date,
        default: null,
      },
    },
    // Shelter visit inspection & valuation report
    visitReport: {
      reportText: {
        type: String,
        trim: true,
        default: '',
      },
      decision: {
        type: String,
        enum: ['', 'Approved', 'Rejected'],
        default: '',
      },
      checks: {
        visitDone: {
          type: Boolean,
          default: false,
        },
        housingVerified: {
          type: Boolean,
          default: false,
        },
        agreementConfirmed: {
          type: Boolean,
          default: false,
        },
      },
      submittedAt: {
        type: Date,
        default: null,
      },
      submittedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
      },
    },
    // Shelter / Admin review remarks
    remarks: {
      type: String,
      trim: true,
      default: '',
    },
    // Soft deletion support
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
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual aliases for backwards compatibility and easy access
adoptionApplicationSchema.virtual('animalId').get(function () {
  return this.pet_id;
});

adoptionApplicationSchema.virtual('userId').get(function () {
  return this.applicant_id;
});

adoptionApplicationSchema.virtual('status').get(function () {
  return this.application_status;
});

adoptionApplicationSchema.virtual('shelterId').get(function () {
  return this.shelter_id;
});

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
