const ShelterApplication = require('./shelterApplicationModel');
const Shelter = require('./shelterModel');
const User = require('../users/userModel');
const { sendShelterApprovalEmail } = require('../../utils/emailService');
const { createNotificationHelper } = require('../notifications/notificationController');

// Helper to generate a secure temporary password meeting complexity criteria
const generateTemporaryPassword = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
  let pass = 'ResQ@';
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
    const {
      registrationType,
      registrationNumber,
      shelterName,
      shelterEmail,
      shelterPhoneNumber,
      latitude,
      longitude,
      totalStaffs,
      totalCages,
      occupiedCages,
      isEmailVerified,
      isPhoneVerified,
    } = req.body;

    const regNum = registrationNumber ? registrationNumber.trim().toUpperCase() : '';
    const email = shelterEmail ? shelterEmail.toLowerCase().trim() : '';

    // Block only if a pending application with the exact same registration number or shelter email exists
    const existingPending = await ShelterApplication.findOne({
      $or: [
        { registrationNumber: regNum },
        { shelterEmail: email },
      ],
      status: 'Pending',
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
      userId: applicantId,
      registrationType,
      registrationNumber: regNum,
      shelterName: shelterName.trim(),
      shelterEmail: email,
      shelterPhoneNumber: Number(shelterPhoneNumber),
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      totalStaffs: Number(totalStaffs),
      totalCages: Number(totalCages),
      occupiedCages: Number(occupiedCages || 0),
      isEmailVerified: isEmailVerified ?? true,
      isPhoneVerified: isPhoneVerified ?? true,
      status: 'Pending',
    });

    // Create In-App Notification for Application Submission
    createNotificationHelper({
      userId: applicantId,
      title: 'Shelter Application Submitted 📋',
      message: `Your application for "${application.shelterName}" (#${application.shelterApplicationId}) has been submitted. Admin will review and approve.`,
      type: 'ShelterApplication',
      priority: 'Medium',
      metadata: {
        shelterApplicationId: application.shelterApplicationId,
        shelterName: application.shelterName,
      },
    }).catch((err) => console.error('Failed to create submission notification:', err));

    res.status(201).json({
      success: true,
      message: 'Shelter application submitted successfully. Pending admin review.',
      application,
    });
  } catch (error) {
    console.error('Submit Shelter Application Error:', error.message);
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
        message: 'No application found.',
      });
    }

    // Attach corresponding shelter details for approved applications
    const applicationIds = applications
      .filter((a) => a.status === 'Approved')
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

    const applicationsWithShelters = applications.map((app) => ({
      ...app.toObject(),
      shelter: shelterMap[app.shelterApplicationId] || shelterMap[String(req.user._id)] || null,
    }));

    const latestApp = applicationsWithShelters[0];
    const shelter = latestApp ? latestApp.shelter || shelters[0] || null : null;

    res.status(200).json({
      success: true,
      application: latestApp,
      applications: applicationsWithShelters,
      shelter,
    });
  } catch (error) {
    console.error('Get My Application Error:', error.message);
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
      .populate('applicantId', 'fullName email phoneNumber city state')
      .populate('userId', 'fullName email phoneNumber city state')
      .lean();

    // Attach corresponding shelter details (if approved)
    const applicationIds = applications
      .filter((a) => a.status === 'Approved')
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
      shelter: shelterMap[app.shelterApplicationId] || null,
    }));

    res.status(200).json({ success: true, applications: applicationsWithShelter });
  } catch (error) {
    console.error('Get All Applications Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve or Reject a shelter application (Admin)
// @route   PUT /api/shelters/applications/:id/review
// @access  Private/Admin
const reviewApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reviewNote } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be either 'Approved' or 'Rejected'.",
      });
    }

    const application = await ShelterApplication.findById(id);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    application.status = status;
    application.reviewNote = reviewNote || '';
    await application.save();

    let createdShelter = null;
    let tempPassword = null;

    // On Approval: provision/upgrade User account with temporary password & create Shelter record
    if (status === 'Approved') {
      tempPassword = generateTemporaryPassword();
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
          password: tempPassword,
          role: 'Shelter',
          isEmailVerified: true,
          isPhoneVerified: true,
          status: 'Active',
        });
      } else {
        // Update existing user with Shelter role, verified status and temporary password
        shelterUser.fullName = application.shelterName.trim();
        shelterUser.phoneNumber = shelterPhone;
        shelterUser.role = 'Shelter';
        shelterUser.isEmailVerified = true;
        shelterUser.isPhoneVerified = true;
        shelterUser.password = tempPassword; // Pre-save hook will hash this
        shelterUser.status = 'Active';
        await shelterUser.save();
      }

      // Link user ID to application
      application.userId = shelterUser._id;
      await application.save();

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
          registrationType: application.registrationType || 'STATE_TRUST_SOCIETY',
          registrationNumber: application.registrationNumber || '',
          shelterName: application.shelterName,
          shelterEmail: shelterEmail,
          shelterPhoneNumber: application.shelterPhoneNumber,
          latitude: application.latitude,
          longitude: application.longitude,
          totalStaffs: application.totalStaffs,
          totalCages: application.totalCages,
          occupiedCages: application.occupiedCages,
          status:
            application.occupiedCages >= application.totalCages && application.totalCages > 0
              ? 'FULL'
              : 'OPEN',
        });
      } else {
        // Update shelter record with current user ID and application info
        existingShelter.shelterApplicationId = application.shelterApplicationId;
        existingShelter.userId = shelterUser._id;
        existingShelter.registrationType = application.registrationType || existingShelter.registrationType;
        existingShelter.registrationNumber = application.registrationNumber || existingShelter.registrationNumber;
        existingShelter.shelterName = application.shelterName;
        existingShelter.shelterEmail = shelterEmail;
        existingShelter.shelterPhoneNumber = application.shelterPhoneNumber;
        existingShelter.status =
          existingShelter.occupiedCages >= existingShelter.totalCages && existingShelter.totalCages > 0
            ? 'FULL'
            : 'OPEN';
        await existingShelter.save();
      }

      createdShelter = existingShelter;

      // Dispatch shelter approval email with temporary password & login URL
      try {
        await sendShelterApprovalEmail(shelterEmail, {
          shelterName: application.shelterName,
          shelterNumber: createdShelter.shelterNumber,
          tempPassword,
          loginUrl: `${process.env.CLIENT_URL || 'http://localhost:5173'}/login`,
        });
      } catch (mailErr) {
        console.error('Failed to send shelter approval email:', mailErr.message);
      }

      // Create in-app approval notification
      const applicantTargetId = application.applicantId || application.userId;
      if (applicantTargetId) {
        createNotificationHelper({
          userId: applicantTargetId,
          title: 'Shelter Application Approved! 🎉',
          message: `Your application for "${application.shelterName}" has been approved! Shelter account (${createdShelter.shelterNumber}) is created. Temporary password has been emailed to ${shelterEmail}.`,
          type: 'ShelterApplication',
          priority: 'High',
          metadata: {
            shelterApplicationId: application.shelterApplicationId,
            shelterNumber: createdShelter.shelterNumber,
            status: 'Approved',
          },
        }).catch((err) => console.error('Failed to create approval notification:', err));
      }
    }

    // On Rejection of a previously approved one: close shelter & optionally downgrade user role
    if (status === 'Rejected') {
      await Shelter.findOneAndUpdate(
        { shelterApplicationId: application.shelterApplicationId },
        { status: 'CLOSED' }
      );

      const user = await User.findById(application.applicantId || application.userId);
      if (user && user.role === 'Shelter') {
        await User.findByIdAndUpdate(user._id, { role: 'Public User' });
      }

      // Create in-app rejection notification
      const applicantTargetId = application.applicantId || application.userId;
      if (applicantTargetId) {
        createNotificationHelper({
          userId: applicantTargetId,
          title: 'Shelter Application Rejected ⚠️',
          message: `Your application for "${application.shelterName}" (#${application.shelterApplicationId}) has been rejected by the admin.${reviewNote ? ` Reason: ${reviewNote}.` : ''} Please submit a new application.`,
          type: 'ShelterApplication',
          priority: 'High',
          metadata: {
            shelterApplicationId: application.shelterApplicationId,
            status: 'Rejected',
            reviewNote,
          },
        }).catch((err) => console.error('Failed to create rejection notification:', err));
      }
    }

    const updated = await ShelterApplication.findById(id)
      .populate('applicantId', 'fullName email phoneNumber city state')
      .populate('userId', 'fullName email phoneNumber city state');

    res.status(200).json({
      success: true,
      message: `Application ${status.toLowerCase()} successfully.${
        createdShelter ? ` Shelter registered as ${createdShelter.shelterNumber}.` : ''
      }`,
      application: {
        ...updated.toObject(),
        shelter: createdShelter,
      },
      shelter: createdShelter,
    });
  } catch (error) {
    console.error('Review Application Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  submitApplication,
  getMyApplication,
  getAllApplications,
  reviewApplication,
};

