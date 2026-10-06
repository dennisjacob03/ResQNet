const mongoose = require('mongoose');
const AdoptionApplication = require('./adoptionApplicationModel');
const Animal = require('../animals/animalModel');
const User = require('../users/userModel');
const Notification = require('../notifications/notificationModel');
const {
  sendAdoptionStatusEmail,
  sendAdoptionApplicationSubmittedEmail,
  sendAdoptionVisitScheduledEmail,
} = require('../../utils/emailService');
const {
  validateAdoptionApplication,
  validateUpdateStatus,
  validateSubmitVisitReport,
} = require('./adoptionValidation');

/**
 * @desc    Submit a new adoption application
 * @route   POST /api/adoptions
 * @access  Private (Authenticated User)
 */
const createAdoptionApplication = async (req, res) => {
  try {
    // 1. Validate incoming payload with Zod
    const validation = validateAdoptionApplication(req.body);
    if (!validation.success) {
      const formattedErrors = validation.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return res.status(400).json({
        success: false,
        message: formattedErrors[0]?.message || 'Validation failed',
        errors: formattedErrors,
      });
    }

    const {
      pet_id,
      housing_type,
      ownership_status,
      landlord_details,
      agreements,
      notes,
    } = validation.data;

    const applicant_id = req.user._id;

    // 2. Verify selected pet exists
    const pet = await Animal.findById(pet_id);
    if (!pet || pet.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'The selected pet was not found in our registry',
      });
    }

    if (pet.status === 'Adopted') {
      return res.status(400).json({
        success: false,
        message: 'This pet has already been adopted into a forever home',
      });
    }

    // 3. Check for existing active application by this user for the same pet
    const existingActiveApp = await AdoptionApplication.findOne({
      pet_id,
      applicant_id,
      application_status: { $in: ['Pending', 'Under Review'] },
      isDeleted: false,
    });

    if (existingActiveApp) {
      return res.status(400).json({
        success: false,
        message: `You already have an active application (${existingActiveApp.adoptionId}) for this pet`,
        adoptionId: existingActiveApp.adoptionId,
      });
    }

    // 4. Determine shelter_id from the animal document
    const shelter_id = pet.shelterId || null;

    // 5. Construct new application
    const newApplication = new AdoptionApplication({
      pet_id,
      applicant_id,
      shelter_id,
      housing_type,
      ownership_status,
      landlord_details:
        ownership_status === 'Rent'
          ? {
              name: landlord_details?.name?.trim() || '',
              phone: landlord_details?.phone?.trim() || '',
            }
          : { name: '', phone: '' },
      agreements: {
        return_policy: agreements.return_policy,
      },
      submitted_at: new Date(),
      application_status: 'Pending',
      notes: notes?.trim() || '',
    });

    const savedApplication = await newApplication.save();

    // Populate references for clean response
    const populated = await AdoptionApplication.findById(savedApplication._id)
      .populate('pet_id', 'name animalId species breed approxAge gender photo facePhoto shelterName status')
      .populate('applicant_id', 'fullName email phoneNumber address city state');

    // 6. Create in-app notification for the applicant
    try {
      await Notification.create({
        userId: applicant_id,
        title: 'Adoption Application Received',
        message: `Your adoption application for ${pet.name || 'pet'} (${savedApplication.adoptionId}) has been successfully submitted and is under review.`,
        type: 'Adoption',
        priority: 'Medium',
        status: 'Unread',
        metadata: {
          adoptionId: savedApplication.adoptionId,
          petId: pet._id,
          petName: pet.name,
        },
      });
    } catch (notifErr) {
      console.warn('Failed to dispatch in-app notification:', notifErr.message);
    }

    // 7. Send adoption application submission email
    const applicantEmail = populated?.applicant_id?.email || req.user?.email;
    if (applicantEmail) {
      sendAdoptionApplicationSubmittedEmail(applicantEmail, {
        applicantName: populated?.applicant_id?.fullName || req.user?.fullName,
        petName: pet.name || 'Pet',
        species: pet.species || 'Animal',
        breed: pet.breed || '',
        shelterName: pet.shelterName || 'ResQNet Shelter',
        adoptionId: savedApplication.adoptionId,
        submittedAt: savedApplication.submitted_at,
      }).catch((mailErr) => console.warn('Failed to send adoption submission email:', mailErr.message));
    }

    return res.status(201).json({
      success: true,
      message: 'Adoption application submitted successfully',
      application: populated,
    });
  } catch (error) {
    console.error('createAdoptionApplication error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to submit adoption application',
    });
  }
};

/**
 * @desc    Get all adoption applications submitted by the logged-in user
 * @route   GET /api/adoptions/my
 * @access  Private
 */
