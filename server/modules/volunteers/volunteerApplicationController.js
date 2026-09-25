const VolunteerApplication = require('./volunteerApplicationModel');
const User = require('../users/userModel');
const { sendVolunteerApprovalEmail } = require('../../utils/emailService');
const { createNotificationHelper } = require('../notifications/notificationController');

// Helper to broadcast a notification to all Admin users
const notifyAdminsHelper = async ({
  title,
  message,
  type = 'Volunteer',
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
    console.error('Failed to notify admins of volunteer event:', err.message);
  }
};

// Helper to broadcast a notification to all Rescue Team users
const notifyRescueTeamsHelper = async ({
  title,
  message,
  type = 'Volunteer',
  priority = 'Medium',
  metadata = {},
}) => {
  try {
    const rescueTeamUsers = await User.find({ role: 'Rescue Team' });
    if (!rescueTeamUsers || rescueTeamUsers.length === 0) return;
    for (const rt of rescueTeamUsers) {
      await createNotificationHelper({
        userId: rt._id,
        title,
        message,
        type,
        priority,
        metadata,
      });
    }
  } catch (err) {
    console.error('Failed to notify rescue teams of volunteer event:', err.message);
  }
};

// @desc    Submit a new volunteer application (Public User)
// @route   POST /api/volunteers/apply
// @access  Private
const submitVolunteerApplication = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      district,
      city,
      state,
      address,
      emergencyContact,
      availability,
      interests,
      skills,
      experienceNotes,
      hasVehicle,
      vehicleType,
      vehicleNumber,
      agreedToTerms,
    } = req.body;

    if (!fullName || !email || !phone || !district) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: fullName, email, phone, district.',
      });
    }

    const application = await VolunteerApplication.create({
      applicantId: req.user._id,
      userId: req.user._id,
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      phone: String(phone).trim(),
      district: district.trim(),
      city: city ? city.trim() : '',
      state: state ? state.trim() : 'Kerala',
      address: address ? address.trim() : '',
      emergencyContact: emergencyContact || { name: '', phone: '', relation: '' },
      availability: Array.isArray(availability) && availability.length > 0 ? availability : ['Weekends'],
      interests: Array.isArray(interests) && interests.length > 0 ? interests : ['Animal Feeding & Care'],
      skills: Array.isArray(skills) ? skills : [],
      experienceNotes: experienceNotes ? experienceNotes.trim() : '',
      hasVehicle: Boolean(hasVehicle),
      vehicleType: vehicleType || 'None',
      vehicleNumber: vehicleNumber ? vehicleNumber.trim().toUpperCase() : '',
      agreedToTerms: agreedToTerms !== undefined ? Boolean(agreedToTerms) : true,
      applicationStatus: 'Pending',
    });

    // Notify user
    createNotificationHelper({
      userId: req.user._id,
      title: 'Volunteer Application Submitted 🤝',
      message: `Your volunteer application (#${application.volunteerApplicationId}) has been received. Our team will review your profile and schedule an in-person orientation and verification visit.`,
      type: 'Volunteer',
      priority: 'Medium',
      metadata: {
        volunteerApplicationId: application.volunteerApplicationId,
        applicationStatus: 'Pending',
      },
    }).catch((err) => console.error('Failed to notify applicant:', err));

    // Notify admins
    notifyAdminsHelper({
      title: 'New Volunteer Application 🤝',
      message: `New volunteer application received from ${application.fullName} (${application.district}). Application ID: #${application.volunteerApplicationId}.`,
      type: 'Volunteer',
      priority: 'Medium',
      metadata: {
        volunteerApplicationId: application.volunteerApplicationId,
        applicantId: req.user._id,
      },
    }).catch((err) => console.error('Failed to broadcast to admins:', err));

    // Broadcast to all Rescue Teams
    notifyRescueTeamsHelper({
      title: 'New Volunteer Application Available 🤝',
      message: `New volunteer application received from ${application.fullName} (${application.district}). Application ID: #${application.volunteerApplicationId}. Any rescue team can review and coordinate orientation in Manage Volunteers.`,
      type: 'Volunteer',
      priority: 'Medium',
      metadata: {
        volunteerApplicationId: application.volunteerApplicationId,
        applicantId: req.user._id,
      },
    }).catch((err) => console.error('Failed to broadcast to rescue teams:', err));

    res.status(201).json({
      success: true,
      message: 'Volunteer application submitted successfully.',
      application,
    });
  } catch (error) {
    console.error('Submit Volunteer Application Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user's volunteer application(s)
// @route   GET /api/volunteers/my-application
// @access  Private
const getMyVolunteerApplication = async (req, res) => {
  try {
    const applications = await VolunteerApplication.find({
      $or: [{ applicantId: req.user._id }, { userId: req.user._id }],
    }).sort({ createdAt: -1 });

    const currentApp = applications.length > 0 ? applications[0] : null;

    res.status(200).json({
      success: true,
      application: currentApp,
      applications,
    });
  } catch (error) {
    console.error('Get My Volunteer Application Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all volunteer applications (Admin)
// @route   GET /api/volunteers/applications
// @access  Private/Admin
const getAllVolunteerApplications = async (req, res) => {
  try {
    const applications = await VolunteerApplication.find()
      .sort({ createdAt: -1 })
      .populate('applicantId', 'fullName email phoneNumber profilePic role status');

    res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    console.error('Get All Volunteer Applications Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Schedule physical volunteer visit / orientation (Admin)
// @route   PUT /api/volunteers/applications/:id/visit
// @access  Private/Admin
const scheduleVolunteerVisit = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      visitScheduleDate,
      visitValuationPeriod,
      visitCoordinator,
      visitNotes,
    } = req.body;

    if (!visitScheduleDate) {
      return res.status(400).json({
        success: false,
        message: 'Orientation date is required to schedule a volunteer visit.',
      });
    }

    const application = await VolunteerApplication.findById(id);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Volunteer application not found.' });
    }

    application.applicationStatus = 'Volunteer Visit';
    application.visitScheduleDate = visitScheduleDate;
    if (visitValuationPeriod !== undefined) {
      application.visitValuationPeriod = visitValuationPeriod;
    }
    if (visitCoordinator !== undefined) {
      application.visitCoordinator = visitCoordinator;
    }
    if (visitNotes !== undefined) {
      application.visitNotes = visitNotes;
    }

    if (req.user?.role === 'Rescue Team') {
      application.managedByRescueTeamName = req.user.fullName || 'Rescue Team Responder';
    }

    await application.save();

    const visitDateStr = new Date(visitScheduleDate).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    const applicantTargetId = application.applicantId || application.userId;
    if (applicantTargetId) {
      createNotificationHelper({
        userId: applicantTargetId,
        title: 'Volunteer Orientation & Verification Visit Scheduled 📅',
        message: `Your in-person volunteer orientation for application #${application.volunteerApplicationId} is scheduled for ${visitDateStr} (${application.visitValuationPeriod || 'Standard Session'}). Coordinator: ${application.visitCoordinator || 'Volunteer Officer'}. Notes: ${application.visitNotes || 'Please bring government photo ID.'}`,
        type: 'Volunteer',
        priority: 'High',
        metadata: {
          volunteerApplicationId: application.volunteerApplicationId,
          applicationStatus: 'Volunteer Visit',
          visitScheduleDate: application.visitScheduleDate,
          visitValuationPeriod: application.visitValuationPeriod,
          visitCoordinator: application.visitCoordinator,
        },
      }).catch((err) => console.error('Failed to notify volunteer of scheduled visit:', err));
    }

    notifyAdminsHelper({
      title: 'Volunteer Visit Scheduled 📅',
      message: `Orientation for ${application.fullName} (#${application.volunteerApplicationId}) scheduled on ${visitDateStr}. Assigned Coordinator: ${application.visitCoordinator || 'Field Officer'}.`,
      type: 'Volunteer',
      priority: 'Medium',
      metadata: {
        volunteerApplicationId: application.volunteerApplicationId,
        applicationStatus: 'Volunteer Visit',
      },
    }).catch((err) => console.error('Failed to notify admins of scheduled visit:', err));

    notifyRescueTeamsHelper({
      title: 'Volunteer Visit Scheduled 📅',
      message: `Orientation for ${application.fullName} (#${application.volunteerApplicationId}) scheduled on ${visitDateStr}. Coordinator: ${application.visitCoordinator || 'Field Officer'}.`,
      type: 'Volunteer',
      priority: 'Medium',
      metadata: {
        volunteerApplicationId: application.volunteerApplicationId,
        applicationStatus: 'Volunteer Visit',
      },
    }).catch((err) => console.error('Failed to notify rescue teams of scheduled visit:', err));

    res.status(200).json({
      success: true,
      message: 'Volunteer visit scheduled successfully.',
      application,
    });
  } catch (error) {
    console.error('Schedule Volunteer Visit Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Submit Volunteer Visit Report & Final Decision (Admin)
// @route   POST /api/volunteers/applications/:id/visit-report
// @access  Private/Admin
const submitVolunteerVisitReport = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      visitReport,
      visitChecks,
      decision, // 'Approved' | 'Rejected'
    } = req.body;

    if (!visitReport || !decision) {
      return res.status(400).json({
        success: false,
        message: 'Orientation report text and decision (Approved or Rejected) are required.',
      });
    }

    if (!['Approved', 'Rejected'].includes(decision)) {
      return res.status(400).json({
        success: false,
        message: "Decision must be either 'Approved' or 'Rejected'.",
      });
    }

    const application = await VolunteerApplication.findById(id);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Volunteer application not found.' });
    }

    application.visitReport = visitReport;
    application.visitReportDate = new Date();
    application.visitReportDecision = decision;
    application.applicationStatus = decision;

    if (visitChecks && typeof visitChecks === 'object') {
      application.visitChecks = {
        identityVerified: Boolean(visitChecks.identityVerified),
        animalHandlingReady: Boolean(visitChecks.animalHandlingReady),
        safetyOrientationDone: Boolean(visitChecks.safetyOrientationDone),
        commitmentAgreement: Boolean(visitChecks.commitmentAgreement),
      };
    }

    if (req.user?.role === 'Rescue Team') {
      application.managedByRescueTeamName = req.user.fullName || 'Rescue Team Responder';
    }

    await application.save();

    const applicantUserId = application.applicantId || application.userId;

    if (decision === 'Approved') {
      // Send certificate email
      try {
        await sendVolunteerApprovalEmail(application.email, {
          volunteerName: application.fullName,
          volunteerId: application.volunteerId,
          district: application.district,
          interests: application.interests,
        });
      } catch (emailErr) {
        console.warn('Failed to send volunteer approval email:', emailErr.message);
      }

      // In-app notification to volunteer
      createNotificationHelper({
        userId: applicantUserId,
        title: 'Volunteer Application Approved! 🎉',
        message: `Congratulations! Your volunteer orientation has passed and your official badge is issued. Volunteer ID: ${application.volunteerId}. Welcome to the ResQNet community!`,
        type: 'Volunteer',
        priority: 'High',
        metadata: {
          volunteerApplicationId: application.volunteerApplicationId,
          volunteerId: application.volunteerId,
          applicationStatus: 'Approved',
        },
      }).catch((err) => console.error('Failed to notify applicant of approval:', err));

      // Broadcast to Admins
      notifyAdminsHelper({
        title: 'Volunteer Certified ✅',
        message: `${application.fullName} (#${application.volunteerApplicationId}) passed orientation. Assigned Badge: ${application.volunteerId}.`,
        type: 'Volunteer',
        priority: 'Medium',
        metadata: {
          volunteerApplicationId: application.volunteerApplicationId,
          volunteerId: application.volunteerId,
        },
      }).catch((err) => console.error('Failed to notify admins of volunteer approval:', err));

      // Broadcast to Rescue Teams
      notifyRescueTeamsHelper({
        title: 'Volunteer Certified ✅',
        message: `${application.fullName} (#${application.volunteerApplicationId}) passed orientation. Assigned Badge: ${application.volunteerId}. Ready for field coordination.`,
        type: 'Volunteer',
        priority: 'Medium',
        metadata: {
          volunteerApplicationId: application.volunteerApplicationId,
          volunteerId: application.volunteerId,
        },
      }).catch((err) => console.error('Failed to notify rescue teams of volunteer approval:', err));
    } else {
      // Rejection notification
      createNotificationHelper({
        userId: applicantUserId,
        title: 'Volunteer Application Update ⚠️',
        message: `Your volunteer application (#${application.volunteerApplicationId}) was not approved following orientation. Please check your application status for details and recommendations.`,
        type: 'Volunteer',
        priority: 'High',
        metadata: {
          volunteerApplicationId: application.volunteerApplicationId,
          applicationStatus: 'Rejected',
          visitReport: application.visitReport,
        },
      }).catch((err) => console.error('Failed to notify applicant of rejection:', err));

      // Broadcast to Admins
      notifyAdminsHelper({
        title: 'Volunteer Application Rejected ❌',
        message: `Volunteer application for ${application.fullName} (#${application.volunteerApplicationId}) was marked Rejected.`,
        type: 'Volunteer',
        priority: 'Low',
        metadata: {
          volunteerApplicationId: application.volunteerApplicationId,
        },
      }).catch((err) => console.error('Failed to notify admins of rejection:', err));

      // Broadcast to Rescue Teams
      notifyRescueTeamsHelper({
        title: 'Volunteer Application Rejected ❌',
        message: `Volunteer application for ${application.fullName} (#${application.volunteerApplicationId}) was evaluated and marked Rejected.`,
        type: 'Volunteer',
        priority: 'Low',
        metadata: {
          volunteerApplicationId: application.volunteerApplicationId,
        },
      }).catch((err) => console.error('Failed to notify rescue teams of rejection:', err));
    }

    res.status(200).json({
      success: true,
      message: `Volunteer visit report submitted and application marked as ${decision}.`,
      application,
    });
  } catch (error) {
    console.error('Submit Volunteer Visit Report Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  submitVolunteerApplication,
  getMyVolunteerApplication,
  getAllVolunteerApplications,
  scheduleVolunteerVisit,
  submitVolunteerVisitReport,
};
