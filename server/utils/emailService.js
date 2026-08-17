const nodemailer = require('nodemailer');
const logger = require('./logger');

/**
 * Create Nodemailer Transporter
 * Falls back to mock console logger if SMTP credentials are missing in dev.
 */
const createTransporter = () => {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT, 10) || 587;
  const secure = process.env.SMTP_SECURE === 'true';
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  // Development/Fallback Transporter when SMTP config is pending
  return {
    isMock: true,
    sendMail: async (mailOptions) => {
      console.log('\n=================== 📧 [MOCK EMAIL SERVICE] ===================');
      console.log(`TO:       ${mailOptions.to}`);
      console.log(`FROM:     ${mailOptions.from}`);
      console.log(`SUBJECT:  ${mailOptions.subject}`);
      console.log('---------------------------------------------------------------');
      console.log(mailOptions.text || mailOptions.html.replace(/<[^>]*>?/gm, ''));
      console.log('=================================================================\n');
      
      if (logger && logger.info) {
        logger.info(`[Mock Email Sent] To: ${mailOptions.to} | Subject: ${mailOptions.subject}`);
      }

      return {
        messageId: `mock-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        response: '250 Mock Email logged successfully'
      };
    },
    verify: async () => true
  };
};

const transporter = createTransporter();

/**
 * Verify Transporter SMTP Connection on Startup
 */
const verifyTransporter = async () => {
  try {
    if (transporter.isMock) {
      console.log('ℹ️ Email Server: Running in Development Mock Mode (Console Logging Active)');
      return true;
    }
    await transporter.verify();
    console.log('✅ Email Server: SMTP Connection verified successfully');
    return true;
  } catch (error) {
    console.error('❌ Email Server SMTP Error:', error.message);
    return false;
  }
};

/**
 * Base Responsive HTML Wrapper for ResQNet Email Templates
 */
const getBaseEmailHtml = (title, contentHtml) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
      body { margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1e293b; }
      .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
      .header { background-color: #237737; padding: 24px; text-align: center; color: #ffffff; }
      .logo { font-size: 24px; font-weight: 800; tracking-tight: -0.5px; margin: 0; color: #ffffff; }
      .logo span { color: #86efac; }
      .content { padding: 32px 24px; line-height: 1.6; }
      .footer { background-color: #0f172a; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; }
      .button { display: inline-block; padding: 12px 24px; background-color: #237737; color: #ffffff !important; font-weight: bold; border-radius: 8px; text-decoration: none; margin-top: 16px; }
      .badge { display: inline-block; padding: 4px 12px; background-color: #dcf4e4; color: #1e6e31; font-size: 12px; font-weight: bold; border-radius: 20px; margin-bottom: 12px; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1 class="logo">ResQ<span>Net</span></h1>
        <div style="font-size: 12px; margin-top: 4px; opacity: 0.9;">AI-Powered Emergency Animal Rescue Network</div>
      </div>
      <div class="content">
        ${contentHtml}
      </div>
      <div class="footer">
        <p>© ${new Date().getFullYear()} ResQNet Platform. All rights reserved.</p>
        <p style="margin-top: 6px;">24/7 Animal Welfare & Emergency Dispatch System</p>
      </div>
    </div>
  </body>
  </html>
  `;
};

/**
 * Generic Send Email Function
 */
const sendEmail = async ({ to, subject, html, text, attachments }) => {
  try {
    const fromName = process.env.FROM_NAME || 'ResQNet Animal Rescue';
    const fromEmail = process.env.FROM_EMAIL || 'noreply@resqnet.org';

    const mailOptions = {
      from: `"${fromName}" <${fromEmail}>`,
      to,
      subject,
      html: html || getBaseEmailHtml(subject, `<p>${text}</p>`),
      text: text || (html ? html.replace(/<[^>]*>?/gm, '') : ''),
      attachments
    };

    const info = await transporter.sendMail(mailOptions);
    if (logger && logger.info) {
      logger.info(`Email sent to ${to}: ${info.messageId}`);
    }
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('sendEmail Error:', error);
    if (logger && logger.error) {
      logger.error(`Failed to send email to ${to}: ${error.message}`);
    }
    return { success: false, error: error.message };
  }
};

/**
 * Send Welcome Email to New Registrants
 */
const sendWelcomeEmail = async (user) => {
  const subject = 'Welcome to ResQNet Animal Rescue Platform 🐾';
  const html = getBaseEmailHtml(
    subject,
    `
    <span class="badge">Welcome Onboard</span>
    <h2 style="color: #0f172a; margin-top: 0;">Hello ${user.fullName || user.email}!</h2>
    <p>Thank you for joining <strong>ResQNet</strong> as a <strong>${user.role || 'Member'}</strong>.</p>
    <p>Our mission is to save injured and homeless animals faster through real-time GPS tracking, AI emergency triage, and integrated shelter and veterinary care.</p>
    <div style="background-color: #f1f5f9; padding: 16px; border-radius: 8px; margin: 20px 0;">
      <strong>Account Details:</strong>
      <ul style="margin: 8px 0 0 0; padding-left: 20px; font-size: 14px;">
        <li>Email: ${user.email}</li>
        <li>Role: ${user.role || 'Public User'}</li>
        <li>Status: Active</li>
      </ul>
    </div>
    <p>You can now report stray animals, track live rescue callouts, or apply for pet adoption.</p>
    <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/login" class="button">Access Your Portal</a>
    `
  );

  return sendEmail({ to: user.email, subject, html });
};

/**
 * Send Password Reset OTP or Token Email
 */
const sendPasswordResetEmail = async (user, resetCodeOrUrl) => {
  const subject = 'ResQNet Password Reset Code';
  const isCode = typeof resetCodeOrUrl === 'string' && resetCodeOrUrl.length <= 8;

  const html = getBaseEmailHtml(
    subject,
    `
    <span class="badge" style="background-color: #fee2e2; color: #991b1b;">Security Alert</span>
    <h2 style="color: #0f172a; margin-top: 0;">Password Reset Request</h2>
    <p>Hello ${user.fullName || 'User'},</p>
    <p>We received a request to reset your password for your ResQNet account (${user.email}).</p>
    ${
      isCode
        ? `
        <div style="text-align: center; margin: 24px 0;">
          <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #237737; background: #f0fdf4; padding: 12px 24px; border-radius: 12px; border: 2px dashed #86efac; display: inline-block;">
            ${resetCodeOrUrl}
          </span>
          <p style="font-size: 12px; color: #64748b; margin-top: 8px;">This verification code expires in 10 minutes.</p>
        </div>
        `
        : `
        <p>Click the button below to set a new password:</p>
        <a href="${resetCodeOrUrl}" class="button">Reset Password</a>
        `
    }
    <p style="font-size: 13px; color: #64748b; margin-top: 20px;">If you did not initiate this request, please ignore this email or contact support immediately.</p>
    `
  );

  return sendEmail({ to: user.email, subject, html });
};

/**
 * Send Emergency Animal Rescue Alert Email to Squads / Vets
 */
const sendEmergencyAlertEmail = async (recipients, alertData) => {
  const subject = `🚨 EMERGENCY ALERT: ${alertData.animalType || 'Animal'} Rescue Reported!`;
  const recipientsList = Array.isArray(recipients) ? recipients.join(',') : recipients;

  const html = getBaseEmailHtml(
    subject,
    `
    <span class="badge" style="background-color: #fef2f2; color: #dc2626;">High Priority Dispatch</span>
    <h2 style="color: #dc2626; margin-top: 0;">Urgent Animal Rescue Callout</h2>
    <p>A new emergency incident has been logged on the ResQNet platform requiring immediate attention.</p>
    
    <div style="background-color: #fff1f2; border-left: 4px solid #e11d48; padding: 16px; margin: 16px 0; border-radius: 0 8px 8px 0;">
      <h3 style="margin: 0 0 8px 0; color: #9f1239;">Incident Summary</h3>
      <p style="margin: 4px 0; font-size: 14px;"><strong>Animal Type:</strong> ${alertData.animalType || 'Stray/Injured'}</p>
      <p style="margin: 4px 0; font-size: 14px;"><strong>Severity Triage:</strong> <span style="color: #dc2626; font-weight: bold;">${alertData.severity || 'CRITICAL'}</span></p>
      <p style="margin: 4px 0; font-size: 14px;"><strong>Location:</strong> ${alertData.location || 'GPS Coordinates logged'}</p>
      <p style="margin: 4px 0; font-size: 14px;"><strong>Reporter Contact:</strong> ${alertData.reporterPhone || 'Via ResQNet App'}</p>
      ${alertData.notes ? `<p style="margin: 4px 0; font-size: 14px;"><strong>Notes:</strong> ${alertData.notes}</p>` : ''}
    </div>

    <p>Please log into the Rescue Dispatch Dashboard to accept the callout and view live GPS navigation.</p>
    <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard" class="button" style="background-color: #dc2626;">View Emergency Map</a>
    `
  );

  return sendEmail({ to: recipientsList, subject, html });
};

/**
 * Send Adoption Status Update Email
 */
const sendAdoptionStatusEmail = async (user, adoptionData) => {
  const statusColor = adoptionData.status === 'Approved' ? '#237737' : adoptionData.status === 'Rejected' ? '#dc2626' : '#d97706';
  const subject = `Update on your Adoption Application for ${adoptionData.petName || 'Pet'}`;

  const html = getBaseEmailHtml(
    subject,
    `
    <span class="badge">Adoption Portal</span>
    <h2 style="color: #0f172a; margin-top: 0;">Adoption Status Update</h2>
    <p>Dear ${user.fullName || 'Applicant'},</p>
    <p>Your adoption application for <strong>${adoptionData.petName}</strong> has been updated to:</p>
    
    <div style="text-align: center; padding: 16px; background-color: #f8fafc; border-radius: 8px; margin: 16px 0;">
      <span style="font-size: 20px; font-weight: bold; color: ${statusColor};">
        ${adoptionData.status.toUpperCase()}
      </span>
    </div>

    <p>${adoptionData.remarks || 'Thank you for choosing to adopt and give a pet a forever home.'}</p>
    <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard" class="button">View Application Details</a>
    `
  );

  return sendEmail({ to: user.email, subject, html });
};

/**
 * Send Email Verification OTP
 */
const sendVerificationEmail = async (email, otpCode, fullName) => {
  const subject = 'Verify your email for ResQNet';

  const html = getBaseEmailHtml(
    subject,
    `
    <span class="badge" style="background-color: #dbeafe; color: #1e40af;">Account Verification</span>
    <h2 style="color: #0f172a; margin-top: 0;">Verify Your Email</h2>
    <p>Hello ${fullName || 'User'},</p>
    <p>Thank you for registering with ResQNet. Please use the verification code below to complete your sign-up process.</p>
    <div style="text-align: center; margin: 24px 0;">
      <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #237737; background: #f0fdf4; padding: 12px 24px; border-radius: 12px; border: 2px dashed #86efac; display: inline-block;">
        ${otpCode}
      </span>
      <p style="font-size: 12px; color: #64748b; margin-top: 8px;">This verification code expires in 10 minutes.</p>
    </div>
    <p style="font-size: 13px; color: #64748b; margin-top: 20px;">If you did not initiate this request, please ignore this email.</p>
    `
  );

  return sendEmail({ to: email, subject, html });
};

/**
 * Send Shelter Approval & Temporary Password Email
 */
const sendShelterApprovalEmail = async (email, { shelterName, shelterNumber, shelterId, tempPassword, loginUrl }) => {
  const subject = `🎉 Shelter Application Approved - Welcome to ResQNet!`;
  const portalUrl = loginUrl || `${process.env.CLIENT_URL || 'http://localhost:5173'}/login`;

  const html = getBaseEmailHtml(
    subject,
    `
    <span class="badge" style="background-color: #dcfce7; color: #15803d;">Application Approved</span>
    <h2 style="color: #15803d; margin-top: 0;">Welcome, ${shelterName}!</h2>
    <p>Congratulations! Your shelter registration application has been reviewed and <strong>officially approved</strong> by the ResQNet Administration team.</p>
    
    <p>A dedicated <strong>Shelter Manager</strong> account has been provisioned for your organization to access the Shelter Dashboard, manage rescued animals, track cages, and oversee adoptions.</p>

    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0;">
      <h3 style="margin: 0 0 12px 0; color: #0f172a; font-size: 15px;">Your Shelter Login Credentials</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr>
          <td style="padding: 6px 0; color: #64748b; width: 150px;"><strong>Shelter Number:</strong></td>
          <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${shelterNumber || shelterId || 'Approved'}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;"><strong>Registered Email:</strong></td>
          <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${email}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;"><strong>Temporary Password:</strong></td>
          <td style="padding: 6px 0; font-family: monospace; font-size: 16px; font-weight: 800; color: #237737; letter-spacing: 1px;">
            ${tempPassword}
          </td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;"><strong>Assigned Role:</strong></td>
          <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">Shelter</td>
        </tr>
      </table>
    </div>

    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 0 8px 8px 0; margin: 16px 0; font-size: 13px; color: #92400e;">
      <strong>⚠️ Security Notice:</strong> Please sign in with your temporary password and update it from your profile settings.
    </div>

    <div style="text-align: center; margin: 24px 0;">
      <a href="${portalUrl}" class="button" style="background-color: #237737; display: inline-block;">Log In to Shelter Dashboard</a>
    </div>

    <p style="font-size: 13px; color: #64748b; margin-top: 20px;">If you have any questions or require technical assistance, please contact our support team.</p>
    `
  );

  return sendEmail({ to: email, subject, html });
};

module.exports = {
  transporter,
  verifyTransporter,
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendEmergencyAlertEmail,
  sendAdoptionStatusEmail,
  sendVerificationEmail,
  sendShelterApprovalEmail,
};