const getMyApplications = async (req, res) => {
  try {
    const applications = await AdoptionApplication.find({
      applicant_id: req.user._id,
      isDeleted: false,
    })
      .sort({ submitted_at: -1 })
      .populate('pet_id', 'name animalId species breed approxAge gender photo facePhoto shelterName status')
      .populate('applicant_id', 'fullName email phoneNumber address city state');

    return res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    console.error('getMyApplications error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch your adoption applications',
    });
  }
};

/**
 * @desc    Check if current user already submitted an application for a specific pet
 * @route   GET /api/adoptions/check/:petId
 * @access  Private
 */
const checkPetApplication = async (req, res) => {
  try {
    const { petId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(petId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid pet ID format',
      });
    }

    const application = await AdoptionApplication.findOne({
      pet_id: petId,
      applicant_id: req.user._id,
      isDeleted: false,
    }).sort({ submitted_at: -1 });

    return res.status(200).json({
      success: true,
      hasApplied: !!application,
      isActive:
        application &&
        ['Pending', 'Under Review', 'Shelter Visit'].includes(application.application_status),
      application,
    });
  } catch (error) {
    console.error('checkPetApplication error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to verify application status',
    });
  }
};

/**
 * @desc    Get applications for a shelter (or all for Admin)
 * @route   GET /api/adoptions/shelter
 * @access  Private (Shelter, Admin)
 */
const getShelterApplications = async (req, res) => {
  try {
    const { status, search } = req.query;
    const filter = { isDeleted: false };

    // If role is Shelter, restrict to applications for this shelter
    if (req.user.role === 'Shelter') {
      const Shelter = require('../shelters/shelterModel');
      const shelterDoc = await Shelter.findOne({ userId: req.user._id });
      const shelterIds = [req.user._id];
      if (shelterDoc) shelterIds.push(shelterDoc._id);
      if (req.user.shelterId) shelterIds.push(req.user.shelterId);

      filter.$or = [
        { shelter_id: { $in: shelterIds } },
        { 'pet_id.userId': req.user._id },
      ];
    }

    if (status && status !== 'All') {
      filter.application_status = status;
    }

    let applications = await AdoptionApplication.find(filter)
      .sort({ submitted_at: -1 })
      .populate('pet_id', 'name animalId species breed approxAge gender photo facePhoto shelterName status')
      .populate('applicant_id', 'fullName email phoneNumber address city state profilePicture');

    // Filter by search term if provided
    if (search && search.trim()) {
      const term = search.toLowerCase().trim();
      applications = applications.filter((app) => {
        const applicantName = app.applicant_id?.fullName?.toLowerCase() || '';
        const applicantPhone = app.applicant_id?.phoneNumber || '';
        const petName = app.pet_id?.name?.toLowerCase() || '';
        const adoptionId = app.adoptionId?.toLowerCase() || '';
        return (
          applicantName.includes(term) ||
          applicantPhone.includes(term) ||
          petName.includes(term) ||
          adoptionId.includes(term)
        );
      });
    }

    return res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    console.error('getShelterApplications error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch shelter adoption applications',
    });
  }
};

/**
 * @desc    Get a single application by ID
 * @route   GET /api/adoptions/:id
 * @access  Private
 */
const getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;

    const query = mongoose.Types.ObjectId.isValid(id)
      ? { _id: id }
      : { adoptionId: id };

    const application = await AdoptionApplication.findOne({
      ...query,
      isDeleted: false,
    })
      .populate('pet_id')
      .populate('applicant_id', 'fullName email phoneNumber address city state profilePicture');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Adoption application not found',
      });
    }

    // Permission check: only applicant, shelter, or admin can view
    const isApplicant =
      req.user._id.toString() === application.applicant_id?._id?.toString();
    const isPrivileged = ['Shelter', 'Admin'].includes(req.user.role);

    if (!isApplicant && !isPrivileged) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this application',
      });
    }

    return res.status(200).json({
      success: true,
      application,
    });
  } catch (error) {
    console.error('getApplicationById error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch application details',
    });
  }
};

/**
 * @desc    Update application status (Under Review, Approved, Rejected)
 * @route   PUT /api/adoptions/:id/status
 * @access  Private (Shelter, Admin)
 */
