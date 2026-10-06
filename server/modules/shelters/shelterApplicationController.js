const ShelterApplication = require("./shelterApplicationModel");
const Shelter = require("./shelterModel");
const User = require("../users/userModel");
const {
  sendShelterApprovalEmail,
  sendShelterApprovalManagerEmail,
  sendShelterApplicationSubmittedEmail,
  sendShelterSiteVisitScheduledEmail,
  sendShelterApplicationRejectedEmail,
} = require("../../utils/emailService");
const {
  createNotificationHelper,
} = require("../notifications/notificationController");

// Helper to broadcast a notification to all Admin users
const notifyAdminsHelper = async ({
  title,
  message,
  type = "ShelterApplication",
  priority = "Medium",
  metadata = {},
}) => {
  try {
    const admins = await User.find({ role: "Admin" });
    if (!admins || admins.length === 0) return;
    const promises = admins.map((admin) =>
      createNotificationHelper({
        userId: admin._id,
        title,
        message,
        type,
        priority,
        metadata,
      }),
    );
    await Promise.all(promises);
  } catch (err) {
    console.error("Failed to notify admins:", err.message);
  }
};

// Helper to generate a secure temporary password meeting complexity criteria
const generateTemporaryPassword = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
  let pass = "ResQ@";
  for (let i = 0; i < 6; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pass;
};

