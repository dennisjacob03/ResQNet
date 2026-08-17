const mongoose = require('mongoose');

const vetStaffSchema = new mongoose.Schema(
  {
    vetStaffId: {
      type: String,
      unique: true,
    },
    shelterId: {
      type: String,
      required: [true, 'Shelter ID is required'],
      ref: 'Shelter',
    },
    vetStaffApplicationId: {
      type: String,
      required: [true, 'Vet staff application ID is required'],
      ref: 'VetStaffApplication',
    },
    vetStaffNumber: {
      type: String,
      unique: true,
    },
    position: {
      type: String,
      enum: {
        values: ['Veterinary Doctor', 'Veterinary Nurse'],
        message: '{VALUE} is not a valid position',
      },
      required: [true, 'Position is required'],
    },
    joiningDate: {
      type: Date,
      required: [true, 'Joining date is required'],
    },
    experience: {
      type: Number,
      default: 0,
      min: 0,
    },
    availability: {
      type: String,
      enum: {
        values: ['Available', 'On Leave'],
        message: '{VALUE} is not a valid availability status',
      },
      default: 'Available',
    },
    status: {
      type: String,
      enum: {
        values: ['Active', 'Inactive'],
        message: '{VALUE} is not a valid status',
      },
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate vetStaffId and vetStaffNumber before save
vetStaffSchema.pre('save', async function () {
  if (!this.vetStaffId || !this.vetStaffNumber) {
    const records = await mongoose
      .model('VetStaff')
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
      this.vetStaffId = `VS-${String(nextSeq).padStart(4, '0')}`;
    }
    if (!this.vetStaffNumber) {
      this.vetStaffNumber = `VSN${String(nextSeq).padStart(3, '0')}`;
    }
  }
});

module.exports = mongoose.model('VetStaff', vetStaffSchema);
