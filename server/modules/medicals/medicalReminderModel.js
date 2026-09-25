const mongoose = require('mongoose');

const medicalReminderSchema = new mongoose.Schema(
  {
    medicineReminderId: {
      type: String,
      unique: true,
    },
    medicineRecordId: {
      type: String,
      default: '',
      ref: 'MedicineRecord',
    },
    shelterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shelter',
      default: null,
    },
    animalId: {
      type: String,
      default: '',
      ref: 'Animal',
    },
    animalObjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Animal',
      default: null,
    },
    animalName: {
      type: String,
      default: '',
      trim: true,
    },
    reminderType: {
      type: String,
      enum: ['Vaccination Due', 'Post-Op Checkup', 'Routine Examination', 'Medication Schedule'],
      default: 'Vaccination Due',
    },
    reminderTime: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    sentByVetName: {
      type: String,
      default: '',
      trim: true,
    },
    shelterNotified: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: {
        values: ['Pending', 'Completed', 'Missed', 'Sent'],
        message: '{VALUE} is not a valid reminder status',
      },
      default: 'Sent',
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate medicineReminderId (e.g. MREM-0001) before save
medicalReminderSchema.pre('save', async function () {
  if (!this.medicineReminderId) {
    const records = await mongoose
      .model('MedicalReminder')
      .find({}, { medicineReminderId: 1 })
      .lean();

    let maxSeq = 0;
    records.forEach((r) => {
      if (r.medicineReminderId) {
        const match = r.medicineReminderId.match(/^MREM-(\d+)$/i);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxSeq) maxSeq = num;
        }
      }
    });

    this.medicineReminderId = `MREM-${String(maxSeq + 1).padStart(4, '0')}`;
  }
});

module.exports = mongoose.model('MedicalReminder', medicalReminderSchema);
