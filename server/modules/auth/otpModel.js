const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      index: true,
    },
    otp: {
      type: String,
      required: [true, 'OTP code is required'],
    },
    purpose: {
      type: String,
      enum: ['registration', 'forgot_password'],
      required: [true, 'OTP purpose is required'],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // Mongoose TTL index to automatically remove expired OTPs
    },
  },
  {
    timestamps: true,
  }
);

const OTP = mongoose.model('OTP', otpSchema);

module.exports = OTP;
