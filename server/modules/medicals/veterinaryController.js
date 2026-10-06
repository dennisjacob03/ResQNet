const mongoose = require("mongoose");
const VetStaffApplication = require("../shelters/vetStaffApplicationModel");
const VetStaff = require("../shelters/vetStaffModel");
const Shelter = require("../shelters/shelterModel");
const User = require("../users/userModel");
const Animal = require("../animals/animalModel");
const MedicalRecord = require("./medicalRecordModel");
const Vaccination = require("./vaccinationModel");
const MedicalReminder = require("./medicalReminderModel");
const MedicineStock = require("./medicineStockModel");
const Notification = require("../notifications/notificationModel");
const {
  sendVetInterviewScheduledEmail,
  sendVetStaffApprovalEmail,
  sendShelterAnimalMedicalReminderEmail,
  sendVetStaffApplicationSubmittedEmail,
  sendVetStaffRejectedEmail,
} = require("../../utils/emailService");

// Helper to resolve the authenticated user's shelter
const resolveUserShelter = async (user) => {
  const userId = user._id;
  const userEmail = user.email ? user.email.toLowerCase().trim() : "";

  const shelter = await Shelter.findOne({
    $or: [{ userId }, { shelterEmail: userEmail }],
    isDeleted: { $ne: true },
  });

  return shelter;
};

// Helper to generate a secure temporary password meeting complexity criteria
const generateTemporaryPassword = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
  let pass = "Vet@";
  for (let i = 0; i < 6; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pass;
};

// Helper to resolve assigned shelter for a veterinary staff member
const resolveVetStaffShelter = async (user) => {
  const userEmail = user.email ? user.email.toLowerCase().trim() : "";
  const vetStaff = await VetStaff.findOne({
    $or: [{ userId: user._id }, ...(userEmail ? [{ email: userEmail }] : [])],
    status: "Active",
  });

  if (!vetStaff) return null;

  const shelter = await Shelter.findById(vetStaff.shelterId);
  return { vetStaff, shelter };
};

/**
 * @desc    Submit application to become Veterinary Staff
 * @route   POST /api/veterinary/apply
 * @access  Private (Public User)
 */
