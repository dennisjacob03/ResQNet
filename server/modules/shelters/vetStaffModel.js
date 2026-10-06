const mongoose = require("mongoose");

const vetStaffSchema = new mongoose.Schema(
  {
    vetStaffId: {
      type: String,
      unique: true,
    },
    shelterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shelter",
      required: [true, "Shelter ID is required"],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    vetStaffApplicationId: {
      type: String,
      default: "",
    },
    vetStaffNumber: {
      type: String,
      unique: true,
    },
    fullName: {
      type: String,
      required: [true, "Staff name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Staff email is required"],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },
    address: { type: String, default: "", trim: true },
    pincode: { type: String, default: "", trim: true },
    state: { type: String, default: "", trim: true },
    district: { type: String, default: "", trim: true },
    city: { type: String, default: "", trim: true },
    location: { type: String, default: "", trim: true },
    councilRegistrationNumber: {
      type: String,
      default: "",
      trim: true,
    },
    qualification: {
      type: String,
      default: "BVSc & AH",
      trim: true,
    },
    specialization: {
      type: String,
      default: "General Practice",
      trim: true,
    },
    position: {
      type: String,
      enum: {
        values: ["Veterinary Doctor", "Veterinary Nurse"],
        message: "{VALUE} is not a valid position",
      },
      required: [true, "Position is required"],
    },
    joiningDate: {
      type: Date,
      required: [true, "Joining date is required"],
      default: Date.now,
    },
    experience: {
      type: Number,
      default: 0,
      min: 0,
    },
    availability: {
      type: String,
      enum: {
        values: ["Available", "On Leave"],
        message: "{VALUE} is not a valid availability status",
      },
      default: "Available",
    },
    status: {
      type: String,
      enum: {
        values: ["Active", "Inactive"],
        message: "{VALUE} is not a valid status",
      },
      default: "Active",
    },
    canManageMedicineStock: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Auto-generate vetStaffId and vetStaffNumber before save
vetStaffSchema.pre("save", async function () {
  if (!this.vetStaffId || !this.vetStaffNumber) {
    const records = await mongoose
      .model("VetStaff")
      .find({}, { vetStaffId: 1 })
      .lean();

    let maxSeq = 0;
    records.forEach((r) => {
      if (r.vetStaffId) {
        const match = r.vetStaffId.match(/^VS-(\d+)$/i);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxSeq) maxSeq = num;
        }
      }
    });

    const nextSeq = maxSeq + 1;

    if (!this.vetStaffId) {
      this.vetStaffId = `VS-${String(nextSeq).padStart(4, "0")}`;
    }
    if (!this.vetStaffNumber) {
      this.vetStaffNumber = `VSN${String(nextSeq).padStart(3, "0")}`;
    }
  }
});

module.exports = mongoose.model("VetStaff", vetStaffSchema);