const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const validation = validateUpdateStatus(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: validation.error.issues[0]?.message || 'Invalid status data',
      });
    }

    const { application_status, remarks } = validation.data;

    const application = await AdoptionApplication.findById(id)
      .populate('pet_id')
      .populate('applicant_id');

    if (!application || application.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Adoption application not found',
      });
    }

    // Require an in-person shelter visit before approval
    if (application_status === 'Approved') {
      const hasVisit =
        application.appointment &&
        ['Scheduled', 'Completed'].includes(application.appointment.status);

      if (!hasVisit) {
        return res.status(400).json({
          success: false,
          message:
            'Cannot approve adoption: An in-person shelter visit must be scheduled and completed before final approval.',
        });
      }
    }

    application.application_status = application_status;
    if (remarks !== undefined) application.remarks = remarks.trim();
    await application.save();

    // If approved, complete appointment and update animal status
    if (application_status === 'Approved') {
      if (application.appointment && application.appointment.status === 'Scheduled') {
        application.appointment.status = 'Completed';
      }
      if (application.pet_id) {
        await Animal.findByIdAndUpdate(application.pet_id._id, {
          status: 'Adopted',
        });
      }
    } else if (application_status === 'Under Review' && application.pet_id) {
      await Animal.findByIdAndUpdate(application.pet_id._id, {
        status: 'Adoption Pending',
      });
    }

    // Send email notification to applicant
    if (application.applicant_id?.email) {
      try {
        await sendAdoptionStatusEmail(
          {
            email: application.applicant_id.email,
            fullName: application.applicant_id.fullName,
          },
          {
            petName: application.pet_id?.name || 'Pet',
            status: application_status,
            remarks: application.remarks,
          }
        );
      } catch (mailErr) {
        console.warn('Failed to send adoption status email:', mailErr.message);
      }
    }

    // Send in-app notification
    try {
      await Notification.create({
        userId: application.applicant_id._id,
        title: `Adoption Application ${application_status}`,
        message: `Your adoption application for ${application.pet_id?.name || 'the pet'} has been updated to "${application_status}".`,
        type: 'Adoption',
        priority: application_status === 'Approved' ? 'High' : 'Medium',
        status: 'Unread',
        metadata: {
          adoptionId: application.adoptionId,
          applicationId: application._id,
          status: application_status,
        },
      });
    } catch (notifErr) {
      console.warn('Failed to send in-app notification:', notifErr.message);
    }

    return res.status(200).json({
      success: true,
      message: `Application marked as ${application_status}`,
      application,
    });
  } catch (error) {
    console.error('updateApplicationStatus error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update application status',
    });
  }
};

/**
 * @desc    Withdraw application by applicant
 * @route   PUT /api/adoptions/:id/withdraw
 * @access  Private (Applicant only)
 */