const submitVetStaffApplication = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      applicantEmail = req.user.email,
      isEmailVerified = false,
      isPhoneVerified = false,
      district,
      city,
      address = "",
      pincode = "",
      state = "",
      location = "",
      position = "Veterinary Doctor",
      councilRegistrationNumber,
      qualification = "BVSc & AH",
      specialization = "General Canine & Feline Medicine",
      experienceYears = 0,
      targetShelterId,
      resume = "",
    } = req.body;

    if (!isEmailVerified || !isPhoneVerified) {
      return res.status(400).json({
        success: false,
        message:
          "Email and phone verification are required before submitting the veterinary staff application.",
      });
    }

    if (!fullName || !email || !phone || !councilRegistrationNumber) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide full name, email, phone, and veterinary council registration number.",
      });
    }

    const officialEmail = email.trim().toLowerCase();
    if (officialEmail === req.user.email.toLowerCase().trim()) {
      return res.status(400).json({
        success: false,
        message:
          "Official veterinary email must be different from your profile email.",
      });
    }
    if (await User.findOne({ email: officialEmail })) {
      return res.status(400).json({
        success: false,
        message:
          "An account with the official veterinary email already exists.",
      });
    }
    if (
      !/^\d{6}$/.test(String(pincode).trim()) ||
      !state ||
      !district ||
      !city
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide a valid workplace PIN code, state, district, and city.",
      });
    }

    let targetShelterName = "All Shelters (Open)";
    let resolvedTargetShelterId = null;

    if (
      targetShelterId &&
      targetShelterId !== "all" &&
      mongoose.Types.ObjectId.isValid(targetShelterId)
    ) {
      const shelter = await Shelter.findById(targetShelterId);
      if (shelter) {
        resolvedTargetShelterId = shelter._id;
        targetShelterName = shelter.shelterName;
      }
    }

    const application = await VetStaffApplication.create({
      userId: req.user._id,
      fullName: fullName.trim(),
      email: officialEmail,
      applicantEmail: applicantEmail.trim().toLowerCase(),
      phone: phone.trim(),
      address: address.trim(),
      pincode: pincode.trim(),
      state: state.trim(),
      district: district ? district.trim() : "",
      city: city ? city.trim() : "",
      location: location.trim(),
      position,
      councilRegistrationNumber: councilRegistrationNumber.trim().toUpperCase(),
      qualification: qualification.trim(),
      specialization: specialization.trim(),
      experienceYears: Number(experienceYears) || 0,
      targetShelterId: resolvedTargetShelterId,
      targetShelterName,
      resume,
      isEmailVerified: true,
      isPhoneVerified: true,
      status: "Pending",
    });

    // In-app confirmation for applicant
    await Notification.create({
      userId: req.user._id,
      title: "Veterinary Staff Application Submitted",
      message: `Your veterinary application [${application.vetStaffApplicationId}] has been submitted to ${targetShelterName}. You will be notified when an interview is scheduled.`,
      type: "Veterinary",
      priority: "Medium",
      metadata: {
        applicationId: application._id,
        vetStaffApplicationId: application.vetStaffApplicationId,
      },
    });

    // If targeted to a specific shelter, alert the shelter manager
    if (resolvedTargetShelterId) {
      const targetShelter = await Shelter.findById(resolvedTargetShelterId);
      if (targetShelter && targetShelter.userId) {
        await Notification.create({
          userId: targetShelter.userId,
          title: "New Veterinary Staff Application",
          message: `${fullName} (${position}, Reg: ${councilRegistrationNumber}) submitted an application to join your shelter veterinary staff.`,
          type: "Veterinary",
          priority: "High",
          metadata: {
            applicationId: application._id,
            vetStaffApplicationId: application.vetStaffApplicationId,
          },
        });
      }
    }

    // Send confirmation email to both the official and original applicant addresses.
    const submissionEmail = {
      applicantName: application.fullName,
      position: application.position,
      councilNumber: application.councilRegistrationNumber,
      targetShelterName,
      applicationId: application.vetStaffApplicationId,
    };
    Promise.allSettled([
      sendVetStaffApplicationSubmittedEmail(application.email, submissionEmail),
      sendVetStaffApplicationSubmittedEmail(
        application.applicantEmail,
        submissionEmail,
      ),
    ]).catch((err) =>
      console.warn(
        "Failed to send vet staff application submission email:",
        err.message,
      ),
    );

    res.status(201).json({
      success: true,
      message: "Veterinary staff application submitted successfully",
      application,
    });
  } catch (error) {
    console.error("Submit Vet Staff Application Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

const checkVetStaffEmail = async (req, res) => {
  try {
    const email = String(req.query.email || "")
      .trim()
      .toLowerCase();
    if (!email)
      return res
        .status(400)
        .json({ success: false, message: "Email is required." });
    if (email === req.user.email.toLowerCase().trim()) {
      return res.status(200).json({
        success: true,
        available: false,
        message: "Use an email different from your profile email.",
      });
    }
    const exists = await User.exists({ email });
    return res.status(200).json({
      success: true,
      available: !exists,
      message: exists ? "An account with this email already exists." : "",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get the current user's latest veterinary staff application
 * @route   GET /api/veterinary/my-application
 * @access  Private
 */
const getMyVetStaffApplication = async (req, res) => {
  try {
    const userEmail = req.user.email ? req.user.email.toLowerCase().trim() : "";
    const application = await VetStaffApplication.findOne({
      $or: [
        { userId: req.user._id },
        { applicantEmail: userEmail },
        ...(userEmail ? [{ email: userEmail }] : []),
      ],
    })
      .sort({ createdAt: -1 })
      .populate(
        "targetShelterId",
        "shelterName shelterEmail shelterPhoneNumber shelterNumber",
      )
      .populate(
        "assignedShelterId",
        "shelterName shelterEmail shelterPhoneNumber shelterNumber",
      );

    // Also check if user has active VetStaff record
    const vetStaff = await VetStaff.findOne({
      $or: [
        { userId: req.user._id },
        ...(userEmail ? [{ email: userEmail }] : []),
      ],
      status: "Active",
    }).populate(
      "shelterId",
      "shelterName shelterEmail shelterPhoneNumber shelterNumber",
    );

    res.status(200).json({
      success: true,
      application,
      vetStaff,
    });
  } catch (error) {
    console.error("Get My Vet Staff Application Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get applications visible to the authenticated shelter (targeted or open)
 * @route   GET /api/veterinary/shelter-applications
 * @access  Private (Shelter Manager)
 */
const getShelterVetApplications = async (req, res) => {
  try {
    const shelter = await resolveUserShelter(req.user);
    if (!shelter) {
      return res.status(404).json({
        success: false,
        message: "No registered shelter found associated with this account.",
      });
    }

    // Applications either targeting this shelter specifically OR open to all shelters OR assigned to this shelter
    const applications = await VetStaffApplication.find({
      $or: [
        { targetShelterId: shelter._id },
        { targetShelterId: null },
        { assignedShelterId: shelter._id },
      ],
    })
      .sort({ createdAt: -1 })
      .populate("userId", "fullName email phoneNumber city");

    res.status(200).json({
      success: true,
      shelter: {
        _id: shelter._id,
        shelterName: shelter.shelterName,
        shelterNumber: shelter.shelterNumber,
      },
      applications,
    });
  } catch (error) {
    console.error("Get Shelter Vet Applications Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Schedule an in-person clinical interview for veterinary staff applicant
 * @route   PUT /api/veterinary/applications/:id/interview
 * @access  Private (Shelter Manager)
 */
const scheduleVetInterview = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      interviewScheduleDate,
      interviewTimeSlot = "10:00 AM - 12:00 PM",
      interviewLocation = "",
      interviewInterviewer = "",
      interviewNotes = "",
    } = req.body;

    if (!interviewScheduleDate) {
      return res.status(400).json({
        success: false,
        message: "Please specify the interview schedule date.",
      });
    }

    const shelter = await resolveUserShelter(req.user);
    if (!shelter) {
      return res.status(404).json({
        success: false,
        message: "No registered shelter found associated with this account.",
      });
    }

    const query = mongoose.Types.ObjectId.isValid(id)
      ? { _id: id }
      : { vetStaffApplicationId: id };

    const application = await VetStaffApplication.findOne(query);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Veterinary staff application not found.",
      });
    }

    application.status = "Interview Scheduled";
    application.interviewScheduleDate = new Date(interviewScheduleDate);
    application.interviewTimeSlot = interviewTimeSlot;
    application.interviewLocation =
      interviewLocation || `${shelter.shelterName} Veterinary Wing`;
    application.interviewInterviewer =
      interviewInterviewer ||
      req.user.fullName ||
      "Shelter Veterinary Director";
    application.interviewNotes = interviewNotes;

    // If application was open, anchor target shelter now to the scheduling shelter
    if (!application.targetShelterId) {
      application.targetShelterId = shelter._id;
      application.targetShelterName = shelter.shelterName;
    }

    await application.save();

    // In-app notification to applicant
    await Notification.create({
      userId: application.userId,
      title: "Veterinary Clinical Interview Scheduled! 🩺",
      message: `Interview scheduled at ${shelter.shelterName} on ${new Date(
        interviewScheduleDate,
      ).toLocaleDateString()} (${interviewTimeSlot}) at ${application.interviewLocation}.`,
      type: "Veterinary",
      priority: "High",
      metadata: {
        applicationId: application._id,
        shelterName: shelter.shelterName,
        interviewDate: application.interviewScheduleDate,
        timeSlot: application.interviewTimeSlot,
      },
    });

    // Send email notification to both the official and original applicant addresses.
    try {
      const interviewEmail = {
        applicantName: application.fullName,
        applicationId: application.vetStaffApplicationId,
        shelterName: shelter.shelterName,
        interviewDate: application.interviewScheduleDate,
        timeSlot: application.interviewTimeSlot,
        location: application.interviewLocation,
        interviewer: application.interviewInterviewer,
        notes: application.interviewNotes,
      };
      await Promise.allSettled([
        sendVetInterviewScheduledEmail(application.email, interviewEmail),
        sendVetInterviewScheduledEmail(
          application.applicantEmail,
          interviewEmail,
        ),
      ]);
    } catch (emailErr) {
      console.warn(
        "Failed to send interview scheduled email:",
        emailErr.message,
      );
    }

    res.status(200).json({
      success: true,
      message: `Clinical interview scheduled for ${application.fullName}`,
      application,
    });
  } catch (error) {
    console.error("Schedule Vet Interview Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Submit evaluation report, approve & assign veterinary staff to shelter, or reject
 * @route   POST /api/veterinary/applications/:id/interview-report
 * @access  Private (Shelter Manager)
 */
const submitVetInterviewReport = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      interviewChecks = {},
      interviewReport = "",
      decision = "Approved",
      rejectionReason = "",
    } = req.body;

    const shelter = await resolveUserShelter(req.user);
    if (!shelter) {
      return res.status(404).json({
        success: false,
        message: "No registered shelter found associated with this account.",
      });
    }

    const query = mongoose.Types.ObjectId.isValid(id)
      ? { _id: id }
      : { vetStaffApplicationId: id };

    const application = await VetStaffApplication.findOne(query);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Veterinary staff application not found.",
      });
    }

    if (!interviewReport.trim()) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide detailed clinical evaluation remarks for the interview report.",
      });
    }

    application.interviewReport = interviewReport.trim();
    application.interviewReportDate = new Date();
    application.interviewReportDecision = decision;
    application.interviewChecks = {
      licenseVerified: Boolean(interviewChecks.licenseVerified),
      surgicalCompetence: Boolean(interviewChecks.surgicalCompetence),
      animalHandlingReadiness: Boolean(interviewChecks.animalHandlingReadiness),
      shelterAgreement: Boolean(interviewChecks.shelterAgreement),
    };

    let vetStaff = null;

    if (decision === "Approved") {
      application.status = "Approved";
      application.assignedShelterId = shelter._id;
      application.assignedShelterName = shelter.shelterName;

      const vetEmail = application.email.toLowerCase().trim();
      const applicantEmail = (application.applicantEmail || "")
        .toLowerCase()
        .trim();
      const applicantPhone = String(application.phone || "").trim();
      const tempPassword = generateTemporaryPassword();
      const passwordToSet = tempPassword;

      // Check if user account already exists with this veterinary email
      let vetUser = await User.findOne({ email: vetEmail });

      if (!vetUser) {
        // Create new user account for Veterinary Staff
        vetUser = await User.create({
          fullName: application.fullName.trim(),
          email: vetEmail,
          phoneNumber: applicantPhone,
          password: passwordToSet,
          role: "Veterinary Staff",
          isEmailVerified: true,
          isPhoneVerified: true,
          status: "Active",
        });
      } else {
        // Update existing user with Veterinary Staff role and password
        vetUser.fullName = application.fullName.trim();
        vetUser.role = "Veterinary Staff";
        if (applicantPhone) vetUser.phoneNumber = applicantPhone;
        if (passwordToSet) vetUser.password = passwordToSet; // pre-save will hash
        vetUser.isEmailVerified = true;
        vetUser.isPhoneVerified = true;
        vetUser.status = "Active";
        await vetUser.save();
      }

      // Best-effort Firebase Auth sync
      try {
        const admin = require("firebase-admin");
        if (admin.apps && admin.apps.length > 0) {
          const auth = admin.auth();
          try {
            const fbUser = await auth.getUserByEmail(vetEmail);
            if (fbUser && passwordToSet) {
              await auth.updateUser(fbUser.uid, { password: passwordToSet });
            }
          } catch (fbErr) {
            if (fbErr.code === "auth/user-not-found" && passwordToSet) {
              await auth.createUser({
                email: vetEmail,
                password: passwordToSet,
                displayName: application.fullName.trim(),
              });
            }
          }
        }
      } catch (syncErr) {
        // Firebase sync fallback is handled seamlessly by MongoDB password check
      }

      // Find or create VetStaff record
      vetStaff = await VetStaff.findOne({
        $or: [
          { userId: vetUser._id, shelterId: shelter._id },
          { email: vetEmail, shelterId: shelter._id },
        ],
      });

      if (!vetStaff) {
        vetStaff = new VetStaff({
          shelterId: shelter._id,
          userId: vetUser._id,
          vetStaffApplicationId: application.vetStaffApplicationId,
          fullName: application.fullName,
          email: vetEmail,
          phone: applicantPhone,
          address: application.address,
          pincode: application.pincode,
          state: application.state,
          district: application.district,
          city: application.city,
          location: application.location,
          councilRegistrationNumber: application.councilRegistrationNumber,
          qualification: application.qualification,
          specialization: application.specialization,
          position: application.position,
          experience: application.experienceYears,
          joiningDate: new Date(),
          status: "Active",
          availability: "Available",
        });
        await vetStaff.save();
      } else {
        vetStaff.userId = vetUser._id;
        vetStaff.email = vetEmail;
        vetStaff.phone = applicantPhone;
        vetStaff.status = "Active";
        await vetStaff.save();
      }

      const originalApplicantId = application.userId;
      application.vetStaffId = vetStaff.vetStaffId;
      application.vetStaffNumber = vetStaff.vetStaffNumber;
      application.userId = vetUser._id;
      await application.save();

      // Send congratulations notification to vetUser
      await Notification.create({
        userId: vetUser._id,
        title: "🎉 Congratulations! Appointed as Veterinary Staff",
        message: `Your clinical evaluation report was approved! You are officially assigned to ${shelter.shelterName} as ${application.position} [${vetStaff.vetStaffId}]. You now have full access to the Veterinary Dashboard.`,
        type: "Veterinary",
        priority: "Emergency",
        metadata: {
          vetStaffId: vetStaff.vetStaffId,
          shelterName: shelter.shelterName,
          shelterId: shelter._id,
        },
      });

      // If original applicant user is different, notify them too
      if (
        originalApplicantId &&
        String(originalApplicantId) !== String(vetUser._id)
      ) {
        await Notification.create({
          userId: originalApplicantId,
          title: "🎉 Veterinary Application Approved!",
          message: `Your veterinary application for ${application.fullName} has been approved at ${shelter.shelterName}! A Veterinary Staff account (${vetEmail}) is activated.`,
          type: "Veterinary",
          priority: "High",
          metadata: {
            vetStaffId: vetStaff.vetStaffId,
            shelterName: shelter.shelterName,
            shelterId: shelter._id,
          },
        }).catch(() => null);
      }

      // Send approval appointment email with login credentials
      try {
        await sendVetStaffApprovalEmail(vetEmail, {
          staffName: application.fullName,
          vetStaffId: vetStaff.vetStaffId,
          vetStaffNumber: vetStaff.vetStaffNumber,
          position: application.position,
          shelterName: shelter.shelterName,
          councilNumber: application.councilRegistrationNumber,
          loginEmail: vetEmail,
          hasCustomPassword: false,
          tempPassword,
          loginUrl: `${process.env.CLIENT_URL || "http://localhost:5173"}/login`,
        });
        if (applicantEmail && applicantEmail !== vetEmail) {
          await sendVetStaffApprovalEmail(applicantEmail, {
            staffName: application.fullName,
            vetStaffId: vetStaff.vetStaffId,
            vetStaffNumber: vetStaff.vetStaffNumber,
            position: application.position,
            shelterName: shelter.shelterName,
            councilNumber: application.councilRegistrationNumber,
            loginEmail: vetEmail,
            hasCustomPassword: false,
            tempPassword: "Sent to the official veterinary email address",
            loginUrl: `${process.env.CLIENT_URL || "http://localhost:5173"}/login`,
          });
        }
      } catch (emailErr) {
        console.warn(
          "Failed to send vet staff approval email:",
          emailErr.message,
        );
      }

      return res.status(200).json({
        success: true,
        message: `Veterinary staff application approved. ${application.fullName} is now assigned to ${shelter.shelterName}.`,
        application,
        vetStaff,
      });
    } else {
      // Rejected
      application.status = "Rejected";
      application.rejectionReason =
        rejectionReason ||
        "Candidate did not fulfill clinical competency or verification criteria during shelter interview.";
      await application.save();

      // Notify applicant
      await Notification.create({
        userId: application.userId,
        title: "Veterinary Application Decision",
        message: `Following your clinical interview at ${shelter.shelterName}, your application was not approved at this time: ${application.rejectionReason}`,
        type: "Veterinary",
        priority: "Medium",
        metadata: {
          applicationId: application._id,
          shelterName: shelter.shelterName,
        },
      });

      // Send rejection email to both the official and original applicant addresses.
      if (application.email) {
        const rejectionEmail = {
          applicantName: application.fullName,
          shelterName: shelter.shelterName,
          applicationId: application.vetStaffApplicationId,
          reason: application.rejectionReason,
        };
        Promise.allSettled([
          sendVetStaffRejectedEmail(application.email, rejectionEmail),
          application.applicantEmail &&
            sendVetStaffRejectedEmail(
              application.applicantEmail,
              rejectionEmail,
            ),
        ]).catch((err) =>
          console.warn(
            "Failed to send vet staff rejection email:",
            err.message,
          ),
        );
      }

      return res.status(200).json({
        success: true,
        message: "Interview report recorded: application rejected.",
        application,
      });
    }
  } catch (error) {
    console.error("Submit Vet Interview Report Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get assigned shelter and staff credentials for authenticated Veterinary Staff
 * @route   GET /api/veterinary/my-assignment
 * @access  Private (Veterinary Staff)
 */
const getMyVetAssignment = async (req, res) => {
  try {
    const userEmail = req.user.email ? req.user.email.toLowerCase().trim() : "";
    const vetStaff = await VetStaff.findOne({
      $or: [
        { userId: req.user._id },
        ...(userEmail ? [{ email: userEmail }] : []),
      ],
      status: "Active",
    }).populate("shelterId");

    if (!vetStaff) {
      return res.status(404).json({
        success: false,
        message: "No active veterinary staff assignment found for this user.",
      });
    }

    res.status(200).json({
      success: true,
      vetStaff,
      shelter: vetStaff.shelterId,
    });
  } catch (error) {
    console.error("Get My Vet Assignment Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get active veterinary staff members assigned to the shelter
 * @route   GET /api/veterinary/shelter-staff
 * @access  Private (Shelter Manager)
 */
const getShelterVetStaff = async (req, res) => {
  try {
    const shelter = await resolveUserShelter(req.user);
    if (!shelter) {
      return res.status(404).json({
        success: false,
        message: "No registered shelter found associated with this account.",
      });
    }

    const staffMembers = await VetStaff.find({
      shelterId: shelter._id,
      status: "Active",
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      shelter: {
        _id: shelter._id,
        shelterName: shelter.shelterName,
      },
      staffMembers,
    });
  } catch (error) {
    console.error("Get Shelter Vet Staff Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Toggle canManageMedicineStock permission for a vet staff member
 * @route   PUT /api/veterinary/shelter-staff/:id/medicine-permission
 * @access  Private (Shelter Manager)
 */
const toggleMedicineStockPermission = async (req, res) => {
  try {
    const shelter = await resolveUserShelter(req.user);
    if (!shelter) {
      return res.status(404).json({
        success: false,
        message: "No registered shelter found associated with this account.",
      });
    }

    const staffMember = await VetStaff.findOne({
      _id: req.params.id,
      shelterId: shelter._id,
      status: "Active",
    });

    if (!staffMember) {
      return res.status(404).json({
        success: false,
        message: "Vet staff member not found or not assigned to your shelter.",
      });
    }

    staffMember.canManageMedicineStock = !staffMember.canManageMedicineStock;
    await staffMember.save();

    res.status(200).json({
      success: true,
      message: staffMember.canManageMedicineStock
        ? `${staffMember.fullName} has been granted medicine stock management access.`
        : `Medicine stock management access has been revoked for ${staffMember.fullName}.`,
      vetStaff: staffMember,
    });
  } catch (error) {
    console.error("Toggle Medicine Stock Permission Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get shelter animals for veterinary clinical visits & medical records
 * @route   GET /api/veterinary/animals
 * @access  Private (Veterinary Staff or Shelter)
 */
const getAssignedShelterAnimals = async (req, res) => {
  try {
    let shelterId = null;

    // Check if user is vet staff
    const vetAssignment = await resolveVetStaffShelter(req.user);
    if (vetAssignment && vetAssignment.shelter) {
      shelterId = vetAssignment.shelter._id;
    } else {
      // Check if user is shelter manager
      const shelter = await resolveUserShelter(req.user);
      if (shelter) {
        shelterId = shelter._id;
      }
    }

    if (!shelterId) {
      return res.status(404).json({
        success: false,
        message: "No shelter found associated with your account.",
      });
    }

    const animals = await Animal.find({
      shelterId,
      isDeleted: { $ne: true },
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      animals,
    });
  } catch (error) {
    console.error("Get Assigned Shelter Animals Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Log a veterinary examination report / surgical procedure for an animal
 * @route   POST /api/veterinary/records
 * @access  Private (Veterinary Staff)
 */
const createClinicalRecord = async (req, res) => {
  try {
    const {
      animalId,
      type = "Diagnosis",
      report = "",
      vitals = {},
      isSurgery = false,
      surgeryDetails = {},
      nextVisitDate = null,
      status = "Ongoing",
    } = req.body;

    if (!animalId) {
      return res.status(400).json({
        success: false,
        message: "Please provide animal identifier.",
      });
    }

    if (!report.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please enter clinical visit report findings / notes.",
      });
    }

    // Resolve vet staff assignment
    const vetAssignment = await resolveVetStaffShelter(req.user);
    const vetStaff = vetAssignment ? vetAssignment.vetStaff : null;
    const shelter = vetAssignment ? vetAssignment.shelter : null;

    // Find the target animal
    const animalQuery = mongoose.Types.ObjectId.isValid(animalId)
      ? { _id: animalId }
      : { animalId };

    const animal = await Animal.findOne(animalQuery);
    if (!animal) {
      return res.status(404).json({
        success: false,
        message: "Animal not found in registry.",
      });
    }

    const effectiveShelterId = shelter ? shelter._id : animal.shelterId;

    const record = await MedicalRecord.create({
      animalId: animal.animalId || String(animal._id),
      animalObjectId: animal._id,
      animalName: animal.name || "Rescued Animal",
      species: animal.species || "Dog",
      shelterId: effectiveShelterId,
      vetUserId: req.user._id,
      vetName: vetStaff
        ? vetStaff.fullName
        : req.user.fullName || "Veterinary Doctor",
      type,
      report: report.trim(),
      reportDate: new Date(),
      vitals: {
        temperature: vitals.temperature || "",
        weight: vitals.weight || animal.weight || "",
        pulse: vitals.pulse || "",
        mucosalColor: vitals.mucosalColor || "",
      },
      isSurgery: Boolean(isSurgery || type === "Surgery"),
      surgeryDetails: {
        procedureName:
          surgeryDetails.procedureName ||
          (type === "Surgery" ? report.slice(0, 50) : ""),
        anesthesia: surgeryDetails.anesthesia || "",
        surgeon:
          surgeryDetails.surgeon ||
          (vetStaff ? vetStaff.fullName : req.user.fullName),
        postOpCare: surgeryDetails.postOpCare || "",
      },
      nextVisitDate: nextVisitDate ? new Date(nextVisitDate) : null,
      status,
    });

    // Update animal weight if entered
    if (vitals.weight) {
      animal.weight = vitals.weight;
      await animal.save();
    }

    res.status(201).json({
      success: true,
      message: "Clinical visit report logged successfully",
      record,
    });
  } catch (error) {
    console.error("Create Clinical Record Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get clinical examination and surgical records for shelter animals
 * @route   GET /api/veterinary/records
 * @access  Private (Veterinary Staff or Shelter)
 */
const getClinicalRecords = async (req, res) => {
  try {
    let shelterId = null;

    const vetAssignment = await resolveVetStaffShelter(req.user);
    if (vetAssignment && vetAssignment.shelter) {
      shelterId = vetAssignment.shelter._id;
    } else {
      const shelter = await resolveUserShelter(req.user);
      if (shelter) shelterId = shelter._id;
    }

    const filter = { isDeleted: { $ne: true } };
    if (shelterId) {
      filter.shelterId = shelterId;
    }

    if (req.query.animalId) {
      const animalParam = String(req.query.animalId).trim();
      const orConditions = [{ animalId: animalParam }];
      if (mongoose.Types.ObjectId.isValid(animalParam)) {
        orConditions.push({ animalObjectId: animalParam });
      }

      const targetAnimal = await Animal.findOne(
        mongoose.Types.ObjectId.isValid(animalParam)
          ? { $or: [{ _id: animalParam }, { animalId: animalParam }] }
          : { animalId: animalParam },
      );

      if (targetAnimal) {
        if (targetAnimal.animalId && targetAnimal.animalId !== animalParam) {
          orConditions.push({ animalId: targetAnimal.animalId });
        }
        if (targetAnimal._id && String(targetAnimal._id) !== animalParam) {
          orConditions.push({ animalObjectId: targetAnimal._id });
        }
      }
      filter.$or = orConditions;
    }

    const records = await MedicalRecord.find(filter).sort({ reportDate: -1 });

    res.status(200).json({
      success: true,
      records,
    });
  } catch (error) {
    console.error("Get Clinical Records Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Log vaccination administration for an animal
 * @route   POST /api/veterinary/vaccinations
 * @access  Private (Veterinary Staff)
 */
const createVaccinationRecord = async (req, res) => {
  try {
    const {
      animalId,
      vaccineName,
      dateGiven = new Date(),
      nextDueDate = null,
      batchNumber = "",
      remarks = "",
    } = req.body;

    if (!animalId || !vaccineName) {
      return res.status(400).json({
        success: false,
        message: "Please provide animal identifier and vaccine name.",
      });
    }

    const animalQuery = mongoose.Types.ObjectId.isValid(animalId)
      ? { _id: animalId }
      : { animalId };

    const animal = await Animal.findOne(animalQuery);
    if (!animal) {
      return res.status(404).json({
        success: false,
        message: "Animal not found in registry.",
      });
    }

    const vetAssignment = await resolveVetStaffShelter(req.user);
    const vetStaff = vetAssignment ? vetAssignment.vetStaff : null;
    const shelter = vetAssignment ? vetAssignment.shelter : null;

    const effectiveShelterId = shelter ? shelter._id : animal.shelterId;

    const vaccination = await Vaccination.create({
      animalId: animal.animalId || String(animal._id),
      animalObjectId: animal._id,
      animalName: animal.name || "Rescued Animal",
      species: animal.species || "Dog",
      shelterId: effectiveShelterId,
      vaccineName: vaccineName.trim(),
      dateGiven: new Date(dateGiven),
      nextDueDate: nextDueDate ? new Date(nextDueDate) : null,
      administeredBy: vetStaff
        ? vetStaff.fullName
        : req.user.fullName || "Veterinarian",
      batchNumber: batchNumber.trim(),
      remarks: remarks.trim(),
    });

    // Update animal's vaccinations list
    const vacDateFormatted = new Date(dateGiven).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    animal.vaccinations.push({
      name: vaccineName.trim(),
      date: vacDateFormatted,
      status: "Completed",
    });
    animal.vaccinationDate = vacDateFormatted;
    await animal.save();

    res.status(201).json({
      success: true,
      message: "Vaccination record logged successfully",
      vaccination,
    });
  } catch (error) {
    console.error("Create Vaccination Record Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get vaccination history for shelter animals
 * @route   GET /api/veterinary/vaccinations
 * @access  Private (Veterinary Staff or Shelter)
 */
const getVaccinationRecords = async (req, res) => {
  try {
    let shelterId = null;

    const vetAssignment = await resolveVetStaffShelter(req.user);
    if (vetAssignment && vetAssignment.shelter) {
      shelterId = vetAssignment.shelter._id;
    } else {
      const shelter = await resolveUserShelter(req.user);
      if (shelter) shelterId = shelter._id;
    }

    const filter = {};
    if (shelterId) {
      filter.shelterId = shelterId;
    }

    if (req.query.animalId) {
      const animalParam = String(req.query.animalId).trim();
      const orConditions = [{ animalId: animalParam }];
      if (mongoose.Types.ObjectId.isValid(animalParam)) {
        orConditions.push({ animalObjectId: animalParam });
      }

      const targetAnimal = await Animal.findOne(
        mongoose.Types.ObjectId.isValid(animalParam)
          ? { $or: [{ _id: animalParam }, { animalId: animalParam }] }
          : { animalId: animalParam },
      );

      if (targetAnimal) {
        if (targetAnimal.animalId && targetAnimal.animalId !== animalParam) {
          orConditions.push({ animalId: targetAnimal.animalId });
        }
        if (targetAnimal._id && String(targetAnimal._id) !== animalParam) {
          orConditions.push({ animalObjectId: targetAnimal._id });
        }
      }
      filter.$or = orConditions;
    }

    const vaccinations = await Vaccination.find(filter).sort({ dateGiven: -1 });

    res.status(200).json({
      success: true,
      vaccinations,
    });
  } catch (error) {
    console.error("Get Vaccination Records Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Send vaccination or clinical reminder directly to shelter for a specific animal
 * @route   POST /api/veterinary/reminders/send
 * @access  Private (Veterinary Staff)
 */
const sendShelterAnimalReminder = async (req, res) => {
  try {
    const {
      animalId,
      reminderType = "Vaccination Due",
      dueDate = new Date(),
      notes = "",
      vaccinationId = null,
    } = req.body;

    if (!animalId) {
      return res.status(400).json({
        success: false,
        message: "Please provide animal identifier for reminder.",
      });
    }

    const animalQuery = mongoose.Types.ObjectId.isValid(animalId)
      ? { _id: animalId }
      : { animalId };

    const animal = await Animal.findOne(animalQuery);
    if (!animal) {
      return res.status(404).json({
        success: false,
        message: "Animal not found.",
      });
    }

    // Resolve shelter
    let shelter = null;
    if (animal.shelterId) {
      shelter = await Shelter.findById(animal.shelterId);
    }
    if (!shelter) {
      const vetAssignment = await resolveVetStaffShelter(req.user);
      if (vetAssignment) shelter = vetAssignment.shelter;
    }

    if (!shelter) {
      return res.status(404).json({
        success: false,
        message: "Shelter responsible for this animal could not be identified.",
      });
    }

    const vetName = req.user.fullName || "Attending Veterinarian";

    // Create MedicalReminder document
    const reminder = await MedicalReminder.create({
      shelterId: shelter._id,
      animalId: animal.animalId || String(animal._id),
      animalObjectId: animal._id,
      animalName: animal.name || "Shelter Dog",
      reminderType,
      dueDate: new Date(dueDate),
      notes: notes.trim(),
      sentByVetName: vetName,
      shelterNotified: true,
      status: "Sent",
    });

    // Send in-app notification to shelter user
    if (shelter.userId) {
      const dueFormatted = new Date(dueDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

      await Notification.create({
        userId: shelter.userId,
        title: `⚠️ Healthcare Alert: ${animal.name} - ${reminderType}`,
        message: `Attending vet ${vetName} has scheduled a ${reminderType} for ${animal.name} (${animal.species}) due on ${dueFormatted}. ${notes ? `Note: ${notes}` : ""}`,
        type: "Vaccination",
        priority: "High",
        metadata: {
          animalId: animal.animalId || animal._id,
          animalName: animal.name,
          reminderType,
          dueDate,
          reminderId: reminder._id,
        },
      });
    }

    // Send Email to shelter
    if (shelter.shelterEmail) {
      try {
        await sendShelterAnimalMedicalReminderEmail(shelter.shelterEmail, {
          shelterName: shelter.shelterName,
          animalName: animal.name,
          animalId: animal.animalId || "ANM-0001",
          species: animal.species || "Dog",
          reminderType,
          dueDate,
          notes,
          vetName,
        });
      } catch (emailErr) {
        console.warn(
          "Failed to send reminder email to shelter:",
          emailErr.message,
        );
      }
    }

    // If a specific vaccinationId was linked, mark it
    if (vaccinationId) {
      await Vaccination.findOneAndUpdate(
        { $or: [{ _id: vaccinationId }, { vaccinationId }] },
        { reminderSent: true, lastReminderDate: new Date() },
      );
    }

    res.status(200).json({
      success: true,
      message: `Medical reminder for ${animal.name} successfully dispatched to ${shelter.shelterName}.`,
      reminder,
    });
  } catch (error) {
    console.error("Send Shelter Animal Reminder Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Helper: resolve vet staff with medicine permission ───────────────────────
const resolveVetStaffWithMedicinePermission = async (user) => {
  const userEmail = user.email ? user.email.toLowerCase().trim() : "";
  const vetStaff = await VetStaff.findOne({
    $or: [{ userId: user._id }, ...(userEmail ? [{ email: userEmail }] : [])],
    status: "Active",
    canManageMedicineStock: true,
  });
  if (!vetStaff) return null;
  const shelter = await Shelter.findById(vetStaff.shelterId);
  return { vetStaff, shelter };
};

/**
 * @desc    Get all medicine stock items for the vet's assigned shelter
 * @route   GET /api/veterinary/medicine-stock
 * @access  Private (Vet Staff with medicine permission)
 */
const getMedicineStock = async (req, res) => {
  try {
    const resolved = await resolveVetStaffWithMedicinePermission(req.user);
    if (!resolved) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to manage medicine stock.",
      });
    }

    const { shelter } = resolved;
    const items = await MedicineStock.find({
      shelterId: shelter._id,
      isDeleted: { $ne: true },
    }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, items });
  } catch (error) {
    console.error("Get Medicine Stock Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Add a new medicine stock item
 * @route   POST /api/veterinary/medicine-stock
 * @access  Private (Vet Staff with medicine permission)
 */
const addMedicineStock = async (req, res) => {
  try {
    const resolved = await resolveVetStaffWithMedicinePermission(req.user);
    if (!resolved) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to manage medicine stock.",
      });
    }

    const { vetStaff, shelter } = resolved;
    const {
      medicineName,
      category = "Other",
      unit = "Tablet",
      quantity,
      lowStockThreshold = 10,
      expiryDate,
      batchNumber = "",
      supplier = "",
      notes = "",
    } = req.body;

    if (!medicineName || quantity === undefined || quantity === null) {
      return res.status(400).json({
        success: false,
        message: "Medicine name and quantity are required.",
      });
    }

    if (Number(quantity) < 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity cannot be negative.",
      });
    }

    const item = await MedicineStock.create({
      shelterId: shelter._id,
      addedByVetStaffId: vetStaff._id,
      addedByName: vetStaff.fullName,
      medicineName: medicineName.trim(),
      category,
      unit,
      quantity: Number(quantity),
      lowStockThreshold: Number(lowStockThreshold) || 10,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      batchNumber: batchNumber.trim(),
      supplier: supplier.trim(),
      notes: notes.trim(),
    });

    res.status(201).json({
      success: true,
      message: `${item.medicineName} added to medicine stock.`,
      item,
    });
  } catch (error) {
    console.error("Add Medicine Stock Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Update an existing medicine stock item (full update or quantity adjustment)
 * @route   PUT /api/veterinary/medicine-stock/:id
 * @access  Private (Vet Staff with medicine permission)
 */
const updateMedicineStock = async (req, res) => {
  try {
    const resolved = await resolveVetStaffWithMedicinePermission(req.user);
    if (!resolved) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to manage medicine stock.",
      });
    }

    const { shelter, vetStaff } = resolved;
    const item = await MedicineStock.findOne({
      _id: req.params.id,
      shelterId: shelter._id,
      isDeleted: { $ne: true },
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Medicine stock item not found.",
      });
    }

    const {
      medicineName,
      category,
      unit,
      quantity,
      adjustBy, // optional: +/- delta instead of absolute quantity
      lowStockThreshold,
      expiryDate,
      batchNumber,
      supplier,
      notes,
    } = req.body;

    if (medicineName !== undefined) item.medicineName = medicineName.trim();
    if (category !== undefined) item.category = category;
    if (unit !== undefined) item.unit = unit;
    if (lowStockThreshold !== undefined)
      item.lowStockThreshold = Number(lowStockThreshold);
    if (expiryDate !== undefined)
      item.expiryDate = expiryDate ? new Date(expiryDate) : null;
    if (batchNumber !== undefined) item.batchNumber = batchNumber.trim();
    if (supplier !== undefined) item.supplier = supplier.trim();
    if (notes !== undefined) item.notes = notes.trim();

    // Support both absolute quantity and relative adjustment
    if (adjustBy !== undefined) {
      const delta = Number(adjustBy);
      const newQty = item.quantity + delta;
      if (newQty < 0) {
        return res.status(400).json({
          success: false,
          message: `Cannot reduce stock below zero. Current stock: ${item.quantity}.`,
        });
      }
      item.quantity = newQty;
    } else if (quantity !== undefined) {
      if (Number(quantity) < 0) {
        return res
          .status(400)
          .json({ success: false, message: "Quantity cannot be negative." });
      }
      item.quantity = Number(quantity);
    }

    item.addedByVetStaffId = vetStaff._id;
    item.addedByName = vetStaff.fullName;
    await item.save();

    res.status(200).json({
      success: true,
      message: `${item.medicineName} updated successfully.`,
      item,
    });
  } catch (error) {
    console.error("Update Medicine Stock Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Soft-delete a medicine stock item
 * @route   DELETE /api/veterinary/medicine-stock/:id
 * @access  Private (Vet Staff with medicine permission)
 */
const deleteMedicineStock = async (req, res) => {
  try {
    const resolved = await resolveVetStaffWithMedicinePermission(req.user);
    if (!resolved) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to manage medicine stock.",
      });
    }

    const { shelter } = resolved;
    const item = await MedicineStock.findOne({
      _id: req.params.id,
      shelterId: shelter._id,
      isDeleted: { $ne: true },
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Medicine stock item not found.",
      });
    }

    item.isDeleted = true;
    await item.save();

    res.status(200).json({
      success: true,
      message: `${item.medicineName} removed from stock.`,
    });
  } catch (error) {
    console.error("Delete Medicine Stock Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  submitVetStaffApplication,
  checkVetStaffEmail,
  getMyVetStaffApplication,
  getShelterVetApplications,
  scheduleVetInterview,
  submitVetInterviewReport,
  getMyVetAssignment,
  getShelterVetStaff,
  toggleMedicineStockPermission,
  getAssignedShelterAnimals,
  createClinicalRecord,
  getClinicalRecords,
  createVaccinationRecord,
  getVaccinationRecords,
  sendShelterAnimalReminder,
  getMedicineStock,
  addMedicineStock,
  updateMedicineStock,
  deleteMedicineStock,
};
