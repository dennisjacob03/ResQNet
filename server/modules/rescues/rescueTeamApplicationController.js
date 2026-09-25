const RescueTeamApplication = require('./rescueTeamApplicationModel');
const RescueTeam = require('./rescueTeamModel');
const User = require('../users/userModel');
const { sendRescueTeamApprovalEmail } = require('../../utils/emailService');
const { createNotificationHelper } = require('../notifications/notificationController');

// Helper to broadcast a notification to all Admin users
const notifyAdminsHelper = async ({
  title,
  message,
  type = 'Rescue',
  priority = 'Medium',
  metadata = {},
}) => {
  try {
    const admins = await User.find({ role: 'Admin' });
    if (!admins || admins.length === 0) return;
    for (const admin of admins) {
      await createNotificationHelper({
        userId: admin._id,
        title,
        message,
        type,
        priority,
        metadata,
      });
    }
  } catch (err) {
    console.error('Failed to notify admins:', err.message);
  }
};

// @desc    Submit a new rescue team application (Public User)
// @route   POST /api/rescues/apply
// @access  Private
const submitRescueTeamApplication = async (req, res) => {
  try {
    const {
      teamName,
      teamLeadName,
      contactEmail,
      contactPhone,
      operatingDistrict,
      coverageZone,
      vehicleType,
      vehicleNumber,
      totalMembers,
      equipment,
      address,
      latitude,
      longitude,
      notes,
    } = req.body;

    if (
      !teamName ||
      !teamLeadName ||
      !contactEmail ||
      !contactPhone ||
      !operatingDistrict ||
      !vehicleType ||
      !vehicleNumber ||
      !totalMembers
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Please provide all required fields: teamName, teamLeadName, contactEmail, contactPhone, operatingDistrict, vehicleType, vehicleNumber, totalMembers.',
      });
    }

    const application = await RescueTeamApplication.create({
      applicantId: req.user._id,
      userId: req.user._id,
      teamName: teamName.trim(),
      teamLeadName: teamLeadName.trim(),
      contactEmail: contactEmail.toLowerCase().trim(),
      contactPhone: String(contactPhone).trim(),
      operatingDistrict: operatingDistrict.trim(),
      coverageZone: coverageZone ? coverageZone.trim() : '',
      vehicleType,
      vehicleNumber: vehicleNumber.trim().toUpperCase(),
      totalMembers: Number(totalMembers),
      equipment: Array.isArray(equipment) ? equipment : ['First Aid Kit', 'Gloves & Handling Gear'],
      address: address ? address.trim() : '',
      latitude: latitude ? Number(latitude) : null,
      longitude: longitude ? Number(longitude) : null,
      notes: notes ? notes.trim() : '',
      applicationStatus: 'Pending',
    });

    // Notify user of successful submission
    createNotificationHelper({
      userId: req.user._id,
      title: 'Rescue Team Application Submitted 🚑',
      message: `Your application for "${application.teamName}" (#${application.rescueTeamApplicationId}) has been received. Our administration team will review your details and schedule an equipment & vehicle inspection.`,
      type: 'Rescue',
      priority: 'Medium',
      metadata: {
        rescueTeamApplicationId: application.rescueTeamApplicationId,
        applicationStatus: 'Pending',
      },
    }).catch((err) => console.error('Failed to create notification for applicant:', err));

    // Notify all admins
    notifyAdminsHelper({
      title: 'New Rescue Team Registration Application 🚑',
      message: `Team "${application.teamName}" (${application.operatingDistrict}) applied with vehicle ${application.vehicleNumber} (${application.vehicleType}). Physical team visit and valuation required.`,
      type: 'Rescue',
      priority: 'High',
      metadata: {
        rescueTeamApplicationId: application.rescueTeamApplicationId,
        applicationId: application._id,
      },
    }).catch((err) => console.error('Failed to notify admins of rescue application:', err));

    res.status(201).json({
      success: true,
      message: 'Rescue team application submitted successfully.',
      application,
    });
  } catch (error) {
    console.error('Submit Rescue Team Application Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user's rescue team application(s)
// @route   GET /api/rescues/my-application
// @access  Private
const getMyRescueTeamApplication = async (req, res) => {
  try {
    const applications = await RescueTeamApplication.find({
      $or: [{ applicantId: req.user._id }, { userId: req.user._id }],
    }).sort({ createdAt: -1 });

    if (!applications || applications.length === 0) {
      return res.status(200).json({
        success: true,
        application: null,
        applications: [],
        rescueTeam: null,
        message: 'No rescue team application found.',
      });
    }

    const rescueTeam = await RescueTeam.findOne({ userId: req.user._id }).lean();

    const mappedApps = applications.map((app) => {
      const obj = app.toObject();
      return {
        ...obj,
        rescueTeam: obj.applicationStatus === 'Approved' ? rescueTeam : null,
      };
    });

    res.status(200).json({
      success: true,
      application: mappedApps[0],
      applications: mappedApps,
      rescueTeam,
    });
  } catch (error) {
    console.error('Get My Rescue Team Application Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all rescue team applications (Admin)
// @route   GET /api/rescues/applications
// @access  Private/Admin
const getAllRescueTeamApplications = async (req, res) => {
  try {
    const applications = await RescueTeamApplication.find()
      .sort({ createdAt: -1 })
      .populate('applicantId', 'fullName email phoneNumber city state')
      .populate('userId', 'fullName email phoneNumber city state')
      .lean();

    const userIds = applications.map((a) => a.userId?._id || a.applicantId?._id).filter(Boolean);
    const teams = await RescueTeam.find({ userId: { $in: userIds } }).lean();

    const teamMap = {};
    teams.forEach((t) => {
      teamMap[String(t.userId)] = t;
    });

    const applicationsWithTeam = applications.map((app) => {
      const uId = String(app.userId?._id || app.applicantId?._id || '');
      return {
        ...app,
        rescueTeam: app.applicationStatus === 'Approved' ? teamMap[uId] || null : null,
      };
    });

    res.status(200).json({
      success: true,
      count: applicationsWithTeam.length,
      applications: applicationsWithTeam,
    });
  } catch (error) {
    console.error('Get All Rescue Team Applications Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Schedule physical team visit and equipment audit (Admin)
// @route   PUT /api/rescues/applications/:id/visit
// @access  Private/Admin
const scheduleTeamVisit = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      teamVisitScheduleDate,
      teamVisitValuationPeriod,
      teamVisitInspector,
      teamVisitNotes,
    } = req.body;

    if (!teamVisitScheduleDate) {
      return res.status(400).json({
        success: false,
        message: 'Valuation period date is required to schedule a team visit.',
      });
    }

    const application = await RescueTeamApplication.findById(id);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Rescue team application not found.' });
    }

    application.applicationStatus = 'Team Visit';
    application.teamVisitScheduleDate = teamVisitScheduleDate;
    if (teamVisitValuationPeriod !== undefined) {
      application.teamVisitValuationPeriod = teamVisitValuationPeriod;
    }
    if (teamVisitInspector !== undefined) {
      application.teamVisitInspector = teamVisitInspector;
    }
    if (teamVisitNotes !== undefined) {
      application.teamVisitNotes = teamVisitNotes;
    }

    await application.save();

    const visitDateStr = new Date(teamVisitScheduleDate).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    // Notify applicant
    const applicantTargetId = application.applicantId || application.userId;
    if (applicantTargetId) {
      createNotificationHelper({
        userId: applicantTargetId,
        title: 'Rescue Team Visit & Vehicle Valuation Scheduled 📅',
        message: `An official field inspection and equipment audit for "${application.teamName}" has been scheduled for ${visitDateStr} (${application.teamVisitValuationPeriod || 'Standard Slot'}). The inspector will evaluate vehicle safety and rescue gear.`,
        type: 'Rescue',
        priority: 'High',
        metadata: {
          rescueTeamApplicationId: application.rescueTeamApplicationId,
          applicationStatus: 'Team Visit',
          teamVisitScheduleDate: application.teamVisitScheduleDate,
          teamVisitValuationPeriod: application.teamVisitValuationPeriod,
          teamVisitInspector: application.teamVisitInspector,
        },
      }).catch((err) => console.error('Failed to notify applicant of scheduled visit:', err));
    }

    // Broadcast to Admins
    notifyAdminsHelper({
      title: 'Rescue Team Visit Scheduled 📅',
      message: `Physical valuation for "${application.teamName}" (#${application.rescueTeamApplicationId}) is scheduled on ${visitDateStr}. Assigned Auditor: ${application.teamVisitInspector || 'Admin Field Officer'}.`,
      type: 'Rescue',
      priority: 'Medium',
      metadata: {
        rescueTeamApplicationId: application.rescueTeamApplicationId,
        applicationStatus: 'Team Visit',
      },
    }).catch((err) => console.error('Failed to notify admins of scheduled visit:', err));

    res.status(200).json({
      success: true,
      message: 'Team visit scheduled successfully.',
      application,
    });
  } catch (error) {
    console.error('Schedule Team Visit Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Submit Team Visit Report & Final Decision (Admin)
// @route   POST /api/rescues/applications/:id/visit-report
// @access  Private/Admin
const submitTeamVisitReport = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      teamVisitReport,
      teamVisitChecks,
      decision, // 'Approved' | 'Rejected'
    } = req.body;

    if (!teamVisitReport || !decision) {
      return res.status(400).json({
        success: false,
        message: 'Inspection report text and decision (Approved or Rejected) are required.',
      });
    }

    if (!['Approved', 'Rejected'].includes(decision)) {
      return res.status(400).json({
        success: false,
        message: "Decision must be either 'Approved' or 'Rejected'.",
      });
    }

    const application = await RescueTeamApplication.findById(id);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Rescue team application not found.' });
    }

    application.teamVisitReport = teamVisitReport;
    application.teamVisitReportDate = new Date();
    application.teamVisitReportDecision = decision;
    application.applicationStatus = decision;

    if (teamVisitChecks && typeof teamVisitChecks === 'object') {
      application.teamVisitChecks = {
        vehicleVerified: Boolean(teamVisitChecks.vehicleVerified),
        equipmentVerified: Boolean(teamVisitChecks.equipmentVerified),
        membersVerified: Boolean(teamVisitChecks.membersVerified),
        safetyCompliance: Boolean(teamVisitChecks.safetyCompliance),
      };
    }

    await application.save();

    let createdRescueTeam = null;

    if (decision === 'Approved') {
      const applicantUserId = application.applicantId || application.userId;
      const user = await User.findById(applicantUserId);

      if (user) {
        user.role = 'Rescue Team';
        await user.save();
      }

      // Create or update active RescueTeam registry document
      let existingTeam = await RescueTeam.findOne({ userId: applicantUserId });

      if (!existingTeam) {
        existingTeam = await RescueTeam.create({
          userId: applicantUserId,
          vehicleNumber: application.vehicleNumber,
          vehicleType: application.vehicleType,
          operatingDistrict: application.operatingDistrict,
          availability: 'Available',
          status: 'Active',
        });
      } else {
        existingTeam.vehicleNumber = application.vehicleNumber;
        existingTeam.vehicleType = application.vehicleType;
        existingTeam.operatingDistrict = application.operatingDistrict;
        existingTeam.status = 'Active';
        existingTeam.availability = 'Available';
        await existingTeam.save();
      }

      createdRescueTeam = existingTeam;

      // Dispatch approval email
      try {
        await sendRescueTeamApprovalEmail(application.contactEmail, {
          teamName: application.teamName,
          teamId: createdRescueTeam.teamId,
          rescueTeamNumber: createdRescueTeam.rescueTeamNumber,
          vehicleNumber: createdRescueTeam.vehicleNumber,
          vehicleType: createdRescueTeam.vehicleType,
          district: createdRescueTeam.operatingDistrict,
        });
      } catch (emailErr) {
        console.warn('Failed to send rescue team approval email:', emailErr.message);
      }

      // In-app notification to applicant
      createNotificationHelper({
        userId: applicantUserId,
        title: 'Rescue Team Application Approved! 🎉',
        message: `Congratulations! Your team "${application.teamName}" has passed physical valuation and is officially approved. Assigned Team ID: ${createdRescueTeam.teamId}, Rescue Call: ${createdRescueTeam.rescueTeamNumber}. Your account role is now Rescue Team.`,
        type: 'Rescue',
        priority: 'High',
        metadata: {
          rescueTeamApplicationId: application.rescueTeamApplicationId,
          applicationStatus: 'Approved',
          teamId: createdRescueTeam.teamId,
          rescueTeamNumber: createdRescueTeam.rescueTeamNumber,
        },
      }).catch((err) => console.error('Failed to notify applicant of approval:', err));

      // Broadcast to Admins
      notifyAdminsHelper({
        title: 'Rescue Team Approved ✅',
        message: `Team "${application.teamName}" (#${application.rescueTeamApplicationId}) passed inspection. Assigned ID: ${createdRescueTeam.teamId}.`,
        type: 'Rescue',
        priority: 'Medium',
        metadata: {
          rescueTeamApplicationId: application.rescueTeamApplicationId,
          teamId: createdRescueTeam.teamId,
        },
      }).catch((err) => console.error('Failed to notify admins of team approval:', err));
    } else {
      // Rejection branch
      const applicantUserId = application.applicantId || application.userId;
      createNotificationHelper({
        userId: applicantUserId,
        title: 'Rescue Team Application Update ⚠️',
        message: `Your registration application for "${application.teamName}" was not approved following the team inspection. Please view your application history for findings and corrective recommendations.`,
        type: 'Rescue',
        priority: 'High',
        metadata: {
          rescueTeamApplicationId: application.rescueTeamApplicationId,
          applicationStatus: 'Rejected',
          teamVisitReport: application.teamVisitReport,
        },
      }).catch((err) => console.error('Failed to notify applicant of rejection:', err));

      // Broadcast to Admins
      notifyAdminsHelper({
        title: 'Rescue Team Application Rejected ❌',
        message: `Team "${application.teamName}" (#${application.rescueTeamApplicationId}) was marked Rejected with report filed.`,
        type: 'Rescue',
        priority: 'Low',
        metadata: {
          rescueTeamApplicationId: application.rescueTeamApplicationId,
        },
      }).catch((err) => console.error('Failed to notify admins of team rejection:', err));
    }

    res.status(200).json({
      success: true,
      message: `Team visit report submitted and application marked as ${decision}.`,
      application,
      rescueTeam: createdRescueTeam,
    });
  } catch (error) {
    console.error('Submit Team Visit Report Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  submitRescueTeamApplication,
  getMyRescueTeamApplication,
  getAllRescueTeamApplications,
  scheduleTeamVisit,
  submitTeamVisitReport,
};
