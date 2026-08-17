const mongoose = require('mongoose');

const medicalReminderSchema = new mongoose.Schema(
  {
    medicineReminderId: {
      type: String,
      unique: true,
    },
    medicineRecordId: {
      type: String,
      required: [true, 'Medicine record ID is required'],
      ref: 'MedicineRecord',
    },
    reminderTime: {
      type: Date,
      required: [true, 'Reminder time is required'],
    },
    status: {
      type: String,
      enum: {
        values: ['Pending', 'Completed', 'Missed'],
        message: '{VALUE} is not a valid reminder status',
      },
      default: 'Pending',
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
