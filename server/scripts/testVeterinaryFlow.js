const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const jwt = require('jsonwebtoken');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = require('../config/db');
const User = require('../modules/users/userModel');
const Shelter = require('../modules/shelters/shelterModel');
const Animal = require('../modules/animals/animalModel');
const VetStaffApplication = require('../modules/shelters/vetStaffApplicationModel');
const VetStaff = require('../modules/shelters/vetStaffModel');
const MedicalRecord = require('../modules/medicals/medicalRecordModel');
const Vaccination = require('../modules/medicals/vaccinationModel');
const MedicalReminder = require('../modules/medicals/medicalReminderModel');
const Notification = require('../modules/notifications/notificationModel');

const veterinaryController = require('../modules/medicals/veterinaryController');

const runTest = async () => {
  console.log('--- 🧪 STARTING VETERINARY WORKFLOW AUTOMATED TEST ---');
  await connectDB();

  try {
    // 1. Setup / Find an existing Shelter and its manager
    let shelter = await Shelter.findOne({ isDeleted: { $ne: true } }).populate('userId');
    let shelterUser = shelter?.userId;

    if (!shelter) {
      shelterUser = await User.create({
        fullName: 'Test Shelter Manager',
        email: `shelter.mgr.${Date.now()}@test.com`,
        phoneNumber: '9876500001',
        role: 'Shelter',
        city: 'Kochi',
      });

      shelter = await Shelter.create({
        shelterName: 'St. Francis Veterinary Shelter',
        shelterEmail: shelterUser.email,
        shelterPhoneNumber: 9876500001,
        shelterId: `SH-${Date.now().toString().slice(-4)}`,
        userId: shelterUser._id,
        latitude: 9.9312,
        longitude: 76.2673,
        totalStaffs: 4,
        totalCages: 15,
        occupiedCages: 5,
        shelterStatus: 'OPEN',
      });
    } else if (!shelterUser) {
      shelterUser = await User.findOne({ role: { $in: ['Shelter', 'Admin'] } });
      if (!shelterUser) {
        shelterUser = await User.create({
          fullName: 'Test Shelter Manager',
          email: shelter.shelterEmail || `shelter.mgr.${Date.now()}@test.com`,
          phoneNumber: '9876500001',
          role: 'Shelter',
          city: 'Kochi',
        });
      }
      shelter.userId = shelterUser._id;
      await shelter.save();
    }

    console.log(`✅ Shelter established: ${shelter.shelterName} (${shelter.shelterNumber})`);

    // 2. Setup a Shelter Animal (Dog)
    let animal = await Animal.findOne({ shelterId: shelter._id });
    if (!animal) {
      animal = await Animal.create({
        name: 'Tommy',
        species: 'Dog',
        breed: 'Indie Hound',
        shelterId: shelter._id,
        shelterName: shelter.shelterName,
        gender: 'Male',
        approxAge: '2 Years',
        currentSize: 'Medium',
        weight: '16 kg',
      });
    }
    console.log(`✅ Shelter animal established: ${animal.name} (${animal.animalId})`);

    // 3. Setup a Public User applying to be Veterinary Staff
    const applicantUser = await User.create({
      fullName: 'Dr. Ananya Sharma',
      email: `dr.ananya.${Date.now()}@resqnet.org`,
      phoneNumber: '9845012345',
      role: 'Public User',
      city: 'Ernakulam',
    });
    console.log(`✅ Applicant user created: ${applicantUser.fullName} (Current Role: ${applicantUser.role})`);

    // 4. Test Step: Submit Veterinary Staff Application (targeting shelter)
    const reqApply = {
      user: applicantUser,
      body: {
        fullName: applicantUser.fullName,
        email: applicantUser.email,
        phone: applicantUser.phoneNumber,
        district: 'Ernakulam',
        city: 'Kochi',
        position: 'Veterinary Doctor',
        councilRegistrationNumber: 'KVC-2023-9988',
        qualification: 'BVSc & AH, MVSc (Surgery)',
        specialization: 'Small Animal Soft-Tissue Surgery',
        experienceYears: 4,
        targetShelterId: shelter._id,
        resume: 'Experienced veterinary surgeon specializing in ABC sterilizations and emergency orthopedic trauma.',
      },
    };

    let appResult = null;
    const resApply = {
      status: (code) => ({
        json: (data) => {
          appResult = data;
          return data;
        },
      }),
    };

    await veterinaryController.submitVetStaffApplication(reqApply, resApply);
    if (!appResult?.success) {
      throw new Error(`Failed to submit vet application: ${JSON.stringify(appResult)}`);
    }
    const application = appResult.application;
    console.log(`✅ Step 1 Passed: Application submitted: ${application.vetStaffApplicationId} (Status: ${application.status})`);

    // 5. Test Step: Shelter queries applications
    let shelterAppsResult = null;
    const resShelterApps = {
      status: (code) => ({
        json: (data) => {
          shelterAppsResult = data;
          return data;
        },
      }),
    };

    await veterinaryController.getShelterVetApplications({ user: shelterUser }, resShelterApps);
    const foundApp = shelterAppsResult?.applications?.find((a) => a._id.toString() === application._id.toString());
    if (!foundApp) {
      throw new Error('Application not found in shelter query list!');
    }
    console.log(`✅ Step 2 Passed: Shelter successfully viewed application in candidate pool`);

    // 6. Test Step: Shelter schedules clinical interview
    const interviewDate = new Date();
    interviewDate.setDate(interviewDate.getDate() + 2);

    let interviewResult = null;
    const resInterview = {
      status: (code) => ({
        json: (data) => {
          interviewResult = data;
          return data;
        },
      }),
    };

    await veterinaryController.scheduleVetInterview(
      {
        user: shelterUser,
        params: { id: application._id },
        body: {
          interviewScheduleDate: interviewDate,
          interviewTimeSlot: '10:00 AM - 12:00 PM (Surgical OT Assessment)',
          interviewLocation: 'St. Francis Shelter - Small Animal Surgical Wing',
          interviewInterviewer: 'Dr. Senior Surgeon & Shelter Director',
          interviewNotes: 'Please bring original VCI registration certificate and scrubs.',
        },
      },
      resInterview
    );

    if (!interviewResult?.success || interviewResult.application.status !== 'Interview Scheduled') {
      throw new Error(`Interview scheduling failed: ${JSON.stringify(interviewResult)}`);
    }
    console.log(`✅ Step 3 Passed: Interview scheduled for ${interviewResult.application.interviewTimeSlot} (Status: ${interviewResult.application.status})`);

    // 7. Test Step: Shelter conducts interview and submits evaluation report with all 4 audit checks
    let reportResult = null;
    const resReport = {
      status: (code) => ({
        json: (data) => {
          reportResult = data;
          return data;
        },
      }),
    };

    await veterinaryController.submitVetInterviewReport(
      {
        user: shelterUser,
        params: { id: application._id },
        body: {
          decision: 'Approved',
          interviewChecks: {
            licenseVerified: true,
            surgicalCompetence: true,
            animalHandlingReadiness: true,
            shelterAgreement: true,
          },
          interviewReport: 'Candidate demonstrated sterile surgical field prep, proficient canine ovariohysterectomy technique, and deep compassion for shelter animals. Unanimously recommended for appointment.',
        },
      },
      resReport
    );

    if (!reportResult?.success || reportResult.application.status !== 'Approved') {
      throw new Error(`Interview report approval failed: ${JSON.stringify(reportResult)}`);
    }

    // Verify VetStaff document was created
    const vetStaff = await VetStaff.findOne({ userId: applicantUser._id });
    if (!vetStaff || vetStaff.status !== 'Active') {
      throw new Error('VetStaff document was not created or active!');
    }

    // Verify User Role was upgraded
    const updatedUser = await User.findById(applicantUser._id);
    if (updatedUser.role !== 'Veterinary Staff') {
      throw new Error(`User role was not upgraded to Veterinary Staff! Current: ${updatedUser.role}`);
    }

    console.log(`✅ Step 4 Passed: Evaluation report approved!`);
    console.log(`   - Staff ID: ${vetStaff.vetStaffId} (${vetStaff.vetStaffNumber})`);
    console.log(`   - Assigned to: ${reportResult.application.assignedShelterName}`);
    console.log(`   - User Role Upgraded: '${updatedUser.role}'`);

    // 8. Test Step: Vet Staff logs clinical examination and surgical record
    let recordResult = null;
    const resRecord = {
      status: (code) => ({
        json: (data) => {
          recordResult = data;
          return data;
        },
      }),
    };

    await veterinaryController.createClinicalRecord(
      {
        user: updatedUser,
        body: {
          animalId: animal._id,
          type: 'Surgery',
          report: 'Elective sterilization (Orchiectomy). Scrotal ablation performed with subcuticular absorbable sutures. Recovery uneventful.',
          vitals: {
            temperature: '101.8',
            weight: '16.5',
            pulse: '85',
            mucosalColor: 'Pink',
          },
          isSurgery: true,
          surgeryDetails: {
            procedureName: 'Canine Castration / Orchiectomy',
            anesthesia: 'Ketamine + Xylazine + Isoflurane',
            surgeon: vetStaff.fullName,
            postOpCare: 'Analgesics for 3 days, wound spray bid, collar worn.',
          },
          nextVisitDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          status: 'Improving',
        },
      },
      resRecord
    );

    if (!recordResult?.success || !recordResult.record) {
      throw new Error(`Failed to create clinical record: ${JSON.stringify(recordResult)}`);
    }
    console.log(`✅ Step 5 Passed: Clinical surgical record logged: ${recordResult.record.medicalRecordId} (Patient: ${recordResult.record.animalName})`);

    // 9. Test Step: Vet Staff logs vaccination record
    let vacResult = null;
    const resVac = {
      status: (code) => ({
        json: (data) => {
          vacResult = data;
          return data;
        },
      }),
    };

    const nextDueDate = new Date();
    nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);

    await veterinaryController.createVaccinationRecord(
      {
        user: updatedUser,
        body: {
          animalId: animal._id,
          vaccineName: 'Anti-Rabies Vaccine (Nobivac Rabies)',
          dateGiven: new Date(),
          nextDueDate,
          batchNumber: 'NR-2026-X91',
          remarks: 'Annual rabies booster administered subcutaneously in right shoulder region.',
        },
      },
      resVac
    );

    if (!vacResult?.success || !vacResult.vaccination) {
      throw new Error(`Failed to create vaccination record: ${JSON.stringify(vacResult)}`);
    }
    console.log(`✅ Step 6 Passed: Vaccination logged: ${vacResult.vaccination.vaccinationId} (${vacResult.vaccination.vaccineName})`);

    // 10. Test Step: Vet Staff sends vaccination reminder directly to shelter
    let reminderResult = null;
    const resReminder = {
      status: (code) => ({
        json: (data) => {
          reminderResult = data;
          return data;
        },
      }),
    };

    await veterinaryController.sendShelterAnimalReminder(
      {
        user: updatedUser,
        body: {
          animalId: animal._id,
          reminderType: 'Vaccination Due',
          dueDate: nextDueDate,
          notes: 'Annual booster due. Ensure patient handler is present.',
          vaccinationId: vacResult.vaccination._id,
        },
      },
      resReminder
    );

    if (!reminderResult?.success || !reminderResult.reminder) {
      throw new Error(`Failed to send shelter reminder: ${JSON.stringify(reminderResult)}`);
    }

    // Verify shelter received notification
    const shelterNotif = await Notification.findOne({
      userId: shelterUser._id,
      type: 'Vaccination',
    }).sort({ createdAt: -1 });

    if (!shelterNotif) {
      throw new Error('Shelter did not receive in-app medical alert notification!');
    }

    console.log(`✅ Step 7 Passed: Healthcare reminder dispatched to shelter:`);
    console.log(`   - Reminder ID: ${reminderResult.reminder.medicineReminderId}`);
    console.log(`   - Shelter Notification: "${shelterNotif.title}" (Priority: ${shelterNotif.priority})`);

    console.log('\n🎉 ALL 7 VETERINARY STEPS COMPLETED AND VERIFIED SUCCESSFULLY!');
  } catch (error) {
    console.error('❌ Test failed with error:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

runTest();