// @desc    Submit a shelter registration application
// @route   POST /api/shelters/apply
// @access  Private
const submitApplication = async (req, res) => {
  try {
    const applicantId = req.user._id;
    const applicantName = req.user?.fullName || "";
    const {
      registrationType,
      registrationNumber,
      shelterName,
      shelterEmail,
      shelterPhoneNumber,
      address,
      city,
      district,
      state,
      pincode,
      latitude,
      longitude,
      totalStaffs,
      totalCages,
      occupiedCages,
      isEmailVerified,
      isPhoneVerified,
    } = req.body;

    const regNum = registrationNumber
      ? registrationNumber.trim().toUpperCase()
      : "";
    const email = shelterEmail ? shelterEmail.toLowerCase().trim() : "";

    // Verify if a user already exists with this shelter email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: `An account with the email '${email}' already exists. Please use a different shelter email.`,
      });
    }

    // Verify if an existing registered shelter already uses this email or registration number
    const existingShelter = await Shelter.findOne({
      $or: [{ registrationNumber: regNum }, { shelterEmail: email }],
      isDeleted: { $ne: true },
    });

    if (existingShelter) {
      return res.status(400).json({
        success: false,
        message: `A shelter with registration number '${regNum}' or email '${email}' is already registered.`,
      });
    }

    // Block only if a pending application with the exact same registration number or shelter email exists
    const existingPending = await ShelterApplication.findOne({
      $or: [{ registrationNumber: regNum }, { shelterEmail: email }],
      applicationStatus: "Pending",
    });

    if (existingPending) {
      return res.status(400).json({
        success: false,
        message: `An application with registration number '${existingPending.registrationNumber}' or email '${existingPending.shelterEmail}' is currently pending admin review.`,
        application: existingPending,
      });
    }

    const application = await ShelterApplication.create({
      applicantId,
      applicantName,
      registrationType,
      registrationNumber: regNum,
      shelterName: shelterName.trim(),
      shelterEmail: email,
      shelterPhoneNumber: Number(shelterPhoneNumber),
      address: address ? address.trim() : "",
      city: city ? city.trim() : "",
      district: district ? district.trim() : "",
      state: state ? state.trim() : "",
      pincode: pincode ? pincode.trim() : "",
      password: "",
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      totalStaffs: Number(totalStaffs),
      totalCages: Number(totalCages),
      occupiedCages: Number(occupiedCages || 0),
      isEmailVerified: isEmailVerified ?? true,
      isPhoneVerified: isPhoneVerified ?? true,
      applicationStatus: "Pending",
    });

    // 1. Create In-App Notification for the Applicant User
    createNotificationHelper({
      userId: applicantId,
      title: "Shelter Application Submitted 📋",
      message: `Your application for "${application.shelterName}" (#${application.shelterApplicationId}) has been successfully submitted. Admin will review details and schedule a physical site visit.`,
      type: "ShelterApplication",
      priority: "Medium",
      metadata: {
        shelterApplicationId: application.shelterApplicationId,
        shelterName: application.shelterName,
        applicationStatus: "Pending",
        status: "Pending",
      },
    }).catch((err) =>
      console.error("Failed to create submission notification for user:", err),
    );

    // Send confirmation email to both shelter email and applicant email (manager)
    const submissionRecipients = [
      ...new Set([application.shelterEmail, req.user?.email].filter(Boolean)),
    ];
    submissionRecipients.forEach((targetEmail) => {
      sendShelterApplicationSubmittedEmail(targetEmail, {
        applicantName: req.user?.fullName || application.shelterName,
        shelterName: application.shelterName,
        registrationNumber: application.registrationNumber,
        applicationId: application.shelterApplicationId,
        shelterPhoneNumber: application.shelterPhoneNumber,
        totalCages: application.totalCages,
      }).catch((err) =>
        console.warn(
          `Failed to send shelter application submission email to ${targetEmail}:`,
          err.message,
        ),
      );
    });

    // 2. Broadcast Notification to All Admins
    notifyAdminsHelper({
      title: "New Shelter Application Received 🏢",
      message: `New shelter registration application received for "${application.shelterName}" (#${application.shelterApplicationId}) from ${req.user.fullName || "User"}. Please review and set the valuation period date.`,
      type: "ShelterApplication",
      priority: "High",
      metadata: {
        shelterApplicationId: application.shelterApplicationId,
        shelterName: application.shelterName,
        applicantName: req.user.fullName,
        applicantEmail: req.user.email,
        applicationStatus: "Pending",
        status: "Pending",
      },
    }).catch((err) =>
      console.error(
        "Failed to create submission notification for admins:",
        err,
      ),
    );

    res.status(201).json({
      success: true,
      message:
        "Shelter application submitted successfully. Pending admin review.",
      application,
    });
  } catch (error) {
    console.error("Submit Shelter Application Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get the current user's own applications and shelter details
// @route   GET /api/shelters/my-application
// @access  Private
const getMyApplication = async (req, res) => {
  try {
    const applications = await ShelterApplication.find({
      $or: [{ applicantId: req.user._id }, { userId: req.user._id }],
    }).sort({ createdAt: -1 });

    if (!applications || applications.length === 0) {
      return res.status(200).json({
        success: true,
        application: null,
        applications: [],
        shelter: null,
        message: "No application found.",
      });
    }

    // Attach corresponding shelter details for approved applications
    const applicationIds = applications
      .filter((a) => (a.applicationStatus || a.status) === "Approved")
      .map((a) => a.shelterApplicationId);

    const shelters = await Shelter.find({
      $or: [
        { shelterApplicationId: { $in: applicationIds } },
        { userId: req.user._id },
      ],
    }).lean();

    const shelterMap = {};
    shelters.forEach((s) => {
      if (s.shelterApplicationId) {
        shelterMap[s.shelterApplicationId] = s;
      }
      if (s.userId) {
        shelterMap[String(s.userId)] = s;
      }
    });

    const applicationsWithShelters = applications.map((app) => {
      const obj = app.toObject();
      return {
        ...obj,
        applicationStatus: obj.applicationStatus || obj.status || "Pending",
        status: obj.applicationStatus || obj.status || "Pending",
        shelter:
          shelterMap[app.shelterApplicationId] ||
          shelterMap[String(req.user._id)] ||
          null,
      };
    });

    const latestApp = applicationsWithShelters[0];
    const shelter = latestApp ? latestApp.shelter || shelters[0] || null : null;

    res.status(200).json({
      success: true,
      application: latestApp,
      applications: applicationsWithShelters,
      shelter,
    });
  } catch (error) {
    console.error("Get My Application Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all shelter applications (Admin)
// @route   GET /api/shelters/applications
// @access  Private/Admin
const getAllApplications = async (req, res) => {
  try {
    const applications = await ShelterApplication.find()
      .sort({ createdAt: -1 })
      .populate("applicantId", "fullName email phoneNumber city state")
      .lean();

    // Attach corresponding shelter details (if approved)
    const applicationIds = applications
      .filter((a) => (a.applicationStatus || a.status) === "Approved")
      .map((a) => a.shelterApplicationId);

    const shelters = await Shelter.find({
      shelterApplicationId: { $in: applicationIds },
    }).lean();

    const shelterMap = {};
    shelters.forEach((s) => {
      if (s.shelterApplicationId) {
        shelterMap[s.shelterApplicationId] = s;
      }
    });

    const applicationsWithShelter = applications.map((app) => ({
      ...app,
      applicationStatus: app.applicationStatus || app.status || "Pending",
      status: app.applicationStatus || app.status || "Pending",
      shelter: shelterMap[app.shelterApplicationId] || null,
    }));

    res.status(200).json({
      success: true,
      count: applicationsWithShelter.length,
      applications: applicationsWithShelter,
    });
  } catch (error) {
    console.error("Get All Applications Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Review a shelter application: Schedule Site Visit, Upload Report, or Approve/Reject (Admin)
// @route   PUT /api/shelters/applications/:id/review
// @access  Private/Admin
const reviewApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      status,
      applicationStatus,
      reviewNote,
      siteVisitScheduleDate,
      siteVisitValuationPeriod,
      siteVisitNotes,
      siteVisitReport,
      siteVisitInspector,
    } = req.body;

    const finalStatus = applicationStatus || status;

    if (
      !["Pending", "Site Visit", "Approved", "Rejected"].includes(finalStatus)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Status must be 'Pending', 'Site Visit', 'Approved', or 'Rejected'.",
      });
    }

    const application = await ShelterApplication.findById(id);
    if (!application) {
      return res
        .status(404)
        .json({ success: false, message: "Application not found." });
    }

    application.applicationStatus = finalStatus;
    if (reviewNote !== undefined) application.reviewNote = reviewNote;
    if (siteVisitScheduleDate !== undefined)
      application.siteVisitScheduleDate = siteVisitScheduleDate;
    if (siteVisitValuationPeriod !== undefined)
      application.siteVisitValuationPeriod = siteVisitValuationPeriod;
    if (siteVisitNotes !== undefined)
      application.siteVisitNotes = siteVisitNotes;
    if (siteVisitReport !== undefined) {
      application.siteVisitReport = siteVisitReport;
      application.siteVisitReportDate = new Date();
    }
    if (siteVisitInspector !== undefined)
      application.siteVisitInspector = siteVisitInspector;

    await application.save();

    let createdShelter = null;
    let tempPassword = null;

    // When status is 'Site Visit': Dispatch notification to applicant and broadcast to admins
    if (finalStatus === "Site Visit") {
      const visitDateStr = siteVisitScheduleDate
        ? new Date(siteVisitScheduleDate).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        : siteVisitValuationPeriod || "upcoming days";

      const applicantTargetId = application.applicantId || application.userId;
      if (applicantTargetId) {
        createNotificationHelper({
          userId: applicantTargetId,
          title: "Shelter Site Visit & Valuation Scheduled 📅",
          message: `A physical site inspection and valuation for "${application.shelterName}" has been scheduled for ${visitDateStr}. The admin team will visit the premises to verify facilities and compliance.`,
          type: "ShelterApplication",
          priority: "High",
          metadata: {
            shelterApplicationId: application.shelterApplicationId,
            applicationStatus: "Site Visit",
            status: "Site Visit",
            siteVisitScheduleDate: application.siteVisitScheduleDate,
            siteVisitValuationPeriod: application.siteVisitValuationPeriod,
            siteVisitNotes: application.siteVisitNotes,
          },
        }).catch((err) =>
          console.error(
            "Failed to create site visit notification for user:",
            err,
          ),
        );
      }

      // Dispatch Site Visit email to both shelter email and applicant email (manager)
      const applicantUser =
        application.applicantId || application.userId
          ? await User.findById(application.applicantId || application.userId)
          : null;
      const siteVisitRecipients = [
        ...new Set(
          [application.shelterEmail, applicantUser?.email].filter(Boolean),
        ),
      ];
      siteVisitRecipients.forEach((targetEmail) => {
        sendShelterSiteVisitScheduledEmail(targetEmail, {
          shelterName: application.shelterName,
          applicationId: application.shelterApplicationId,
          visitDate: application.siteVisitScheduleDate || new Date(),
          valuationPeriod:
            application.siteVisitValuationPeriod || "Standard Slot",
          inspector: application.siteVisitInspector || "ResQNet Field Auditor",
          notes: application.siteVisitNotes || "",
        }).catch((err) =>
          console.warn(
            `Failed to send shelter site visit email to ${targetEmail}:`,
            err.message,
          ),
        );
      });

      // Broadcast to Admins
      notifyAdminsHelper({
        title: "Shelter Site Visit Scheduled 📅",
        message: `Site inspection and valuation for "${application.shelterName}" (#${application.shelterApplicationId}) is scheduled for ${visitDateStr}. Assigned Auditor: ${application.siteVisitInspector || "Admin Field Officer"}.`,
        type: "ShelterApplication",
        priority: "Medium",
        metadata: {
          shelterApplicationId: application.shelterApplicationId,
          applicationStatus: "Site Visit",
          status: "Site Visit",
          siteVisitScheduleDate: application.siteVisitScheduleDate,
          siteVisitValuationPeriod: application.siteVisitValuationPeriod,
        },
      }).catch((err) =>
        console.error(
          "Failed to create site visit notification for admins:",
          err,
        ),
      );
    }

    // On Approval: provision/upgrade User account with temporary password & create Shelter record
    if (finalStatus === "Approved") {
      const passwordToUse = generateTemporaryPassword();
      tempPassword = passwordToUse;
      const shelterEmail = application.shelterEmail.toLowerCase().trim();
      const shelterPhone = String(application.shelterPhoneNumber).trim();

      // Check if user already exists with this shelter email
      let shelterUser = await User.findOne({ email: shelterEmail });

      if (!shelterUser) {
        // Create a new user based on the shelter application details
        shelterUser = await User.create({
          fullName: application.shelterName.trim(),
          email: shelterEmail,
          phoneNumber: shelterPhone,
          password: passwordToUse,
          role: "Shelter",
          isEmailVerified: true,
          isPhoneVerified: true,
          status: "Active",
        });
      } else {
        // Update existing user with Shelter role, verified status and temporary password
        shelterUser.fullName = application.shelterName.trim();
        shelterUser.phoneNumber = shelterPhone;
        shelterUser.role = "Shelter";
        shelterUser.isEmailVerified = true;
        shelterUser.isPhoneVerified = true;
        shelterUser.password = passwordToUse; // Pre-save hook will hash this
        shelterUser.status = "Active";
        await shelterUser.save();
      }

      // Resolve Shelter Manager details from the applicant account
      const applicantUserId = application.applicantId || application.userId;
      const applicantUser = applicantUserId
        ? await User.findById(applicantUserId)
        : null;
      const managerName =
        application.applicantName ||
        applicantUser?.fullName ||
        "Shelter Manager";

      // Check if Shelter record already exists for this application
      let existingShelter = await Shelter.findOne({
        $or: [
          { shelterApplicationId: application.shelterApplicationId },
          { shelterEmail: shelterEmail },
        ],
      });

      if (!existingShelter) {
        existingShelter = await Shelter.create({
          shelterApplicationId: application.shelterApplicationId,
          userId: shelterUser._id,
          managerId: application.applicantId || null,
          address: application.address || "",
          city: application.city || "",
          district: application.district || "",
          state: application.state || "",
          pincode: application.pincode || "",
          registrationType:
            application.registrationType || "STATE_TRUST_SOCIETY",
          registrationNumber: application.registrationNumber || "",
          shelterName: application.shelterName,
          shelterEmail: shelterEmail,
          shelterPhoneNumber: application.shelterPhoneNumber,
          latitude: application.latitude,
          longitude: application.longitude,
          totalStaffs: application.totalStaffs,
          totalCages: application.totalCages,
          occupiedCages: application.occupiedCages,
          shelterStatus: "UNDER_MAINTENANCE",
          status: "Active",
        });
      } else {
        // Update shelter record with current user ID, manager details and application info
        existingShelter.shelterApplicationId = application.shelterApplicationId;
        existingShelter.userId = shelterUser._id;
        existingShelter.managerId =
          application.applicantId || existingShelter.managerId || null;
        existingShelter.address =
          application.address || existingShelter.address || "";
        existingShelter.city = application.city || existingShelter.city || "";
        existingShelter.district =
          application.district || existingShelter.district || "";
        existingShelter.state =
          application.state || existingShelter.state || "";
        existingShelter.pincode =
          application.pincode || existingShelter.pincode || "";
        existingShelter.registrationType =
          application.registrationType || existingShelter.registrationType;
        existingShelter.registrationNumber =
          application.registrationNumber || existingShelter.registrationNumber;
        existingShelter.shelterName = application.shelterName;
        existingShelter.shelterEmail = shelterEmail;
        existingShelter.shelterPhoneNumber = application.shelterPhoneNumber;
        if (!existingShelter.shelterStatus) {
          existingShelter.shelterStatus = "UNDER_MAINTENANCE";
        }
        existingShelter.status = "Active";
        await existingShelter.save();
      }

      createdShelter = existingShelter;

      // Dispatch shelter approval email with temporary password & login URL (ONLY to shelter email)
      try {
        await sendShelterApprovalEmail(shelterEmail, {
          shelterName: application.shelterName,
          shelterNumber: createdShelter.shelterNumber,
          tempPassword,
          managerName,
          loginUrl: `${process.env.CLIENT_URL || "http://localhost:5173"}/login`,
        });
      } catch (mailErr) {
        console.error(
          "Failed to send shelter approval email:",
          mailErr.message,
        );
      }

      // Send a separate congratulations email to the applicant/manager without credentials.
      if (applicantUser?.email) {
        try {
          await sendShelterApprovalManagerEmail(applicantUser.email, {
            managerName,
            shelterName: application.shelterName,
            shelterNumber: createdShelter.shelterNumber,
            shelterEmail,
            applicationId: application.shelterApplicationId,
          });
        } catch (mailErr) {
          console.error(
            "Failed to send manager approval notification email:",
            mailErr.message,
          );
        }
      }

      // 1. Create in-app approval notification for the applicant user
      const applicantTargetId = application.applicantId || application.userId;
      if (applicantTargetId) {
        createNotificationHelper({
          userId: applicantTargetId,
          title: "Shelter Application Approved! 🎉",
          message: `Congratulations! Your application for "${application.shelterName}" has been approved! Shelter account (${createdShelter.shelterNumber}) has been created. A temporary password has been emailed to ${shelterEmail}.`,
          type: "ShelterApplication",
          priority: "High",
          metadata: {
            shelterApplicationId: application.shelterApplicationId,
            shelterNumber: createdShelter.shelterNumber,
            shelterName: application.shelterName,
            applicationStatus: "Approved",
            status: "Approved",
          },
        }).catch((err) =>
          console.error(
            "Failed to create approval notification for user:",
            err,
          ),
        );
      }

      // 2. Broadcast approval to Admins
      notifyAdminsHelper({
        title: "Shelter Registration Approved 🏢",
        message: `"${application.shelterName}" (#${application.shelterApplicationId}) has been approved and registered with ID ${createdShelter.shelterNumber} following site valuation.`,
        type: "ShelterApplication",
        priority: "Medium",
        metadata: {
          shelterApplicationId: application.shelterApplicationId,
          shelterNumber: createdShelter.shelterNumber,
          applicationStatus: "Approved",
          status: "Approved",
        },
      }).catch((err) =>
        console.error(
          "Failed to create approval notification for admins:",
          err,
        ),
      );
    }

    // On Rejection of a previously approved one: close shelter & optionally downgrade user role
    if (finalStatus === "Rejected") {
      await Shelter.findOneAndUpdate(
        { shelterApplicationId: application.shelterApplicationId },
        { shelterStatus: "CLOSED" },
      );

      const user = await User.findById(
        application.applicantId || application.userId,
      );
      if (user && user.role === "Shelter") {
        await User.findByIdAndUpdate(user._id, { role: "Public User" });
      }

      // 1. Create in-app rejection notification for user
      const applicantTargetId = application.applicantId || application.userId;
      if (applicantTargetId) {
        createNotificationHelper({
          userId: applicantTargetId,
          title: "Shelter Application Rejected ⚠️",
          message: `Your application for "${application.shelterName}" (#${application.shelterApplicationId}) has been rejected by the admin.${reviewNote ? ` Reason: ${reviewNote}.` : ""} Please review requirements or submit a new application.`,
          type: "ShelterApplication",
          priority: "High",
          metadata: {
            shelterApplicationId: application.shelterApplicationId,
            applicationStatus: "Rejected",
            status: "Rejected",
            reviewNote,
          },
        }).catch((err) =>
          console.error(
            "Failed to create rejection notification for user:",
            err,
          ),
        );
      }

      // Dispatch rejection email to both shelter email and applicant email (manager)
      const applicantUser =
        application.applicantId || application.userId
          ? await User.findById(application.applicantId || application.userId)
          : null;
      const rejectionRecipients = [
        ...new Set(
          [application.shelterEmail, applicantUser?.email].filter(Boolean),
        ),
      ];
      rejectionRecipients.forEach((targetEmail) => {
        sendShelterApplicationRejectedEmail(targetEmail, {
          shelterName: application.shelterName,
          applicationId: application.shelterApplicationId,
          reason:
            reviewNote ||
            "Application did not meet operational or site valuation standards.",
        }).catch((err) =>
          console.warn(
            `Failed to send shelter rejection email to ${targetEmail}:`,
            err.message,
          ),
        );
      });

      // 2. Broadcast rejection to Admins
      notifyAdminsHelper({
        title: "Shelter Application Rejected ❌",
        message: `"${application.shelterName}" (#${application.shelterApplicationId}) was marked as Rejected.${reviewNote ? ` Reason: ${reviewNote}` : ""}`,
        type: "ShelterApplication",
        priority: "Medium",
        metadata: {
          shelterApplicationId: application.shelterApplicationId,
          applicationStatus: "Rejected",
          status: "Rejected",
          reviewNote,
        },
      }).catch((err) =>
        console.error(
          "Failed to create rejection notification for admins:",
          err,
        ),
      );
    }

    const updated = await ShelterApplication.findById(id).populate(
      "applicantId",
      "fullName email phoneNumber city state",
    );

    res.status(200).json({
      success: true,
      message: `Application ${status.toLowerCase()} successfully.${
        createdShelter
          ? ` Shelter registered as ${createdShelter.shelterNumber}.`
          : ""
      }`,
      application: {
        ...updated.toObject(),
        shelter: createdShelter,
      },
      shelter: createdShelter,
    });
  } catch (error) {
    console.error("Review Application Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  submitApplication,
  getMyApplication,
  getAllApplications,
  reviewApplication,
};
