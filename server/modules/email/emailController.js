const { 
  sendEmail, 
  sendWelcomeEmail, 
  sendPasswordResetEmail, 
  sendEmergencyAlertEmail,
  sendAdoptionStatusEmail
} = require('../../utils/emailService');

/**
 * @desc    Send a test email to verify SMTP configuration
 * @route   POST /api/email/test
 * @access  Public / Admin
 */
const sendTestEmail = async (req, res) => {
  try {
    const { to } = req.body;
    const recipient = to || 'test@example.com';

    const result = await sendEmail({
      to: recipient,
      subject: 'ResQNet Email Server Connectivity Test',
      html: `
        <h2 style="color: #237737;">ResQNet Email Server Test Successful</h2>
        <p>This email confirms that your ResQNet backend email service and SMTP settings are operational.</p>
        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
      `
    });

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: `Test email processed successfully for ${recipient}`,
        messageId: result.messageId
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to send test email',
      error: result.error
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Send custom transactional email
 * @route   POST /api/email/send
 * @access  Public / Authenticated
 */
const sendCustomEmail = async (req, res) => {
  try {
    const { to, type, data, subject, body } = req.body;

    if (!to) {
      return res.status(400).json({
        success: false,
        message: 'Recipient email ("to") is required'
      });
    }

    let result;

    switch (type) {
      case 'welcome':
        result = await sendWelcomeEmail({ email: to, fullName: data?.fullName, role: data?.role });
        break;
      case 'password-reset':
        result = await sendPasswordResetEmail({ email: to, fullName: data?.fullName }, data?.code || data?.resetUrl || '123456');
        break;
      case 'emergency-alert':
        result = await sendEmergencyAlertEmail(to, data || {});
        break;
      case 'adoption-status':
        result = await sendAdoptionStatusEmail({ email: to, fullName: data?.fullName }, data || { petName: 'Pet', status: 'Pending' });
        break;
      default:
        if (!subject || (!body && !req.body.html)) {
          return res.status(400).json({
            success: false,
            message: 'Subject and body/html are required for custom email'
          });
        }
        result = await sendEmail({ to, subject, html: req.body.html, text: body });
    }

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: `Email dispatched successfully to ${to}`,
        messageId: result.messageId
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Email delivery failed',
      error: result.error
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  sendTestEmail,
  sendCustomEmail
};
