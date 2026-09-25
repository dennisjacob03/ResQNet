const mongoose = require('mongoose');

const rescueRequestSchema = new mongoose.Schema(
  {
    rescueRequestId: {
      type: String,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    categoryId: {
      type: String,
      default: 'CAT-0001',
      ref: 'Category',
    },
    animalType: {
      type: String,
      default: 'Dog',
      trim: true,
    },
    animalCondition: {
      type: String,
      default: 'Injured',
      trim: true,
    },
    type: {
      type: String,
      enum: {
        values: ['Injured', 'Lost', 'Aggressive', 'Abandoned', 'Sick', 'Dead', 'Stranded', 'Deceased'],
        message: '{VALUE} is not a valid rescue type',
      },
      default: 'Injured',
    },
    priority: {
      type: String,
      enum: {
        values: ['Low', 'Medium', 'High', 'Emergency'],
        message: '{VALUE} is not a valid priority level',
      },
      default: 'Medium',
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    image: {
      type: String, // Base64 encoded image or URL
      default: '',
    },
    locationAddress: {
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
    latitude: {
      type: Number,
      required: [true, 'Latitude is required'],
    },
    longitude: {
      type: Number,
      required: [true, 'Longitude is required'],
    },
    status: {
      type: String,
      enum: {
        values: ['Pending', 'Accepted', 'In Transit', 'Completed', 'Cancelled'],
        message: '{VALUE} is not a valid rescue status',
      },
      default: 'Pending',
    },
    rescueStage: {
      type: String,
      enum: [
        'Broadcasted',
        'Accepted',
        'En Route',
        'Arrived on Scene',
        'Animal Rescued',
        'Transporting to Shelter',
        'Delivered to Shelter',
        'Completed',
        'Cancelled',
      ],
      default: 'Broadcasted',
    },
    // Multi-team broadcast pool tracking
    candidateTeams: [
      {
        teamId: { type: String },
        teamObjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'RescueTeam' },
        teamName: { type: String, default: '' },
        rescueTeamNumber: { type: String, default: '' },
        vehicleNumber: { type: String, default: '' },
        vehicleType: { type: String, default: '' },
        phone: { type: String, default: '' },
        distanceKm: { type: Number, default: 0 },
        status: {
          type: String,
          enum: ['Notified', 'Accepted', 'Declined', 'Assigned', 'Backup'],
          default: 'Notified',
        },
        responseTime: { type: Date, default: null },
        declineReason: { type: String, default: '' },
        location: {
          latitude: { type: Number },
          longitude: { type: Number },
        },
      },
    ],
    // Selected / Nearest Assigned Team
    assignedRescueTeamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RescueTeam',
      default: null,
    },
    assignedRescueTeamNumber: {
      type: String,
      default: '',
    },
    assignedRescueTeamName: {
      type: String,
      default: '',
    },
    assignedRescueTeamPhone: {
      type: String,
      default: '',
    },
    assignedRescueTeamVehicle: {
      type: String,
      default: '',
    },
    assignedRescueTeamLocation: {
      latitude: { type: Number, default: null },
      longitude: { type: Number, default: null },
      updatedAt: { type: Date, default: Date.now },
    },
    // Nearby Shelter Routing
    destinationShelterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shelter',
      default: null,
    },
    destinationShelterName: {
      type: String,
      default: '',
    },
    destinationShelterLocation: {
      latitude: { type: Number, default: null },
      longitude: { type: Number, default: null },
      address: { type: String, default: '' },
    },
    shelterNotified: {
      type: Boolean,
      default: false,
    },
    shelterNotifiedAt: {
      type: Date,
      default: null,
    },
    shelterIntakeStatus: {
      type: String,
      enum: ['None', 'Notified', 'En Route', 'Admitted', 'Declined'],
      default: 'None',
    },
    // Timeline of transit & operations
    trackingTimeline: [
      {
        stage: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        note: { type: String, default: '' },
        location: {
          latitude: { type: Number },
          longitude: { type: Number },
        },
      },
    ],
    rescuedAt: {
      type: Date,
      default: null,
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

// Auto-generate rescueRequestId (e.g. RR-0001) before save
rescueRequestSchema.pre('save', async function () {
  if (!this.rescueRequestId) {
    const records = await mongoose
      .model('RescueRequest')
      .find({}, { rescueRequestId: 1 })
      .lean();

    let maxSeq = 0;
    records.forEach((r) => {
      if (r.rescueRequestId) {
        const match = r.rescueRequestId.match(/^RR-(\d+)$/i);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxSeq) maxSeq = num;
        }
      }
    });

    this.rescueRequestId = `RR-${String(maxSeq + 1).padStart(4, '0')}`;
  }
});

module.exports = mongoose.model('RescueRequest', rescueRequestSchema);
