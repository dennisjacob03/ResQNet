const mongoose = require('mongoose');

const loginSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    loginTime: {
      type: Date,
      default: Date.now,
    },
    logoutTime: {
      type: Date,
      default: null,
    },
    ipAddress: {
      type: String,
      default: 'Unknown',
    },
    deviceInfo: {
      type: String,
      default: 'Unknown',
    },
  },
  {
    timestamps: true,
  }
);

const LoginLog = mongoose.model('LoginLog', loginSchema);

module.exports = LoginLog;
