const nodemailer = require("nodemailer");
const logger = require("./logger");

/**
 * Create Nodemailer Transporter
 * Falls back to mock console logger if SMTP credentials are missing in dev.
 */
const createTransporter = () => {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.SMTP_PORT, 10) || 587;
  const secure = process.env.SMTP_SECURE === "true";
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  // Development/Fallback Transporter when SMTP config is pending
  return {
    isMock: true,
    sendMail: async (mailOptions) => {
      console.log(
        "\n=================== 📧 [MOCK EMAIL SERVICE] ===================",
      );
      console.log(`TO:       ${mailOptions.to}`);
      console.log(`FROM:     ${mailOptions.from}`);
      console.log(`SUBJECT:  ${mailOptions.subject}`);
      console.log(
        "---------------------------------------------------------------",
      );
      console.log(
        mailOptions.text || mailOptions.html.replace(/<[^>]*>?/gm, ""),
      );
      console.log(
        "=================================================================\n",
      );

      if (logger && logger.info) {
        logger.info(
          `[Mock Email Sent] To: ${mailOptions.to} | Subject: ${mailOptions.subject}`,
        );
      }

      return {
        messageId: `mock-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        response: "250 Mock Email logged successfully",
      };
    },
    verify: async () => true,
  };
};

const transporter = createTransporter();

/**
 * Verify Transporter SMTP Connection on Startup
 */
const verifyTransporter = async () => {
  try {
    if (transporter.isMock) {
      console.log(
        "ℹ️ Email Server: Running in Development Mock Mode (Console Logging Active)",
      );
      return true;
    }
    await transporter.verify();
    console.log("✅ Email Server: SMTP Connection verified successfully");
    return true;
  } catch (error) {
    console.error("❌ Email Server SMTP Error:", error.message);
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
    const fromName = process.env.FROM_NAME || "ResQNet Animal Rescue";
    const fromEmail = process.env.FROM_EMAIL || "noreply@resqnet.org";

    const mailOptions = {
      from: `"${fromName}" <${fromEmail}>`,
      to,
      subject,
      html: html || getBaseEmailHtml(subject, `<p>${text}</p>`),
      text: text || (html ? html.replace(/<[^>]*>?/gm, "") : ""),
      attachments,
    };

    const info = await transporter.sendMail(mailOptions);
    if (logger && logger.info) {
      logger.info(`Email sent to ${to}: ${info.messageId}`);
    }
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("sendEmail Error:", error);
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
  const subject = "Welcome to ResQNet Animal Rescue Platform 🐾";
  const html = getBaseEmailHtml(
    subject,
    `
    <span class="badge">Welcome Onboard</span>
    <h2 style="color: #0f172a; margin-top: 0;">Hello ${user.fullName || user.email}!</h2>
    <p>Thank you for joining <strong>ResQNet</strong> as a <strong>${user.role || "Member"}</strong>.</p>
    <p>Our mission is to save injured and homeless animals faster through real-time GPS tracking, AI emergency triage, and integrated shelter and veterinary care.</p>
    <div style="background-color: #f1f5f9; padding: 16px; border-radius: 8px; margin: 20px 0;">
      <strong>Account Details:</strong>
      <ul style="margin: 8px 0 0 0; padding-left: 20px; font-size: 14px;">
        <li>Email: ${user.email}</li>
        <li>Role: ${user.role || "Public User"}</li>
        <li>Status: Active</li>
      </ul>
    </div>
    <p>You can now report stray animals, track live rescue callouts, or apply for pet adoption.</p>
    <a href="${process.env.CLIENT_URL || "http://localhost:5173"}/login" class="button">Access Your Portal</a>
    `,
  );

  return sendEmail({ to: user.email, subject, html });
};

/**
 * Send Password Reset OTP or Token Email
 */
const sendPasswordResetEmail = async (user, resetCodeOrUrl) => {
  const subject = "ResQNet Password Reset Code";
  const isCode =
    typeof resetCodeOrUrl === "string" && resetCodeOrUrl.length <= 8;

  const html = getBaseEmailHtml(
    subject,
    `
    <span class="badge" style="background-color: #fee2e2; color: #991b1b;">Security Alert</span>
    <h2 style="color: #0f172a; margin-top: 0;">Password Reset Request</h2>
    <p>Hello ${user.fullName || "User"},</p>
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
    `,
  );

  return sendEmail({ to: user.email, subject, html });
};

/**
 * Send Emergency Animal Rescue Alert Email to Squads / Vets
 */
const sendEmergencyAlertEmail = async (recipients, alertData) => {
  const subject = `🚨 EMERGENCY ALERT: ${alertData.animalType || "Animal"} Rescue Reported!`;
  const recipientsList = Array.isArray(recipients)
    ? recipients.join(",")
    : recipients;

  const html = getBaseEmailHtml(
    subject,
    `
    <span class="badge" style="background-color: #fef2f2; color: #dc2626;">High Priority Dispatch</span>
    <h2 style="color: #dc2626; margin-top: 0;">Urgent Animal Rescue Callout</h2>
    <p>A new emergency incident has been logged on the ResQNet platform requiring immediate attention.</p>
    
    <div style="background-color: #fff1f2; border-left: 4px solid #e11d48; padding: 16px; margin: 16px 0; border-radius: 0 8px 8px 0;">
      <h3 style="margin: 0 0 8px 0; color: #9f1239;">Incident Summary</h3>
      <p style="margin: 4px 0; font-size: 14px;"><strong>Animal Type:</strong> ${alertData.animalType || "Stray/Injured"}</p>
      <p style="margin: 4px 0; font-size: 14px;"><strong>Severity Triage:</strong> <span style="color: #dc2626; font-weight: bold;">${alertData.severity || "CRITICAL"}</span></p>
      <p style="margin: 4px 0; font-size: 14px;"><strong>Location:</strong> ${alertData.location || "GPS Coordinates logged"}</p>
      <p style="margin: 4px 0; font-size: 14px;"><strong>Reporter Contact:</strong> ${alertData.reporterPhone || "Via ResQNet App"}</p>
      ${alertData.notes ? `<p style="margin: 4px 0; font-size: 14px;"><strong>Notes:</strong> ${alertData.notes}</p>` : ""}
    </div>

    <p>Please log into the Rescue Dispatch Dashboard to accept the callout and view live GPS navigation.</p>
    <a href="${process.env.CLIENT_URL || "http://localhost:5173"}/dashboard" class="button" style="background-color: #dc2626;">View Emergency Map</a>
    `,
  );

  return sendEmail({ to: recipientsList, subject, html });
};

/**
 * Send Adoption Status Update Email
 */
const sendAdoptionStatusEmail = async (user, adoptionData) => {
  const statusColor =
    adoptionData.status === "Approved"
      ? "#237737"
      : adoptionData.status === "Rejected"
        ? "#dc2626"
        : "#d97706";
  const subject = `Update on your Adoption Application for ${adoptionData.petName || "Pet"}`;

  const html = getBaseEmailHtml(
    subject,
    `
    <span class="badge">Adoption Portal</span>
    <h2 style="color: #0f172a; margin-top: 0;">Adoption Status Update</h2>
    <p>Dear ${user.fullName || "Applicant"},</p>
    <p>Your adoption application for <strong>${adoptionData.petName}</strong> has been updated to:</p>
    
    <div style="text-align: center; padding: 16px; background-color: #f8fafc; border-radius: 8px; margin: 16px 0;">
      <span style="font-size: 20px; font-weight: bold; color: ${statusColor};">
        ${adoptionData.status.toUpperCase()}
      </span>
    </div>

    <p>${adoptionData.remarks || "Thank you for choosing to adopt and give a pet a forever home."}</p>
    <a href="${process.env.CLIENT_URL || "http://localhost:5173"}/dashboard" class="button">View Application Details</a>
    `,
  );

  return sendEmail({ to: user.email, subject, html });
};

/**
 * Send Email Verification OTP
 */
const sendVerificationEmail = async (email, otpCode, fullName) => {
  const subject = "Verify your email for ResQNet";

  const html = getBaseEmailHtml(
    subject,
    `
    <span class="badge" style="background-color: #dbeafe; color: #1e40af;">Account Verification</span>
    <h2 style="color: #0f172a; margin-top: 0;">Verify Your Email</h2>
    <p>Hello ${fullName || "User"},</p>
    <p>Thank you for registering with ResQNet. Please use the verification code below to complete your sign-up process.</p>
    <div style="text-align: center; margin: 24px 0;">
      <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #237737; background: #f0fdf4; padding: 12px 24px; border-radius: 12px; border: 2px dashed #86efac; display: inline-block;">
        ${otpCode}
      </span>
      <p style="font-size: 12px; color: #64748b; margin-top: 8px;">This verification code expires in 10 minutes.</p>
    </div>
    <p style="font-size: 13px; color: #64748b; margin-top: 20px;">If you did not initiate this request, please ignore this email.</p>
    `,
  );

  return sendEmail({ to: email, subject, html });
};

/**
 * Send Shelter Approval & Temporary Password Email
 */
const sendShelterApprovalEmail = async (
  email,
  {
    shelterName,
    shelterNumber,
    shelterId,
    tempPassword,
    managerName,
    loginUrl,
  },
) => {
  const subject = `🎉 Shelter Application Approved - Welcome to ResQNet!`;
  const portalUrl =
    loginUrl || `${process.env.CLIENT_URL || "http://localhost:5173"}/login`;

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
          <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${shelterNumber || shelterId || "Approved"}</td>
        </tr>
        ${
          managerName
            ? `<tr>
          <td style="padding: 6px 0; color: #64748b;"><strong>Shelter Manager:</strong></td>
          <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${managerName}</td>
        </tr>`
            : ""
        }
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
    `,
  );

  return sendEmail({ to: email, subject, html });
};

/**
 * Send Shelter Application Approved - Manager Congratulations Email (No credentials / password)
 */
const sendShelterApprovalManagerEmail = async (
  email,
  {
    managerName,
    shelterName,
    shelterNumber,
    shelterEmail,
    applicationId,
    portalUrl: customPortalUrl,
  },
) => {
  const subject = `🎉 Shelter Application Approved — ${shelterName} is Now on ResQNet!`;
  const portalUrl =
    customPortalUrl ||
    `${process.env.CLIENT_URL || "http://localhost:5173"}/dashboard`;

  const html = getBaseEmailHtml(
    subject,
    `
    <span class="badge" style="background-color: #dcfce7; color: #15803d;">Application Approved</span>
    <h2 style="color: #15803d; margin-top: 0;">Congratulations, ${managerName || "Shelter Manager"}! 🎉</h2>
    <p>We are delighted to inform you that the shelter registration application for <strong>${shelterName}</strong> has been officially <strong>approved</strong> by the ResQNet Administration team!</p>
    <p>Your shelter is now a certified member of the ResQNet Animal Rescue &amp; Shelter Network. A dedicated shelter account has been provisioned to manage rescued animals, track cage capacity, and oversee adoptions.</p>

    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0;">
      <h3 style="margin: 0 0 12px 0; color: #0f172a; font-size: 15px; border-bottom: 1px solid #cbd5e1; padding-bottom: 8px;">Shelter Registration Details</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr>
          <td style="padding: 6px 0; color: #64748b; width: 160px;"><strong>Shelter Name:</strong></td>
          <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${shelterName}</td>
        </tr>
        ${
          shelterNumber
            ? `<tr>
          <td style="padding: 6px 0; color: #64748b;"><strong>Shelter ID:</strong></td>
          <td style="padding: 6px 0; font-weight: bold; color: #237737; font-size: 15px;">${shelterNumber}</td>
        </tr>`
            : ""
        }
        ${
          applicationId
            ? `<tr>
          <td style="padding: 6px 0; color: #64748b;"><strong>Application ID:</strong></td>
          <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${applicationId}</td>
        </tr>`
            : ""
        }
        <tr>
          <td style="padding: 6px 0; color: #64748b;"><strong>Shelter Email:</strong></td>
          <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${shelterEmail}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;"><strong>Status:</strong></td>
          <td style="padding: 6px 0; font-weight: bold; color: #15803d;">✓ Approved &amp; Active</td>
        </tr>
      </table>
    </div>

    <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px 16px; border-radius: 0 8px 8px 0; margin: 16px 0; font-size: 13px; color: #166534;">
      <strong>📧 Shelter Account Access:</strong> Login credentials for the shelter account have been sent separately to the shelter's registered email address (<strong>${shelterEmail}</strong>). Please use those credentials to log in and manage the shelter dashboard.
    </div>

    <div style="text-align: center; margin: 24px 0;">
      <a href="${portalUrl}" class="button" style="background-color: #237737; display: inline-block;">Visit Your Dashboard</a>
    </div>

    <p style="font-size: 13px; color: #64748b; margin-top: 20px;">Thank you for your dedication to animal welfare. Welcome to the ResQNet family!</p>
    `,
  );

  return sendEmail({ to: email, subject, html });
};

const sendRescueTeamApprovalEmail = async (
  email,
  {
    rescueTeamName,
    teamId,
    rescueTeamNumber,
    vehicleNumber,
    vehicleType,
    district,
    tempPassword,
    loginUrl,
  },
) => {
  const subject = `🚑 Rescue Team Approved - Welcome to ResQNet Emergency Response!`;
  const portalUrl =
    loginUrl ||
    `${process.env.CLIENT_URL || "http://localhost:5173"}/dashboard`;

  const html = getBaseEmailHtml(
    subject,
    `
    <span class="badge" style="background-color: #dbeafe; color: #1e40af;">Rescue Team Certified</span>
    <h2 style="color: #1e40af; margin-top: 0;">Congratulations, ${rescueTeamName}!</h2>
    <p>Following a successful team valuation and readiness inspection by the ResQNet Administration team, your registration as an official <strong>Emergency Animal Rescue Team</strong> has been approved.</p>
    
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0;">
      <h3 style="margin: 0 0 12px 0; color: #0f172a; font-size: 15px;">Your Certified Rescue Team Details</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr>
          <td style="padding: 6px 0; color: #64748b; width: 160px;"><strong>Team ID:</strong></td>
          <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${teamId || "RT-0001"}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;"><strong>Rescue Call Number:</strong></td>
          <td style="padding: 6px 0; font-weight: bold; color: #1e40af;">${rescueTeamNumber || "RTN001"}</td>
        <tr>
          <td style="padding: 6px 0; color: #64748b;"><strong>Temporary Password:</strong></td>
          <td style="padding: 6px 0; font-family: monospace; font-size: 16px; font-weight: 800; color: #2563eb; letter-spacing: 1px;">${tempPassword || "Provided separately"}</td>
        </tr>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;"><strong>Certified Vehicle:</strong></td>
          <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${vehicleNumber} (${vehicleType})</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;"><strong>Operating District:</strong></td>
          <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${district || "Assigned Territory"}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;"><strong>Status:</strong></td>
          <td style="padding: 6px 0; font-weight: bold; color: #15803d;">Active & Available for Dispatch</td>
        </tr>
      </table>
    </div>

    <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 12px 16px; border-radius: 0 8px 8px 0; margin: 16px 0; font-size: 13px; color: #065f46;">
      <strong>🛡️ Responder Role Activated:</strong> Your account role has been upgraded to <strong>Rescue Team</strong>. You are now authorized to receive SOS animal emergency alerts in your operating district.
    </div>

    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 0 8px 8px 0; margin: 16px 0; font-size: 13px; color: #92400e;">
      <strong>Security Notice:</strong> Sign in with the temporary password and change it from your account settings.
    </div>

    <div style="text-align: center; margin: 24px 0;">
      <a href="${portalUrl}" class="button" style="background-color: #2563eb; display: inline-block;">Open Rescue Operations Dashboard</a>
    </div>

    <p style="font-size: 13px; color: #64748b; margin-top: 20px;">Thank you for serving as the frontline for animal protection. Always prioritize safety in field rescue operations.</p>
    `,
  );

  return sendEmail({ to: email, subject, html });
};

const sendRescueTeamManagerApprovalEmail = async (
  email,
  {
    applicantName,
    rescueTeamName,
    teamId,
    rescueTeamNumber,
    rescueTeamEmail,
    applicationId,
  },
) => {
  const subject = `🎉 Rescue Team Application Approved: ${rescueTeamName}`;
  const portalUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/dashboard`;
  const html = getBaseEmailHtml(
    subject,
    `
    <span class="badge" style="background-color: #dcfce7; color: #15803d;">Application Approved</span>
    <h2 style="color: #15803d; margin-top: 0;">Congratulations, ${applicantName || "Team Leader"}!</h2>
    <p>Your rescue team registration for <strong>${rescueTeamName}</strong> has been successfully approved by the ResQNet Administration team.</p>
    <p>The team is now certified and linked to you as its team leader.</p>
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0;">
      <p><strong>Application ID:</strong> ${applicationId}</p>
      <p><strong>Team ID:</strong> ${teamId}</p>
      <p><strong>Rescue Call Number:</strong> ${rescueTeamNumber}</p>
      <p><strong>Official Team Email:</strong> ${rescueTeamEmail}</p>
    </div>
    <p>The team login credentials, including its temporary password, were sent separately to the official team email address.</p>
    <div style="text-align: center; margin: 24px 0;"><a href="${portalUrl}" class="button" style="background-color: #237737; display: inline-block;">View Your Dashboard</a></div>
    `,
  );
  return sendEmail({ to: email, subject, html });
};

/**
 * Send Volunteer Certification & Approval Email
 */
const sendVolunteerApprovalEmail = async (email, details = {}) => {
  const {
    volunteerName = "Community Volunteer",
    volunteerId = "VOL-0001",
    district = "Kerala",
    interests = ["Animal Care"],
  } = details;

  const subject = `🤝 Welcome to ResQNet! Volunteer Badge Certified [${volunteerId}]`;
  const portalUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/dashboard`;

  const interestsDisplay = Array.isArray(interests)
    ? interests.join(", ")
    : interests;

  const html = getBaseEmailHtml(
    subject,
    `
    <span class="badge" style="background-color: #dcfce7; color: #166534;">Volunteer Certified</span>
    <h2 style="color: #237737; margin-top: 0; font-size: 20px;">Volunteer Orientation Verified & Approved! 🤝</h2>
    <p>Dear <strong>${volunteerName}</strong>,</p>
    <p>Congratulations! Following your volunteer orientation and verification session, your application has been officially <strong>Approved</strong>. You are now a certified community volunteer with <strong>ResQNet Animal Rescue & Shelter Network</strong>.</p>

    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin: 20px 0;">
      <h3 style="color: #0f172a; margin-top: 0; font-size: 15px; border-bottom: 1px solid #cbd5e1; padding-bottom: 8px;">Official Volunteer Credentials</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr>
          <td style="padding: 6px 0; color: #64748b; width: 160px;"><strong>Volunteer Badge ID:</strong></td>
          <td style="padding: 6px 0; font-weight: bold; color: #237737; font-size: 16px;">${volunteerId}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;"><strong>Volunteer Name:</strong></td>
          <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${volunteerName}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;"><strong>Operating District:</strong></td>
          <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${district || "Kerala"}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;"><strong>Service Focus:</strong></td>
          <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${interestsDisplay}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;"><strong>Orientation Status:</strong></td>
          <td style="padding: 6px 0; font-weight: bold; color: #15803d;">✓ Verified & Active</td>
        </tr>
      </table>
    </div>

    <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px 16px; border-radius: 0 8px 8px 0; margin: 16px 0; font-size: 13px; color: #166534;">
      <strong>🌟 Active Volunteer Status:</strong> You are now authorized to participate in shelter visits, care activities, foster coordination, and community adoption drives.
    </div>

    <div style="text-align: center; margin: 24px 0;">
      <a href="${portalUrl}" class="button" style="background-color: #237737; display: inline-block;">Open Volunteer Portal</a>
    </div>

    <p style="font-size: 13px; color: #64748b; margin-top: 20px;">Thank you for dedicating your time and passion to helping animals in need.</p>
    `,
  );

  return sendEmail({ to: email, subject, html });
};

/**
 * Send Veterinary Staff Interview Scheduled Email
 */
const sendVetInterviewScheduledEmail = async (email, details = {}) => {
  const {
    applicantName = "Doctor",
    applicationId = "VSA-0001",
    shelterName = "Shelter Clinic",
    interviewDate = new Date(),
    timeSlot = "10:00 AM - 12:00 PM",
    location = "Shelter Veterinary Wing",
    interviewer = "Senior Veterinarian / Shelter Manager",
    notes = "",
  } = details;

  const dateFormatted = new Date(interviewDate).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const subject = `🩺 ResQNet Veterinary Interview Scheduled: ${shelterName} [${applicationId}]`;
  const portalUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/dashboard`;

  const html = getBaseEmailHtml(
    subject,
    `
    <span class="badge" style="background-color: #e0f2fe; color: #0369a1;">Interview Scheduled</span>
    <h2 style="color: #0369a1; margin-top: 0; font-size: 20px;">Clinical Interview & Shelter Visit Scheduled 🩺</h2>
    <p>Dear <strong>${applicantName}</strong>,</p>
    <p>Thank you for applying to join the veterinary staff network with <strong>ResQNet</strong>. The veterinary review board at <strong>${shelterName}</strong> has reviewed your credentials and scheduled your clinic interview & competency assessment.</p>

    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin: 20px 0;">
      <h3 style="color: #0f172a; margin-top: 0; font-size: 15px; border-bottom: 1px solid #cbd5e1; padding-bottom: 8px;">Interview Appointment Details</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr>
          <td style="padding: 6px 0; color: #64748b; width: 160px;"><strong>Application ID:</strong></td>
          <td style="padding: 6px 0; font-weight: bold; color: #0284c7;">${applicationId}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;"><strong>Host Shelter:</strong></td>
          <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${shelterName}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;"><strong>Date & Time:</strong></td>
          <td style="padding: 6px 0; font-weight: bold; color: #0369a1;">${dateFormatted} • ${timeSlot}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;"><strong>Clinic Location:</strong></td>
          <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${location}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;"><strong>Interviewer:</strong></td>
          <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${interviewer}</td>
        </tr>
        ${
          notes
            ? `<tr><td style="padding: 6px 0; color: #64748b;"><strong>Preparation Notes:</strong></td><td style="padding: 6px 0; color: #334155;">${notes}</td></tr>`
            : ""
        }
      </table>
    </div>

    <div style="background-color: #f0f9ff; border-left: 4px solid #0284c7; padding: 12px 16px; border-radius: 0 8px 8px 0; margin: 16px 0; font-size: 13px; color: #0369a1;">
      <strong>📋 Items to bring:</strong> Please bring your original Veterinary Council registration certificate, degree certificates, and identification proof.
    </div>

    <div style="text-align: center; margin: 24px 0;">
      <a href="${portalUrl}" class="button" style="background-color: #0284c7; display: inline-block;">View Application Portal</a>
    </div>

    <p style="font-size: 13px; color: #64748b; margin-top: 20px;">We look forward to meeting you and collaborating to ensure exceptional veterinary medical care for rescued shelter animals.</p>
    `,
  );

  return sendEmail({ to: email, subject, html });
};

/**
 * Send Veterinary Staff Approval & Shelter Assignment Email
 */
const sendVetStaffApprovalEmail = async (email, details = {}) => {
  const {
    staffName = "Doctor",
    vetStaffId = "VS-0001",
    vetStaffNumber = "VSN001",
    position = "Veterinary Doctor",
    shelterName = "ResQNet Animal Shelter",
    councilNumber = "",
    loginEmail = email,
    hasCustomPassword = true,
    tempPassword = "",
    loginUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/login`,
  } = details;

  const subject = `🎉 Congratulations! Veterinary Staff Approved & Assigned to ${shelterName} [${vetStaffId}]`;

  const html = getBaseEmailHtml(
    subject,
    `
    <span class="badge" style="background-color: #dcfce7; color: #166534;">Officially Appointed</span>
    <h2 style="color: #237737; margin-top: 0; font-size: 20px;">Veterinary Staff Assignment Confirmed! 🩺🐾</h2>
    <p>Dear <strong>${staffName}</strong>,</p>
    <p>Congratulations! Following your clinical interview and evaluation report, your application has been officially <strong>Approved</strong>. You are now appointed as <strong>${position}</strong> at <strong>${shelterName}</strong>.</p>

    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin: 20px 0;">
      <h3 style="color: #0f172a; margin-top: 0; font-size: 15px; border-bottom: 1px solid #cbd5e1; padding-bottom: 8px;">Official Clinical Appointment Credentials</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr>
          <td style="padding: 6px 0; color: #64748b; width: 160px;"><strong>Vet Staff ID:</strong></td>
          <td style="padding: 6px 0; font-weight: bold; color: #237737; font-size: 16px;">${vetStaffId} (${vetStaffNumber})</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;"><strong>Role / Position:</strong></td>
          <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${position}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;"><strong>Assigned Shelter:</strong></td>
          <td style="padding: 6px 0; font-weight: bold; color: #237737;">${shelterName}</td>
        </tr>
        ${
          councilNumber
            ? `<tr><td style="padding: 6px 0; color: #64748b;"><strong>Council Reg No:</strong></td><td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${councilNumber}</td></tr>`
            : ""
        }
        <tr>
          <td style="padding: 6px 0; color: #64748b;"><strong>Dashboard Email:</strong></td>
          <td style="padding: 6px 0; font-weight: bold; color: #0284c7;">${loginEmail}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;"><strong>Dashboard Password:</strong></td>
          <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${
            hasCustomPassword
              ? "Your chosen registration password"
              : `<span style="font-family: monospace; background: #e2e8f0; padding: 2px 6px; border-radius: 4px;">${tempPassword}</span>`
          }</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;"><strong>Account Role:</strong></td>
          <td style="padding: 6px 0; font-weight: bold; color: #166534;">✓ Upgraded to Veterinary Staff</td>
        </tr>
      </table>
    </div>

    <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px 16px; border-radius: 0 8px 8px 0; margin: 16px 0; font-size: 13px; color: #166534;">
      <strong>🌟 Clinical Dashboard Access:</strong> When you log into ResQNet with your dashboard credentials, you have full access to the <strong>Veterinary Dashboard</strong>. You can view shelter animals, enter visit reports, log surgeries, track vaccinations, and dispatch reminders directly to the shelter.
    </div>

    <div style="text-align: center; margin: 24px 0;">
      <a href="${loginUrl}" class="button" style="background-color: #237737; display: inline-block;">Log In to Veterinary Dashboard</a>
    </div>

    <p style="font-size: 13px; color: #64748b; margin-top: 20px;">Thank you for serving on the healthcare frontline of animal welfare.</p>
    `,
  );

  return sendEmail({ to: email, subject, html });
};

