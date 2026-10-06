const {
  sendWelcomeEmail,
  sendAccountApprovedEmail,
  sendAdoptionApplicationSubmittedEmail,
  sendAdoptionVisitScheduledEmail,
  sendAdoptionStatusEmail,
  sendShelterApplicationSubmittedEmail,
  sendShelterSiteVisitScheduledEmail,
  sendShelterApprovalEmail,
  sendShelterApplicationRejectedEmail,
  sendRescueTeamApplicationSubmittedEmail,
  sendRescueTeamVisitScheduledEmail,
  sendRescueTeamApprovalEmail,
  sendRescueTeamRejectedEmail,
  sendVolunteerApplicationSubmittedEmail,
  sendVolunteerVisitScheduledEmail,
  sendVolunteerApprovalEmail,
  sendVolunteerRejectedEmail,
  sendVetStaffApplicationSubmittedEmail,
  sendVetInterviewScheduledEmail,
  sendVetStaffApprovalEmail,
  sendVetStaffRejectedEmail,
} = require('../utils/emailService');

async function runTests() {
  console.log('🧪 Starting ResQNet Automated Email Notification Tests...\n');
  const results = [];

  const runTest = async (name, fn) => {
    try {
      const res = await fn();
      if (res && res.success) {
        console.log(`✅ [PASS] ${name} (Message ID: ${res.messageId})`);
        results.push({ name, pass: true });
      } else {
        console.error(`❌ [FAIL] ${name}:`, res ? res.error : 'No response');
        results.push({ name, pass: false, error: res?.error });
      }
    } catch (err) {
      console.error(`❌ [ERROR] ${name}:`, err.message);
      results.push({ name, pass: false, error: err.message });
    }
  };

  // 1. Welcome & Account Approval
  await runTest('1. Welcome Email (New User Signup)', () =>
    sendWelcomeEmail({
      email: 'alex.test@example.com',
      fullName: 'Alex Johnson',
      role: 'Public User',
    })
  );

  await runTest('2. Account Approved & Activated Email', () =>
    sendAccountApprovedEmail({
      email: 'alex.test@example.com',
      fullName: 'Alex Johnson',
      role: 'Public User',
    })
  );

  // 2. Adoption Flow
  await runTest('3. Adoption Application Submitted Email', () =>
    sendAdoptionApplicationSubmittedEmail('alex.test@example.com', {
      applicantName: 'Alex Johnson',
      petName: 'Rocky',
      species: 'Dog',
      breed: 'Golden Retriever',
      shelterName: 'Hope Animal Shelter',
      adoptionId: 'ADP-9921',
      submittedAt: new Date(),
    })
  );

  await runTest('4. Adoption Shelter Visit Appointment Scheduled Email', () =>
    sendAdoptionVisitScheduledEmail('alex.test@example.com', {
      applicantName: 'Alex Johnson',
      petName: 'Rocky',
      appointmentDate: new Date(Date.now() + 86400000 * 2),
      appointmentTime: '11:00 AM - 12:00 PM',
      location: 'Hope Animal Shelter Main Kennel',
      notes: 'Please bring photo ID and leash.',
      adoptionId: 'ADP-9921',
    })
  );

  await runTest('5. Adoption Status Update Email (Approved)', () =>
    sendAdoptionStatusEmail(
      { email: 'alex.test@example.com', fullName: 'Alex Johnson' },
      {
        petName: 'Rocky',
        status: 'Approved',
        remarks: 'Shelter visit successful! Ready for pickup.',
      }
    )
  );

  // 3. Shelter Flow
  await runTest('6. Shelter Application Submitted Email', () =>
    sendShelterApplicationSubmittedEmail('shelter.test@example.com', {
      applicantName: 'Sarah Connor',
      shelterName: 'Paws & Care Sanctuary',
      registrationNumber: 'KL/SH/2026/042',
      applicationId: 'SHA-0042',
      shelterPhoneNumber: '9876543210',
      totalCages: 25,
    })
  );

  await runTest('7. Shelter Physical Site Visit Scheduled Email', () =>
    sendShelterSiteVisitScheduledEmail('shelter.test@example.com', {
      shelterName: 'Paws & Care Sanctuary',
      applicationId: 'SHA-0042',
      visitDate: new Date(Date.now() + 86400000 * 3),
      valuationPeriod: '10:00 AM - 01:00 PM',
      inspector: 'Officer David K.',
      notes: 'Prepare sanitation and kennel registry logs.',
    })
  );

  await runTest('8. Shelter Application Approved Email', () =>
    sendShelterApprovalEmail('shelter.test@example.com', {
      shelterName: 'Paws & Care Sanctuary',
      shelterNumber: 'SHN-0042',
      tempPassword: 'Your chosen registration password',
      loginUrl: 'http://localhost:5173/login',
    })
  );

  await runTest('9. Shelter Application Rejected Email', () =>
    sendShelterApplicationRejectedEmail('shelter.test@example.com', {
      shelterName: 'Paws & Care Sanctuary',
      applicationId: 'SHA-0042',
      reason: 'Quarantine area boundary requires safety isolation fencing.',
    })
  );

  // 4. Rescue Team Flow
  await runTest('10. Rescue Team Application Submitted Email', () =>
    sendRescueTeamApplicationSubmittedEmail('rescue.test@example.com', {
      teamLeadName: 'Capt. Marcus',
      rescueTeamName: 'Rapid Response Unit 1',
      vehicleNumber: 'KL-07-CD-1234',
      vehicleType: 'Rescue Van / Ambulance',
      operatingDistrict: 'Ernakulam',
      applicationId: 'RTA-0019',
    })
  );

  await runTest('11. Rescue Team Valuation Visit Scheduled Email', () =>
    sendRescueTeamVisitScheduledEmail('rescue.test@example.com', {
      rescueTeamName: 'Rapid Response Unit 1',
      applicationId: 'RTA-0019',
      visitDate: new Date(Date.now() + 86400000 * 2),
      valuationPeriod: '02:00 PM - 04:00 PM',
      inspector: 'Inspector Roy M.',
      vehicleNumber: 'KL-07-CD-1234',
      notes: 'Inspect emergency lights, siren, and first-aid kits.',
    })
  );

  await runTest('12. Rescue Team Approved Email', () =>
    sendRescueTeamApprovalEmail('rescue.test@example.com', {
      rescueTeamName: 'Rapid Response Unit 1',
      teamId: 'RT-0019',
      rescueTeamNumber: 'RTN019',
      vehicleNumber: 'KL-07-CD-1234',
      vehicleType: 'Ambulance',
      district: 'Ernakulam',
    })
  );

  await runTest('13. Rescue Team Rejected Email', () =>
    sendRescueTeamRejectedEmail('rescue.test@example.com', {
      rescueTeamName: 'Rapid Response Unit 1',
      applicationId: 'RTA-0019',
      reason: 'Vehicle safety harness mechanism failed inspection.',
    })
  );

  // 5. Volunteer Flow
  await runTest('14. Volunteer Application Submitted Email', () =>
    sendVolunteerApplicationSubmittedEmail('volunteer.test@example.com', {
      applicantName: 'Emily Clark',
      district: 'Kochi',
      interests: ['Rescue Assisting', 'Shelter Walking'],
      applicationId: 'VOL-0088',
    })
  );

  await runTest('15. Volunteer Orientation Visit Scheduled Email', () =>
    sendVolunteerVisitScheduledEmail('volunteer.test@example.com', {
      applicantName: 'Emily Clark',
      applicationId: 'VOL-0088',
      visitDate: new Date(Date.now() + 86400000 * 4),
      valuationPeriod: '10:00 AM - 12:00 PM',
      coordinator: 'Priya N.',
      notes: 'Orientation held at Main Center.',
    })
  );

  await runTest('16. Volunteer Approved Email', () =>
    sendVolunteerApprovalEmail('volunteer.test@example.com', {
      volunteerName: 'Emily Clark',
      volunteerId: 'VOL-0088',
      district: 'Kochi',
      interests: ['Rescue Assisting', 'Shelter Walking'],
    })
  );

  await runTest('17. Volunteer Rejected Email', () =>
    sendVolunteerRejectedEmail('volunteer.test@example.com', {
      applicantName: 'Emily Clark',
      applicationId: 'VOL-0088',
      reason: 'Candidate did not attend mandatory orientation.',
    })
  );

  // 6. Veterinary Staff Flow
  await runTest('18. Vet Staff Application Submitted Email', () =>
    sendVetStaffApplicationSubmittedEmail('dr.smith@example.com', {
      applicantName: 'Dr. John Smith',
      position: 'Veterinary Surgeon',
      councilNumber: 'KVC-88712',
      targetShelterName: 'Hope Animal Shelter',
      applicationId: 'VSA-0033',
    })
  );

  await runTest('19. Vet Staff Clinical Interview Scheduled Email', () =>
    sendVetInterviewScheduledEmail('dr.smith@example.com', {
      applicantName: 'Dr. John Smith',
      applicationId: 'VSA-0033',
      shelterName: 'Hope Animal Shelter',
      interviewDate: new Date(Date.now() + 86400000 * 2),
      timeSlot: '02:00 PM - 03:30 PM',
      location: 'Veterinary Surgical Wing',
      interviewer: 'Chief Veterinarian',
      notes: 'Bring surgical certifications and council registration.',
    })
  );

  await runTest('20. Vet Staff Approved Email', () =>
    sendVetStaffApprovalEmail('dr.smith@example.com', {
      staffName: 'Dr. John Smith',
      vetStaffId: 'VS-0033',
      vetStaffNumber: 'VSN033',
      position: 'Veterinary Surgeon',
      shelterName: 'Hope Animal Shelter',
      councilNumber: 'KVC-88712',
      loginEmail: 'dr.smith@example.com',
      hasCustomPassword: true,
      loginUrl: 'http://localhost:5173/login',
    })
  );

  await runTest('21. Vet Staff Rejected Email', () =>
    sendVetStaffRejectedEmail('dr.smith@example.com', {
      applicantName: 'Dr. John Smith',
      shelterName: 'Hope Animal Shelter',
      applicationId: 'VSA-0033',
      reason: 'Candidate lacks small-animal surgical experience criteria.',
    })
  );

  const passedCount = results.filter((r) => r.pass).length;
  console.log(`\n==================================================`);
  console.log(`Summary: ${passedCount} / ${results.length} tests passed!`);
  console.log(`==================================================\n`);

  if (passedCount !== results.length) {
    process.exit(1);
  }
}

runTests();
