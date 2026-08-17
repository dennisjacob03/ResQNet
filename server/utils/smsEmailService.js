const emailService = require('./emailService');

/**
 * SMS & Email Unified Service Wrapper for ResQNet
 */

// Re-export all email service methods
const {
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendEmergencyAlertEmail,
  sendAdoptionStatusEmail,
  sendVerificationEmail
} = emailService;

/**
 * Placeholder SMS Dispatcher (Twilio / Firebase SMS Integration Ready)
 */
const sendSMS = async ({ to, message }) => {
  console.log(`\n📲 [SMS SERVICE DISPATCH] To: ${to} | Message: ${message}\n`);
  return { success: true, messageId: `sms-${Date.now()}` };
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendEmergencyAlertEmail,
  sendAdoptionStatusEmail,
  sendVerificationEmail,
  sendSMS
};