/**
 * Send Animal Medical / Vaccination Reminder Email to Shelter
 */
const sendShelterAnimalMedicalReminderEmail = async (
  shelterEmail,
  details = {},
) => {
  const {
    shelterName = "Shelter",
    animalName = "Animal",
    animalId = "ANM-0001",
    species = "Dog",
    reminderType = "Vaccination Due",
    dueDate = new Date(),
    notes = "",
    vetName = "Shelter Veterinarian",
  } = details;

  const dateFormatted = new Date(dueDate).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const subject = `⚠️ Medical Alert for ${animalName} (${species}): ${reminderType} Scheduled`;
  const portalUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/dashboard`;

  const html = getBaseEmailHtml(
    subject,
    `
    <span class="badge" style="background-color: #ffedd5; color: #c2410c;">Priority Healthcare Reminder</span>
    <h2 style="color: #c2410c; margin-top: 0; font-size: 20px;">Medical Alert for ${animalName} 🐾</h2>
    <p>Dear <strong>${shelterName} Care Team</strong>,</p>
    <p>Your attending veterinary staff member <strong>${vetName}</strong> has issued an important healthcare reminder for shelter resident <strong>${animalName}</strong> [${animalId}].</p>

    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin: 20px 0;">
      <h3 style="color: #0f172a; margin-top: 0; font-size: 15px; border-bottom: 1px solid #cbd5e1; padding-bottom: 8px;">Scheduled Medical Event</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr>
          <td style="padding: 6px 0; color: #64748b; width: 150px;"><strong>Animal:</strong></td>
          <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${animalName} (${species}) - ${animalId}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;"><strong>Alert Type:</strong></td>
          <td style="padding: 6px 0; font-weight: bold; color: #ea580c;">${reminderType}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;"><strong>Scheduled Due Date:</strong></td>
          <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${dateFormatted}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;"><strong>Issued By:</strong></td>
          <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${vetName}</td>
        </tr>
        ${
          notes
            ? `<tr><td style="padding: 6px 0; color: #64748b;"><strong>Clinical Notes:</strong></td><td style="padding: 6px 0; color: #334155;">${notes}</td></tr>`
            : ""
        }
      </table>
    </div>

    <div style="background-color: #fff7ed; border-left: 4px solid #ea580c; padding: 12px 16px; border-radius: 0 8px 8px 0; margin: 16px 0; font-size: 13px; color: #9a3412;">
      <strong>⚠️ Action Requested:</strong> Please prepare the patient, isolate if needed for pre-op fasting or vaccination safety, and ensure animal handling staff are available on the scheduled date.
    </div>

    <div style="text-align: center; margin: 24px 0;">
      <a href="${portalUrl}" class="button" style="background-color: #ea580c; display: inline-block;">View in Shelter Dashboard</a>
    </div>
    `,
  );

  return sendEmail({ to: shelterEmail, subject, html });
};

/**
 * Send Credentials Email to User Created by Administrator
 */
const sendAdminCreatedUserEmail = async (email, details = {}) => {
  const {
    fullName = "User",
    role = "Public User",
    temporaryPassword = "",
    roleDetails = {},
  } = details;

  const subject = `Welcome to ResQNet - Your Admin Provisioned Account [${role}]`;
  const portalUrl = process.env.CLIENT_URL
    ? `${process.env.CLIENT_URL}/login`
    : "http://localhost:5173/login";

  const html = getBaseEmailHtml(
    subject,
    `
    <span class="badge" style="background-color: #dbeafe; color: #1e40af;">Account Created by Administrator</span>
    <h2 style="color: #0f172a; margin-top: 0;">Welcome, ${fullName}!</h2>
    <p>An official <strong>${role}</strong> account has been provisioned for you on the <strong>ResQNet</strong> Emergency Animal Rescue Network platform by an Administrator.</p>
    
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #1e293b; font-size: 15px; border-bottom: 1px solid #cbd5e1; padding-bottom: 8px;">🔐 Your Login Credentials</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr>
          <td style="padding: 6px 0; color: #64748b; width: 150px;">Login Email:</td>
          <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${email}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Assigned Role:</td>
          <td style="padding: 6px 0; font-weight: bold; color: #237737;">${role}</td>
        </tr>
        ${
          temporaryPassword
            ? `<tr>
                <td style="padding: 6px 0; color: #64748b;">Temporary Password:</td>
                <td style="padding: 6px 0;">
                  <code style="background: #e2e8f0; color: #0f172a; padding: 4px 10px; border-radius: 6px; font-size: 15px; font-weight: bold; letter-spacing: 0.5px;">${temporaryPassword}</code>
                </td>
              </tr>`
            : ""
        }
      </table>
    </div>

    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 0 8px 8px 0; margin: 16px 0; font-size: 13px; color: #92400e;">
      <strong>⚠️ Security Notice:</strong> This temporary password was issued by your administrator. For your security, please log in and change your password in your Profile settings immediately.
    </div>

    <div style="text-align: center; margin: 28px 0 16px 0;">
      <a href="${portalUrl}" class="button" style="background-color: #237737; display: inline-block;">Log In to ResQNet</a>
    </div>
    `,
  );

  return sendEmail({ to: email, subject, html });
};

/**
 * Send Account Approved / Activated Email by Administrator
 */
const sendAccountApprovedEmail = async (user) => {
  const subject = "Your ResQNet Account has been Approved & Activated! 🎉";
  const portalUrl = process.env.CLIENT_URL
    ? `${process.env.CLIENT_URL}/login`
    : "http://localhost:5173/login";

  const html = getBaseEmailHtml(
    subject,
    `
    <span class="badge" style="background-color: #dcfce7; color: #166534;">Account Approved</span>
    <h2 style="color: #237737; margin-top: 0;">Welcome, ${user.fullName || "User"}!</h2>
    <p>Good news! Your <strong>ResQNet</strong> account has been reviewed and officially <strong>Approved & Activated</strong> by an Administrator.</p>
    
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #1e293b; font-size: 15px; border-bottom: 1px solid #cbd5e1; padding-bottom: 8px;">Account Overview</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr>
          <td style="padding: 6px 0; color: #64748b; width: 140px;">Registered Email:</td>
          <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${user.email}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Assigned Role:</td>
          <td style="padding: 6px 0; font-weight: bold; color: #237737;">${user.role || "Member"}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Account Status:</td>
          <td style="padding: 6px 0; font-weight: bold; color: #15803d;">✓ Active</td>
        </tr>
      </table>
    </div>

    <p>You now have full access to all features associated with your role. You can log into your portal at any time.</p>

    <div style="text-align: center; margin: 24px 0;">
      <a href="${portalUrl}" class="button" style="background-color: #237737; display: inline-block;">Access ResQNet Portal</a>
    </div>

    <p style="font-size: 13px; color: #64748b; margin-top: 20px;">Thank you for being part of our mission to protect and care for animals.</p>
    `,
  );

  return sendEmail({ to: user.email, subject, html });
};

/**
 * Send Adoption Application Submitted Confirmation Email
 */
const sendAdoptionApplicationSubmittedEmail = async (email, details = {}) => {
  const {
    applicantName = "Applicant",
    petName = "Pet",
    species = "Animal",
    breed = "Mixed Breed",
    shelterName = "ResQNet Shelter",
    adoptionId = "ADP-0001",
    submittedAt = new Date(),
  } = details;

  const subject = `🐾 Adoption Application Received for ${petName} [${adoptionId}]`;
  const portalUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/dashboard`;

  const dateFormatted = new Date(submittedAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const html = getBaseEmailHtml(
    subject,
    `
    <span class="badge" style="background-color: #dbeafe; color: #1e40af;">Application Received</span>
    <h2 style="color: #0f172a; margin-top: 0;">Thank You, ${applicantName}!</h2>
    <p>We have successfully received your adoption application for <strong>${petName}</strong>. Thank you for choosing to adopt and provide a loving home.</p>

    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #1e293b; font-size: 15px; border-bottom: 1px solid #cbd5e1; padding-bottom: 8px;">Adoption Application Summary</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr>
          <td style="padding: 6px 0; color: #64748b; width: 150px;">Application ID:</td>
          <td style="padding: 6px 0; font-weight: bold; color: #237737;">${adoptionId}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Pet Name:</td>
          <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${petName} (${species}${breed ? ` • ${breed}` : ""})</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Care Shelter:</td>
          <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${shelterName}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Submission Date:</td>
          <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${dateFormatted}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Status:</td>
          <td style="padding: 6px 0; font-weight: bold; color: #d97706;">Pending Review</td>
        </tr>
      </table>
    </div>

    <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px 16px; border-radius: 0 8px 8px 0; margin: 16px 0; font-size: 13px; color: #166534;">
      <strong>📌 What happens next?</strong> The shelter team will review your application details. Once preliminary checks are complete, they will schedule an in-person shelter visit appointment for you to meet ${petName}.
    </div>

    <div style="text-align: center; margin: 24px 0;">
      <a href="${portalUrl}" class="button" style="background-color: #237737; display: inline-block;">Track Your Application</a>
    </div>

    <p style="font-size: 13px; color: #64748b; margin-top: 20px;">You can track the progress of your application anytime by logging into your ResQNet User Dashboard.</p>
    `,
  );

  return sendEmail({ to: email, subject, html });
};

/**
 * Send Adoption Shelter Visit Appointment Scheduled Email
 */
const sendAdoptionVisitScheduledEmail = async (email, details = {}) => {
  const {
    applicantName = "Applicant",
    petName = "Pet",
    appointmentDate = new Date(),
    appointmentTime = "10:00 AM",
    location = "Shelter Premises",
    notes = "",
    adoptionId = "ADP-0001",
  } = details;

  const subject = `📅 Shelter Visit Scheduled for Adopting ${petName} [${adoptionId}]`;
  const portalUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/dashboard`;

  const dateFormatted = new Date(appointmentDate).toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const html = getBaseEmailHtml(
    subject,
    `
    <span class="badge" style="background-color: #e0f2fe; color: #0369a1;">Site Visit Scheduled</span>
    <h2 style="color: #0369a1; margin-top: 0;">Shelter Visit Confirmed! 🐾</h2>
    <p>Dear <strong>${applicantName}</strong>,</p>
    <p>Great news! The shelter care team has scheduled an in-person visit for your adoption application regarding <strong>${petName}</strong>.</p>

    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #1e293b; font-size: 15px; border-bottom: 1px solid #cbd5e1; padding-bottom: 8px;">Appointment Details</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr>
          <td style="padding: 6px 0; color: #64748b; width: 150px;">Pet to Meet:</td>
          <td style="padding: 6px 0; font-weight: bold; color: #237737; font-size: 15px;">${petName}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Date:</td>
          <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${dateFormatted}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Time Slot:</td>
          <td style="padding: 6px 0; font-weight: bold; color: #0369a1;">${appointmentTime}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Location:</td>
          <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${location}</td>
        </tr>
        ${
          notes
            ? `<tr><td style="padding: 6px 0; color: #64748b;">Special Notes:</td><td style="padding: 6px 0; color: #334155;">${notes}</td></tr>`
            : ""
        }
      </table>
    </div>

    <div style="background-color: #f0f9ff; border-left: 4px solid #0284c7; padding: 12px 16px; border-radius: 0 8px 8px 0; margin: 16px 0; font-size: 13px; color: #0369a1;">
      <strong>💡 Tips for Your Visit:</strong>
      <ul style="margin: 6px 0 0 0; padding-left: 20px;">
        <li>Please arrive 10 minutes prior to your scheduled time slot.</li>
        <li>Bring a valid government-issued photo ID.</li>
        <li>Spend quality time interacting with ${petName} to ensure great mutual bonding.</li>
      </ul>
    </div>

    <div style="text-align: center; margin: 24px 0;">
      <a href="${portalUrl}" class="button" style="background-color: #0284c7; display: inline-block;">View Appointment in Dashboard</a>
    </div>

    <p style="font-size: 13px; color: #64748b; margin-top: 20px;">If you need to reschedule, please contact the shelter promptly through your dashboard.</p>
    `,
  );

  return sendEmail({ to: email, subject, html });
};

/**
 * Send Shelter Application Submitted Confirmation Email
 */
const sendShelterApplicationSubmittedEmail = async (email, details = {}) => {
  const {
    applicantName = "Applicant",
    shelterName = "Shelter",
    registrationNumber = "",
    applicationId = "SHA-0001",
    shelterPhoneNumber = "",
    totalCages = 0,
  } = details;

  const subject = `🏢 Shelter Registration Application Received: ${shelterName} [${applicationId}]`;
  const portalUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/dashboard`;

  const html = getBaseEmailHtml(
    subject,
    `
    <span class="badge" style="background-color: #dbeafe; color: #1e40af;">Registration Received</span>
    <h2 style="color: #0f172a; margin-top: 0;">Shelter Application Submitted! 🏢</h2>
    <p>Dear <strong>${applicantName}</strong>,</p>
    <p>Thank you for submitting a shelter registration application for <strong>${shelterName}</strong> on the ResQNet Animal Rescue Platform.</p>

    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #1e293b; font-size: 15px; border-bottom: 1px solid #cbd5e1; padding-bottom: 8px;">Application Information</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr>
          <td style="padding: 6px 0; color: #64748b; width: 160px;">Application ID:</td>
          <td style="padding: 6px 0; font-weight: bold; color: #237737;">${applicationId}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Shelter Name:</td>
          <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${shelterName}</td>
        </tr>
        ${
          registrationNumber
            ? `<tr><td style="padding: 6px 0; color: #64748b;">Registration No:</td><td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${registrationNumber}</td></tr>`
            : ""
        }
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Contact Phone:</td>
          <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${shelterPhoneNumber || "Provided"}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Cages / Capacity:</td>
          <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${totalCages} Cages</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Application Status:</td>
          <td style="padding: 6px 0; font-weight: bold; color: #d97706;">Pending Admin Review</td>
        </tr>
      </table>
    </div>

    <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px 16px; border-radius: 0 8px 8px 0; margin: 16px 0; font-size: 13px; color: #166534;">
      <strong>🔍 Next Step — Physical Site Visit:</strong> The ResQNet Administration Team will review your documentation and coordinate a physical site visit to inspect facilities, hygiene, and cage capacity before final certification.
    </div>

    <div style="text-align: center; margin: 24px 0;">
      <a href="${portalUrl}" class="button" style="background-color: #237737; display: inline-block;">View Application Status</a>
    </div>

    <p style="font-size: 13px; color: #64748b; margin-top: 20px;">You will receive an email and in-app alert as soon as the site inspection date is finalized.</p>
    `,
  );

  return sendEmail({ to: email, subject, html });
};

/**
 * Send Shelter Physical Site Visit Scheduled Email
 */
const sendShelterSiteVisitScheduledEmail = async (email, details = {}) => {
  const {
    shelterName = "Shelter",
    applicationId = "SHA-0001",
    visitDate = new Date(),
    valuationPeriod = "Morning Slot",
    inspector = "ResQNet Field Officer",
    notes = "",
  } = details;

  const subject = `📅 Shelter Site Visit & Valuation Scheduled: ${shelterName} [${applicationId}]`;
  const portalUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/dashboard`;

  const dateFormatted = new Date(visitDate).toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const html = getBaseEmailHtml(
    subject,
    `
    <span class="badge" style="background-color: #e0f2fe; color: #0369a1;">Physical Site Inspection</span>
    <h2 style="color: #0369a1; margin-top: 0;">Site Visit & Valuation Scheduled 📅</h2>
    <p>Dear <strong>${shelterName} Management</strong>,</p>
    <p>An official physical site inspection and valuation for your shelter registration application has been scheduled by the ResQNet Administration team.</p>

    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #1e293b; font-size: 15px; border-bottom: 1px solid #cbd5e1; padding-bottom: 8px;">Inspection Details</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr>
          <td style="padding: 6px 0; color: #64748b; width: 160px;">Application ID:</td>
          <td style="padding: 6px 0; font-weight: bold; color: #0369a1;">${applicationId}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Scheduled Date:</td>
          <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${dateFormatted}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Valuation Time Slot:</td>
          <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${valuationPeriod}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Assigned Inspector:</td>
          <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${inspector}</td>
        </tr>
        ${
          notes
            ? `<tr><td style="padding: 6px 0; color: #64748b;">Inspection Notes:</td><td style="padding: 6px 0; color: #334155;">${notes}</td></tr>`
            : ""
        }
      </table>
    </div>

    <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px 16px; border-radius: 0 8px 8px 0; margin: 16px 0; font-size: 13px; color: #1e40af;">
      <strong>📋 Preparation Checklist:</strong>
      <ul style="margin: 6px 0 0 0; padding-left: 20px;">
        <li>Keep society/trust registration certificates and legal permits ready for review.</li>
        <li>Ensure safe access to all animal housing cages, quarantine sections, and food prep areas.</li>
        <li>Have shelter operating personnel available on site during the inspection.</li>
      </ul>
    </div>

    <div style="text-align: center; margin: 24px 0;">
      <a href="${portalUrl}" class="button" style="background-color: #0369a1; display: inline-block;">View Application in Dashboard</a>
    </div>

    <p style="font-size: 13px; color: #64748b; margin-top: 20px;">Following the site visit, the inspection auditor will file their verification report for final account certification.</p>
    `,
  );

  return sendEmail({ to: email, subject, html });
};

/**
 * Send Shelter Application Rejection Email
 */
const sendShelterApplicationRejectedEmail = async (email, details = {}) => {
  const {
    shelterName = "Shelter",
    applicationId = "SHA-0001",
    reason = "Requirements not met at this time.",
  } = details;

  const subject = `Update Regarding Shelter Registration Application: ${shelterName} [${applicationId}]`;
  const portalUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/dashboard`;

  const html = getBaseEmailHtml(
    subject,
    `
    <span class="badge" style="background-color: #fee2e2; color: #991b1b;">Application Update</span>
    <h2 style="color: #991b1b; margin-top: 0;">Shelter Application Decision</h2>
    <p>Dear <strong>${shelterName} Management</strong>,</p>
    <p>Thank you for your interest in joining the ResQNet Animal Shelter Network. Following a comprehensive review of your application (#${applicationId}), we regret to inform you that your application could not be approved at this time.</p>

    <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 18px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #991b1b; font-size: 15px;">Review Remarks & Findings</h3>
      <p style="color: #450a0a; margin: 6px 0; font-size: 14px;">${reason}</p>
    </div>

    <p>You may address the points mentioned above and submit an updated application once corrective measures have been implemented.</p>

    <div style="text-align: center; margin: 24px 0;">
      <a href="${portalUrl}" class="button" style="background-color: #64748b; display: inline-block;">Review in Portal</a>
    </div>

    <p style="font-size: 13px; color: #64748b; margin-top: 20px;">If you have any questions regarding this decision, please feel free to reach out to our administrative team.</p>
    `,
  );

  return sendEmail({ to: email, subject, html });
};

/**
 * Send Rescue Team Application Submitted Confirmation Email
 */
const sendRescueTeamApplicationSubmittedEmail = async (email, details = {}) => {
  const {
    teamLeadName = "Responder",
    rescueTeamName = "Rescue Team",
    vehicleNumber = "",
    vehicleType = "Ambulance",
    operatingDistrict = "Kerala",
    applicationId = "RTA-0001",
  } = details;

  const subject = `🚑 Emergency Rescue Team Application Received: ${rescueTeamName} [${applicationId}]`;
  const portalUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/dashboard`;

  const html = getBaseEmailHtml(
    subject,
    `
    <span class="badge" style="background-color: #dbeafe; color: #1e40af;">Registration Received</span>
    <h2 style="color: #0f172a; margin-top: 0;">Rescue Team Application Received! 🚑</h2>
    <p>Dear <strong>${teamLeadName}</strong>,</p>
    <p>Thank you for submitting a registration application for <strong>${rescueTeamName}</strong> to join the ResQNet Emergency Response Network.</p>

    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #1e293b; font-size: 15px; border-bottom: 1px solid #cbd5e1; padding-bottom: 8px;">Submitted Team Details</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr>
          <td style="padding: 6px 0; color: #64748b; width: 160px;">Application ID:</td>
          <td style="padding: 6px 0; font-weight: bold; color: #2563eb;">${applicationId}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Team Name:</td>
          <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${rescueTeamName}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Operating District:</td>
          <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${operatingDistrict}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Vehicle:</td>
          <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${vehicleNumber} (${vehicleType})</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Status:</td>
          <td style="padding: 6px 0; font-weight: bold; color: #d97706;">Pending Valuation</td>
        </tr>
      </table>
    </div>

    <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px 16px; border-radius: 0 8px 8px 0; margin: 16px 0; font-size: 13px; color: #166534;">
      <strong>🔍 Next Step — Vehicle & Equipment Audit:</strong> An administration field auditor will schedule an in-person vehicle inspection and rescue gear check to verify field readiness.
    </div>

    <div style="text-align: center; margin: 24px 0;">
      <a href="${portalUrl}" class="button" style="background-color: #2563eb; display: inline-block;">Track Team Application</a>
    </div>

    <p style="font-size: 13px; color: #64748b; margin-top: 20px;">You will receive an update via email and dashboard notification when your inspection slot is scheduled.</p>
    `,
  );

  return sendEmail({ to: email, subject, html });
};

/**
 * Send Rescue Team Field Inspection / Site Visit Scheduled Email
 */
const sendRescueTeamVisitScheduledEmail = async (email, details = {}) => {
  const {
    rescueTeamName = "Rescue Team",
    applicationId = "RTA-0001",
    visitDate = new Date(),
    valuationPeriod = "Standard Slot",
    inspector = "Field Officer",
    vehicleNumber = "",
    notes = "",
  } = details;

  const subject = `📅 Rescue Team Field Inspection & Vehicle Valuation Scheduled: ${rescueTeamName} [${applicationId}]`;
  const portalUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/dashboard`;

  const dateFormatted = new Date(visitDate).toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const html = getBaseEmailHtml(
    subject,
    `
    <span class="badge" style="background-color: #e0f2fe; color: #0369a1;">Field Inspection Scheduled</span>
    <h2 style="color: #0369a1; margin-top: 0;">Vehicle & Equipment Audit Scheduled 📅</h2>
    <p>Dear <strong>${rescueTeamName} Responders</strong>,</p>
    <p>An official field inspection and equipment audit has been scheduled for your Rescue Team registration application.</p>

    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #1e293b; font-size: 15px; border-bottom: 1px solid #cbd5e1; padding-bottom: 8px;">Inspection Schedule</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr>
          <td style="padding: 6px 0; color: #64748b; width: 160px;">Application ID:</td>
          <td style="padding: 6px 0; font-weight: bold; color: #0369a1;">${applicationId}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Scheduled Date:</td>
          <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${dateFormatted}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Time Slot:</td>
          <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${valuationPeriod}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Assigned Auditor:</td>
          <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${inspector}</td>
        </tr>
        ${
          vehicleNumber
            ? `<tr><td style="padding: 6px 0; color: #64748b;">Vehicle to Inspect:</td><td style="padding: 6px 0; font-weight: bold; color: #2563eb;">${vehicleNumber}</td></tr>`
            : ""
        }
        ${
          notes
            ? `<tr><td style="padding: 6px 0; color: #64748b;">Audit Notes:</td><td style="padding: 6px 0; color: #334155;">${notes}</td></tr>`
            : ""
        }
      </table>
    </div>

    <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px 16px; border-radius: 0 8px 8px 0; margin: 16px 0; font-size: 13px; color: #1e40af;">
      <strong>🚨 Audit Checklist:</strong>
      <ul style="margin: 6px 0 0 0; padding-left: 20px;">
        <li>Ensure the certified rescue vehicle is present and in roadworthy condition.</li>
        <li>Keep animal rescue gear (carriers, catching nets, safety gloves, first-aid kit) readily available.</li>
        <li>Provide driver's license and vehicle registration documents for verification.</li>
      </ul>
    </div>

    <div style="text-align: center; margin: 24px 0;">
      <a href="${portalUrl}" class="button" style="background-color: #2563eb; display: inline-block;">View in Dashboard</a>
    </div>
    `,
  );

  return sendEmail({ to: email, subject, html });
};

/**
 * Send Rescue Team Rejection Email
 */
const sendRescueTeamRejectedEmail = async (email, details = {}) => {
  const {
    rescueTeamName = "Rescue Team",
    applicationId = "RTA-0001",
    reason = "Requirements not met following field inspection.",
  } = details;

  const subject = `Update Regarding Rescue Team Application: ${rescueTeamName} [${applicationId}]`;
  const portalUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/dashboard`;

  const html = getBaseEmailHtml(
    subject,
    `
    <span class="badge" style="background-color: #fee2e2; color: #991b1b;">Application Decision</span>
    <h2 style="color: #991b1b; margin-top: 0;">Rescue Team Application Update</h2>
    <p>Dear <strong>${rescueTeamName} Responders</strong>,</p>
    <p>Thank you for applying to become a certified Emergency Animal Rescue Team with ResQNet. Following your field inspection (#${applicationId}), your application was not approved at this time.</p>

    <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 18px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #991b1b; font-size: 15px;">Inspector Findings & Feedback</h3>
      <p style="color: #450a0a; margin: 6px 0; font-size: 14px;">${reason}</p>
    </div>

    <p>You may review the recommendations in your dashboard and reapply once corrective actions are completed.</p>

    <div style="text-align: center; margin: 24px 0;">
      <a href="${portalUrl}" class="button" style="background-color: #64748b; display: inline-block;">View Application Details</a>
    </div>
    `,
  );

  return sendEmail({ to: email, subject, html });
};

/**
 * Send Volunteer Application Submitted Confirmation Email
 */
const sendVolunteerApplicationSubmittedEmail = async (email, details = {}) => {
  const {
    applicantName = "Volunteer",
    district = "Kerala",
    interests = ["Animal Care"],
    applicationId = "VOL-0001",
  } = details;

  const subject = `🤝 Volunteer Application Received [${applicationId}] - Welcome to ResQNet!`;
  const portalUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/dashboard`;

  const interestsDisplay = Array.isArray(interests)
    ? interests.join(", ")
    : interests;

  const html = getBaseEmailHtml(
    subject,
    `
    <span class="badge" style="background-color: #dbeafe; color: #1e40af;">Volunteer Application Received</span>
    <h2 style="color: #0f172a; margin-top: 0;">Thank You for Stepping Up, ${applicantName}! 🤝</h2>
    <p>We are delighted to receive your volunteer application with <strong>ResQNet</strong>. Passionate community members like you make all the difference in rescuing animals and supporting shelter operations.</p>

    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #1e293b; font-size: 15px; border-bottom: 1px solid #cbd5e1; padding-bottom: 8px;">Volunteer Details</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr>
          <td style="padding: 6px 0; color: #64748b; width: 150px;">Application ID:</td>
          <td style="padding: 6px 0; font-weight: bold; color: #237737;">${applicationId}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Volunteer Name:</td>
          <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${applicantName}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Operating District:</td>
          <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${district}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Interests:</td>
          <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${interestsDisplay}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Current Status:</td>
          <td style="padding: 6px 0; font-weight: bold; color: #d97706;">Pending Orientation Scheduling</td>
        </tr>
      </table>
    </div>

    <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px 16px; border-radius: 0 8px 8px 0; margin: 16px 0; font-size: 13px; color: #166534;">
      <strong>🌟 What's next?</strong> A volunteer coordinator will review your profile and reach out to schedule an in-person orientation and verification session.
    </div>

    <div style="text-align: center; margin: 24px 0;">
      <a href="${portalUrl}" class="button" style="background-color: #237737; display: inline-block;">Open Volunteer Dashboard</a>
    </div>
    `,
  );

  return sendEmail({ to: email, subject, html });
};

/**
 * Send Volunteer Orientation Visit Scheduled Email
 */
const sendVolunteerVisitScheduledEmail = async (email, details = {}) => {
  const {
    applicantName = "Volunteer",
    applicationId = "VOL-0001",
    visitDate = new Date(),
    valuationPeriod = "Standard Session",
    coordinator = "Field Coordinator",
    notes = "",
  } = details;

  const subject = `📅 Volunteer Orientation & Verification Visit Scheduled [${applicationId}]`;
  const portalUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/dashboard`;

  const dateFormatted = new Date(visitDate).toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const html = getBaseEmailHtml(
    subject,
    `
    <span class="badge" style="background-color: #e0f2fe; color: #0369a1;">Orientation Scheduled</span>
    <h2 style="color: #0369a1; margin-top: 0;">Volunteer Orientation Scheduled 📅</h2>
    <p>Dear <strong>${applicantName}</strong>,</p>
    <p>Your in-person volunteer orientation and verification visit has been scheduled. We look forward to meeting you!</p>

    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #1e293b; font-size: 15px; border-bottom: 1px solid #cbd5e1; padding-bottom: 8px;">Orientation Details</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr>
          <td style="padding: 6px 0; color: #64748b; width: 160px;">Application ID:</td>
          <td style="padding: 6px 0; font-weight: bold; color: #0369a1;">${applicationId}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Date:</td>
          <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${dateFormatted}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Session Period:</td>
          <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${valuationPeriod}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Coordinator:</td>
          <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${coordinator}</td>
        </tr>
        ${
          notes
            ? `<tr><td style="padding: 6px 0; color: #64748b;">Orientation Notes:</td><td style="padding: 6px 0; color: #334155;">${notes}</td></tr>`
            : ""
        }
      </table>
    </div>

    <div style="background-color: #f0f9ff; border-left: 4px solid #0284c7; padding: 12px 16px; border-radius: 0 8px 8px 0; margin: 16px 0; font-size: 13px; color: #0369a1;">
      <strong>📋 What to bring:</strong> Please carry a government-issued photo ID for identity verification. Wear comfortable clothes suitable for shelter premises.
    </div>

    <div style="text-align: center; margin: 24px 0;">
      <a href="${portalUrl}" class="button" style="background-color: #0284c7; display: inline-block;">View in Dashboard</a>
    </div>
    `,
  );

  return sendEmail({ to: email, subject, html });
};

/**
 * Send Volunteer Application Rejection Email
 */
const sendVolunteerRejectedEmail = async (email, details = {}) => {
  const {
    applicantName = "Volunteer",
    applicationId = "VOL-0001",
    reason = "Application criteria not fulfilled at this time.",
  } = details;

  const subject = `Update Regarding Volunteer Application [${applicationId}]`;
  const portalUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/dashboard`;

  const html = getBaseEmailHtml(
    subject,
    `
    <span class="badge" style="background-color: #fee2e2; color: #991b1b;">Application Decision</span>
    <h2 style="color: #991b1b; margin-top: 0;">Volunteer Application Update</h2>
    <p>Dear <strong>${applicantName}</strong>,</p>
    <p>Thank you for taking the time to attend our orientation and apply for the ResQNet Volunteer network (#${applicationId}). Following the evaluation, your application was not approved at this stage.</p>

    <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 18px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #991b1b; font-size: 15px;">Evaluation Remarks</h3>
      <p style="color: #450a0a; margin: 6px 0; font-size: 14px;">${reason}</p>
    </div>

    <p>We truly appreciate your heart for animal welfare and encourage you to reapply in the future.</p>

    <div style="text-align: center; margin: 24px 0;">
      <a href="${portalUrl}" class="button" style="background-color: #64748b; display: inline-block;">Return to Dashboard</a>
    </div>
    `,
  );

  return sendEmail({ to: email, subject, html });
};

/**
 * Send Veterinary Staff Application Submitted Confirmation Email
 */
const sendVetStaffApplicationSubmittedEmail = async (email, details = {}) => {
  const {
    applicantName = "Doctor",
    position = "Veterinary Doctor",
    councilNumber = "",
    targetShelterName = "All Shelters",
    applicationId = "VSA-0001",
  } = details;

  const subject = `🩺 Veterinary Staff Application Received [${applicationId}]`;
  const portalUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/dashboard`;

  const html = getBaseEmailHtml(
    subject,
    `
    <span class="badge" style="background-color: #dbeafe; color: #1e40af;">Application Received</span>
    <h2 style="color: #0f172a; margin-top: 0;">Veterinary Application Received! 🩺</h2>
    <p>Dear <strong>${applicantName}</strong>,</p>
    <p>Thank you for submitting your application to join the clinical network of <strong>ResQNet</strong> as a <strong>${position}</strong>.</p>

    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #1e293b; font-size: 15px; border-bottom: 1px solid #cbd5e1; padding-bottom: 8px;">Application Summary</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr>
          <td style="padding: 6px 0; color: #64748b; width: 160px;">Application ID:</td>
          <td style="padding: 6px 0; font-weight: bold; color: #0284c7;">${applicationId}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Applying Role:</td>
          <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${position}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Council Reg Number:</td>
          <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${councilNumber || "Provided"}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Target Shelter:</td>
          <td style="padding: 6px 0; font-weight: bold; color: #237737;">${targetShelterName}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Status:</td>
          <td style="padding: 6px 0; font-weight: bold; color: #d97706;">Pending Clinical Review</td>
        </tr>
      </table>
    </div>

    <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px 16px; border-radius: 0 8px 8px 0; margin: 16px 0; font-size: 13px; color: #166534;">
      <strong>🩺 Next Steps:</strong> The shelter veterinary board will verify your credentials with the Veterinary Council and schedule a clinical interview & site competency assessment.
    </div>

    <div style="text-align: center; margin: 24px 0;">
      <a href="${portalUrl}" class="button" style="background-color: #0284c7; display: inline-block;">View Application Portal</a>
    </div>
    `,
  );

  return sendEmail({ to: email, subject, html });
};

/**
 * Send Veterinary Staff Application Rejection Email
 */
const sendVetStaffRejectedEmail = async (email, details = {}) => {
  const {
    applicantName = "Doctor",
    shelterName = "Shelter",
    applicationId = "VSA-0001",
    reason = "Did not fulfill clinical competency criteria at this time.",
  } = details;

  const subject = `Update Regarding Veterinary Application: ${shelterName} [${applicationId}]`;
  const portalUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/dashboard`;

  const html = getBaseEmailHtml(
    subject,
    `
    <span class="badge" style="background-color: #fee2e2; color: #991b1b;">Application Decision</span>
    <h2 style="color: #991b1b; margin-top: 0;">Veterinary Application Decision</h2>
    <p>Dear <strong>${applicantName}</strong>,</p>
    <p>Thank you for interviewing with <strong>${shelterName}</strong> for the Veterinary Staff position (#${applicationId}). Following the clinical assessment, your application was not approved at this time.</p>

    <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 18px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #991b1b; font-size: 15px;">Interview Feedback</h3>
      <p style="color: #450a0a; margin: 6px 0; font-size: 14px;">${reason}</p>
    </div>

    <div style="text-align: center; margin: 24px 0;">
      <a href="${portalUrl}" class="button" style="background-color: #64748b; display: inline-block;">View in Dashboard</a>
    </div>
    `,
  );

  return sendEmail({ to: email, subject, html });
};

module.exports = {
  transporter,
  verifyTransporter,
  sendEmail,
  sendWelcomeEmail,
  sendAccountApprovedEmail,
  sendPasswordResetEmail,
  sendEmergencyAlertEmail,
  sendAdoptionStatusEmail,
  sendVerificationEmail,
  sendShelterApprovalEmail,
  sendShelterApprovalManagerEmail,
  sendRescueTeamApprovalEmail,
  sendRescueTeamManagerApprovalEmail,
  sendVolunteerApprovalEmail,
  sendVetInterviewScheduledEmail,
  sendVetStaffApprovalEmail,
  sendShelterAnimalMedicalReminderEmail,
  sendAdminCreatedUserEmail,
  // Application submissions
  sendAdoptionApplicationSubmittedEmail,
  sendShelterApplicationSubmittedEmail,
  sendRescueTeamApplicationSubmittedEmail,
  sendVolunteerApplicationSubmittedEmail,
  sendVetStaffApplicationSubmittedEmail,
  // Site visits / Appointments
  sendAdoptionVisitScheduledEmail,
  sendShelterSiteVisitScheduledEmail,
  sendRescueTeamVisitScheduledEmail,
  sendVolunteerVisitScheduledEmail,
  // Rejections
  sendShelterApplicationRejectedEmail,
  sendRescueTeamRejectedEmail,
  sendVolunteerRejectedEmail,
  sendVetStaffRejectedEmail,
};
