const mongoose = require("mongoose");

const rescueTeamApplicationSchema = new mongoose.Schema(
  {
    rescueTeamApplicationId: {
      type: String,
      unique: true,
    },
    applicantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Applicant ID is required"],
    },
    rescueTeamName: {
      type: String,
      required: [true, "Team name is required"],
      trim: true,
    },
    applicantName: {
      type: String,
      required: [true, "Team lead name is required"],
      trim: true,
    },
    contactEmail: {
      type: String,
      required: [true, "Contact email is required"],
      trim: true,
      lowercase: true,
    },
    contactPhone: {
      type: String,
      required: [true, "Contact phone is required"],
      trim: true,
    },
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    operatingDistrict: {
      type: String,
      required: [true, "Operating district is required"],
      trim: true,
    },
    coverageZone: {
      type: String,
      default: "",
      trim: true,
    },
    vehicleNumber: {
      type: String,
      required: [true, "Vehicle number is required"],
      trim: true,
      uppercase: true,
    },
    vehicleType: {
      type: String,
      enum: {
        values: ["Van", "Ambulance", "Bike", "Car", "Other"],
        message: "{VALUE} is not a valid vehicle type",
      },
      required: [true, "Vehicle type is required"],
    },
    totalMembers: {
      type: Number,
      required: [true, "Total number of active responders is required"],
      min: [1, "Must have at least 1 responder"],
    },
    equipment: {
      type: [String],
      default: ["First Aid Kit", "Gloves & Handling Gear"],
    },
    address: {
      type: String,
      default: "",
      trim: true,
    },
    pincode: {
      type: String,
      required: [true, "PIN code is required"],
      trim: true,
    },
    state: {
      type: String,
      required: [true, "State is required"],
      trim: true,
    },
    district: {
      type: String,
      required: [true, "District is required"],
      trim: true,
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
    },
    latitude: {
      type: Number,
      default: null,
    },
    longitude: {
      type: Number,
      default: null,
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },
    applicationStatus: {
      type: String,
      enum: ["Pending", "Team Visit", "Approved", "Rejected"],
      default: "Pending",
    },
    teamVisitScheduleDate: {
      type: Date,
      default: null,
    },
    teamVisitValuationPeriod: {
      type: String,
      default: "",
      trim: true,
    },
    teamVisitInspector: {
      type: String,
      default: "",
      trim: true,
    },
    teamVisitNotes: {
      type: String,
      default: "",
      trim: true,
    },
    teamVisitReport: {
      type: String,
      default: "",
      trim: true,
    },
    teamVisitReportDate: {
      type: Date,
      default: null,
    },
    teamVisitReportDecision: {
      type: String,
      default: "",
    },
    teamVisitChecks: {
      vehicleVerified: {
        type: Boolean,
        default: false,
      },
      equipmentVerified: {
        type: Boolean,
        default: false,
      },
      membersVerified: {
        type: Boolean,
        default: false,
      },
      safetyCompliance: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: true,
  },
);

rescueTeamApplicationSchema.pre("validate", function () {
  if (!this.applicantName && this.get("ApplicantName")) {
    this.applicantName = this.get("ApplicantName");
  }
});

// Auto-generate human-readable rescueTeamApplicationId (e.g. RTA-0001) before save
rescueTeamApplicationSchema.pre("save", async function () {
  if (this.vehicleNumber && typeof this.vehicleNumber === "string") {
    this.vehicleNumber = this.vehicleNumber.trim().toUpperCase();
  }
  // Remove legacy duplicate identity fields when an old application is saved again.
  if (!this.applicantName && this.get("ApplicantName")) {
    this.applicantName = this.get("ApplicantName");
  }
  this.set("ApplicantName", undefined);
  this.set("userId", undefined);

  if (!this.rescueTeamApplicationId) {
    const records = await mongoose
      .model("RescueTeamApplication")
      .find({}, { rescueTeamApplicationId: 1 })
      .lean();

    let maxSeq = 0;
    records.forEach((r) => {
      if (r.rescueTeamApplicationId) {
        const match = r.rescueTeamApplicationId.match(/^RTA-(\d+)$/i);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxSeq) maxSeq = num;
        }
      }
    });

    this.rescueTeamApplicationId = `RTA-${String(maxSeq + 1).padStart(4, "0")}`;
  }
});

module.exports = mongoose.model(
  "RescueTeamApplication",
  rescueTeamApplicationSchema,
);