const withdrawApplication = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await AdoptionApplication.findById(id);
    if (!application || application.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Adoption application not found',
      });
    }

    if (application.applicant_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only withdraw your own applications',
      });
    }

    if (['Approved', 'Rejected'].includes(application.application_status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot withdraw an application that has already been ${application.application_status.toLowerCase()}`,
      });
    }

    application.application_status = 'Withdrawn';
    await application.save();

    return res.status(200).json({
      success: true,
      message: 'Application withdrawn successfully',
      application,
    });
  } catch (error) {
    console.error('withdrawApplication error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to withdraw application',
    });
  }
};

/**
 * @desc    Schedule shelter visit appointment for adoption applicant
 * @route   PUT /api/adoptions/:id/appointment
 * @access  Private (Shelter, Admin)
 */
const scheduleAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, time, location, notes } = req.body;

    if (!date || !time) {
      return res.status(400).json({
        success: false,
        message: 'Appointment date and time are required',
      });
    }

    const application = await AdoptionApplication.findById(id)
      .populate('pet_id')
      .populate('applicant_id');

    if (!application || application.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Adoption application not found',
      });
    }

    application.appointment = {
      date: new Date(date),
      time: time.trim(),
      location: location?.trim() || application.pet_id?.shelterName || 'Shelter Premises',
      notes: notes?.trim() || '',
      status: 'Scheduled',
      scheduledAt: new Date(),
    };

    // Transition status to 'Shelter Visit' (matching admin's 'Site Visit' status)
    application.application_status = 'Shelter Visit';

    await application.save();

    // In-app notification to applicant
    try {
      await Notification.create({
        userId: application.applicant_id._id,
        title: 'Shelter Visit Appointment Scheduled',
        message: `Your visit for adopting ${application.pet_id?.name || 'the pet'} is scheduled for ${new Date(date).toLocaleDateString()} at ${time}. Location: ${application.appointment.location}.`,
        type: 'Adoption',
        priority: 'High',
        status: 'Unread',
        metadata: {
          adoptionId: application.adoptionId,
          applicationId: application._id,
          appointmentDate: date,
          appointmentTime: time,
        },
      });
    } catch (notifErr) {
      console.warn('Failed to send appointment in-app notification:', notifErr.message);
    }

    // Send email notification to applicant
    if (application.applicant_id?.email) {
      sendAdoptionVisitScheduledEmail(application.applicant_id.email, {
        applicantName: application.applicant_id.fullName || 'Applicant',
        petName: application.pet_id?.name || 'Pet',
        appointmentDate: date,
        appointmentTime: time,
        location: application.appointment.location,
        notes: notes?.trim() || '',
        adoptionId: application.adoptionId,
      }).catch((mailErr) => console.warn('Failed to send adoption visit email:', mailErr.message));
    }

    return res.status(200).json({
      success: true,
      message: 'Shelter visit appointment scheduled successfully',
      application,
    });
  } catch (error) {
    console.error('scheduleAppointment error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to schedule visit appointment',
    });
  }
};

/**
 * @desc    Submit shelter visit inspection report & decide (Pass & Approve / Fail & Reject)
 * @route   POST /api/adoptions/:id/visit-report
 * @access  Private (Shelter, Admin)
 */
const submitVisitReport = async (req, res) => {
  try {
    const { id } = req.params;

    const validation = validateSubmitVisitReport(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: validation.error.issues[0]?.message || 'Invalid visit report data',
      });
    }

    const { reportText, decision, checks } = validation.data;

    const application = await AdoptionApplication.findById(id)
      .populate('pet_id')
      .populate('applicant_id');

    if (!application || application.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Adoption application not found',
      });
    }

    // Require that an in-person shelter visit appointment was scheduled
    const hasAppointment =
      application.appointment &&
      ['Scheduled', 'Completed'].includes(application.appointment.status);

    if (!hasAppointment) {
      return res.status(400).json({
        success: false,
        message:
          'Cannot submit report: An in-person shelter visit must be scheduled before submitting an inspection report.',
      });
    }

    // Record visit report subdocument
    application.visitReport = {
      reportText: reportText.trim(),
      decision,
      checks: checks || {},
      submittedAt: new Date(),
      submittedBy: req.user._id,
    };

    // Complete the appointment
    if (application.appointment) {
      application.appointment.status = 'Completed';
    }

    if (decision === 'Approved') {
      application.application_status = 'Approved';
      application.remarks = reportText.trim();

      // Update animal status to Adopted
      if (application.pet_id) {
        await Animal.findByIdAndUpdate(application.pet_id._id, {
          status: 'Adopted',
        });
      }
    } else {
      // Decision is 'Rejected'
      application.application_status = 'Rejected';
      application.remarks = reportText.trim();

      // Ensure pet remains Available
      if (application.pet_id) {
        await Animal.findByIdAndUpdate(application.pet_id._id, {
          status: 'Available',
        });
      }
    }

    await application.save();

    // Send email notification to applicant
    if (application.applicant_id?.email) {
      try {
        await sendAdoptionStatusEmail(
          {
            email: application.applicant_id.email,
            fullName: application.applicant_id.fullName,
          },
          {
            petName: application.pet_id?.name || 'Pet',
            status: application.application_status,
            remarks: application.remarks,
          }
        );
      } catch (mailErr) {
        console.warn('Failed to send adoption status email:', mailErr.message);
      }
    }

    // Send in-app notification
    try {
      const isApprove = decision === 'Approved';
      await Notification.create({
        userId: application.applicant_id._id,
        title: isApprove
          ? 'Adoption Approved! 🐾'
          : 'Adoption Application Status Update',
        message: isApprove
          ? `Congratulations! Your shelter visit evaluation for ${
              application.pet_id?.name || 'the companion'
            } was successful and the adoption has been APPROVED.`
          : `Your adoption application for ${
              application.pet_id?.name || 'the companion'
            } was reviewed following the shelter visit. Status: Declined.`,
        type: 'Adoption',
        priority: isApprove ? 'High' : 'Medium',
        status: 'Unread',
        metadata: {
          adoptionId: application.adoptionId,
          applicationId: application._id,
          status: application.application_status,
          decision,
        },
      });
    } catch (notifErr) {
      console.warn('Failed to send in-app notification:', notifErr.message);
    }

    return res.status(200).json({
      success: true,
      message: `Shelter visit report submitted successfully. Application is now ${application.application_status}.`,
      application,
    });
  } catch (error) {
    console.error('submitVisitReport error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to submit shelter visit report',
    });
  }
};

module.exports = {
  createAdoptionApplication,
  getMyApplications,
  checkPetApplication,
  getShelterApplications,
  getApplicationById,
  updateApplicationStatus,
  scheduleAppointment,
  submitVisitReport,
  withdrawApplication,
};
