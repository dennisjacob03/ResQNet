/**
 * Comprehensive Unit Test Suite for Shelter Registration Validation
 * Tests all 5 registration types, email, phone, lat/long, staff, cages, and capacity limits.
 */

const {
  shelterRegistrationZodSchema,
  validateShelterRegistration,
  SHELTER_REGISTRATION_RULES,
} = require('./shelterValidation');

// Valid baseline payload
const getBasePayload = (overrides = {}) => ({
  shelterName: 'Paws & Care Animal Shelter',
  registrationType: 'STATE_TRUST_SOCIETY',
  registrationNumber: 'REG/KL/2024/001234',
  shelterEmail: 'contact@pawscare.org',
  shelterPhoneNumber: '9876543210',
  latitude: 9.931233,
  longitude: 76.267303,
  totalStaffs: 8,
  totalCages: 50,
  occupiedCages: 20,
  ...overrides,
});

// Helper to run Zod validation directly
const validatePayload = (payload) => {
  const normalized = {
    ...payload,
    registrationNumber:
      typeof payload.registrationNumber === 'string'
        ? payload.registrationNumber.trim().toUpperCase()
        : payload.registrationNumber,
  };
  return shelterRegistrationZodSchema.safeParse(normalized);
};

// Helper to mock Express middleware call
const runMiddleware = (body) => {
  let statusCode = 200;
  let jsonResponse = null;
  let nextCalled = false;

  const req = { body: { ...body } };
  const res = {
    status: (code) => {
      statusCode = code;
      return {
        json: (data) => {
          jsonResponse = data;
        },
      };
    },
  };
  const next = () => {
    nextCalled = true;
  };

  validateShelterRegistration(req, res, next);

  return { statusCode, jsonResponse, nextCalled, modifiedBody: req.body };
};

// Test Runner
const runAllTests = () => {
  let passedCount = 0;
  let totalCount = 0;
  const failures = [];

  const assertTest = (name, condition, errorInfo = '') => {
    totalCount++;
    if (condition) {
      passedCount++;
      console.log(`  ✓ PASS: ${name}`);
    } else {
      failures.push({ name, errorInfo });
      console.error(`  ✗ FAIL: ${name} ${errorInfo ? `- ${errorInfo}` : ''}`);
    }
  };

  console.log('====================================================');
  console.log('Running Full Shelter Registration Zod Validation Tests');
  console.log('====================================================\n');

  // --- SECTION 1: Baseline Valid Application ---
  console.log('--- 1. Baseline Valid Payload ---');
  const baseRes = validatePayload(getBasePayload());
  const baseMw = runMiddleware(getBasePayload());
  assertTest('Baseline valid application succeeds', baseRes.success && baseMw.nextCalled && baseMw.statusCode === 200);

  // --- SECTION 2: Registration Types & Formats ---
  console.log('\n--- 2. Registration Authority Types ---');

  // 1. NGO_DARPAN
  const darpanValid = ['KL/2026/0123456', 'DL/2020/0012345', 'MH/2019/7654321'];
  darpanValid.forEach((num) => {
    const res = validatePayload(getBasePayload({ registrationType: 'NGO_DARPAN', registrationNumber: num }));
    assertTest(`Valid NGO_DARPAN (${num})`, res.success);
  });
  const darpanInvalid = ['KL/26/0123456', '12/2026/0123456', 'KL/2026/012345', 'KL-2026-0123456'];
  darpanInvalid.forEach((num) => {
    const res = validatePayload(getBasePayload({ registrationType: 'NGO_DARPAN', registrationNumber: num }));
    const errorMsg = res.error?.issues[0]?.message;
    assertTest(`Invalid NGO_DARPAN rejected (${num})`, !res.success && errorMsg === SHELTER_REGISTRATION_RULES.NGO_DARPAN.error);
  });

  // 2. MCA_CIN
  const cinValid = ['U85300MH2026NPL399124', 'U85300KL2020NPL012345'];
  cinValid.forEach((num) => {
    const res = validatePayload(getBasePayload({ registrationType: 'MCA_CIN', registrationNumber: num }));
    assertTest(`Valid MCA_CIN (${num})`, res.success);
  });
  const cinInvalid = ['U85300MH2026PTC399124', 'L85300MH2026NPL399124', 'U8530MH2026NPL399124', 'U85300MH2026NPL39912'];
  cinInvalid.forEach((num) => {
    const res = validatePayload(getBasePayload({ registrationType: 'MCA_CIN', registrationNumber: num }));
    const errorMsg = res.error?.issues[0]?.message;
    assertTest(`Invalid MCA_CIN rejected (${num})`, !res.success && errorMsg === SHELTER_REGISTRATION_RULES.MCA_CIN.error);
  });

  // 3. NGO_PAN
  const panValid = ['AAATB4112G', 'CHEAF8853F', 'XYZTB9999Z'];
  panValid.forEach((num) => {
    const res = validatePayload(getBasePayload({ registrationType: 'NGO_PAN', registrationNumber: num }));
    assertTest(`Valid NGO_PAN (${num})`, res.success);
  });
  const panInvalid = ['AABCP4112G', 'CHEPC8853F', '123TB4112G', 'AABCT4112'];
  panInvalid.forEach((num) => {
    const res = validatePayload(getBasePayload({ registrationType: 'NGO_PAN', registrationNumber: num }));
    const errorMsg = res.error?.issues[0]?.message;
    assertTest(`Invalid NGO_PAN rejected (${num})`, !res.success && errorMsg === SHELTER_REGISTRATION_RULES.NGO_PAN.error);
  });

  // 4. AWBI_ID
  const awbiValid = ['DL/043/2021-AWO', 'KL/123/2024-AWO', 'MH/1/2020-AWO'];
  awbiValid.forEach((num) => {
    const res = validatePayload(getBasePayload({ registrationType: 'AWBI_ID', registrationNumber: num }));
    assertTest(`Valid AWBI_ID (${num})`, res.success);
  });
  const awbiInvalid = ['DL/04345/2021-AWO', 'DL/043/21-AWO', 'DL/043/2021-NGO', '12/043/2021-AWO'];
  awbiInvalid.forEach((num) => {
    const res = validatePayload(getBasePayload({ registrationType: 'AWBI_ID', registrationNumber: num }));
    const errorMsg = res.error?.issues[0]?.message;
    assertTest(`Invalid AWBI_ID rejected (${num})`, !res.success && errorMsg === SHELTER_REGISTRATION_RULES.AWBI_ID.error);
  });

  // 5. STATE_TRUST_SOCIETY
  const stateValid = ['MUM/4509/2018/GBBSD', 'S-E/1234/Distt. South/2019', 'REG/KL/2024/001234', '12345'];
  stateValid.forEach((num) => {
    const res = validatePayload(getBasePayload({ registrationType: 'STATE_TRUST_SOCIETY', registrationNumber: num }));
    assertTest(`Valid STATE_TRUST_SOCIETY (${num})`, res.success);
  });
  const stateInvalid = ['A1', 'ABCD', 'A'.repeat(41), 'REG#123*&^%'];
  stateInvalid.forEach((num) => {
    const res = validatePayload(getBasePayload({ registrationType: 'STATE_TRUST_SOCIETY', registrationNumber: num }));
    const errorMsg = res.error?.issues[0]?.message;
    assertTest(`Invalid STATE_TRUST_SOCIETY rejected (${num})`, !res.success && errorMsg === SHELTER_REGISTRATION_RULES.STATE_TRUST_SOCIETY.error);
  });

  // --- SECTION 3: Name & Space-only validation ---
  console.log('\n--- 3. Shelter Name Validation ---');
  const emptyName = validatePayload(getBasePayload({ shelterName: '' }));
  assertTest('Empty shelterName rejected', !emptyName.success);
  const spacesOnlyName = validatePayload(getBasePayload({ shelterName: '     ' }));
  assertTest('Spaces-only shelterName rejected', !spacesOnlyName.success);

  // --- SECTION 4: Email Validation ---
  console.log('\n--- 4. Email Validation ---');
  const invalidEmail = validatePayload(getBasePayload({ shelterEmail: 'invalid-email-address' }));
  assertTest('Invalid email rejected', !invalidEmail.success);
  const validEmail = validatePayload(getBasePayload({ shelterEmail: 'shelter.kerala@ngo.org' }));
  assertTest('Valid email accepted', validEmail.success);

  // --- SECTION 5: Contact Number (10-Digit Indian) ---
  console.log('\n--- 5. Contact Number Validation ---');
  const validPhones = ['9876543210', '8123456789', '7012345678', '6234567890'];
  validPhones.forEach((phone) => {
    const res = validatePayload(getBasePayload({ shelterPhoneNumber: phone }));
    assertTest(`Valid 10-digit Indian phone (${phone})`, res.success);
  });
  const invalidPhones = ['5123456789', '98765', '987654321012', '98765abcd0', 'abcdefghij'];
  invalidPhones.forEach((phone) => {
    const res = validatePayload(getBasePayload({ shelterPhoneNumber: phone }));
    assertTest(`Invalid phone rejected (${phone})`, !res.success);
  });

  // --- SECTION 6: Latitude & Longitude ---
  console.log('\n--- 6. Coordinates Validation ---');
  const validCoords = validatePayload(getBasePayload({ latitude: 9.9312, longitude: 76.2673 }));
  assertTest('Valid latitude & longitude accepted', validCoords.success);
  const invalidLat = validatePayload(getBasePayload({ latitude: 120.5 })); // > 90
  assertTest('Out of range latitude (>90) rejected', !invalidLat.success);
  const invalidLong = validatePayload(getBasePayload({ longitude: -195.0 })); // < -180
  assertTest('Out of range longitude (<-180) rejected', !invalidLong.success);
  const textLat = validatePayload(getBasePayload({ latitude: 'not-a-number' }));
  assertTest('Non-numeric latitude rejected', !textLat.success);

  // --- SECTION 7: Total Staff (> 0, No Negative or Zero) ---
  console.log('\n--- 7. Total Staff Validation ---');
  const zeroStaff = validatePayload(getBasePayload({ totalStaffs: 0 }));
  assertTest('Zero totalStaffs rejected', !zeroStaff.success);
  const negStaff = validatePayload(getBasePayload({ totalStaffs: -3 }));
  assertTest('Negative totalStaffs rejected', !negStaff.success);
  const validStaff = validatePayload(getBasePayload({ totalStaffs: 5 }));
  assertTest('Positive totalStaffs (5) accepted', validStaff.success);

  // --- SECTION 8: Total Cages (> 0, No Negative or Zero) ---
  console.log('\n--- 8. Total Cages Validation ---');
  const zeroCages = validatePayload(getBasePayload({ totalCages: 0 }));
  assertTest('Zero totalCages rejected', !zeroCages.success);
  const negCages = validatePayload(getBasePayload({ totalCages: -10 }));
  assertTest('Negative totalCages rejected', !negCages.success);
  const validCages = validatePayload(getBasePayload({ totalCages: 25 }));
  assertTest('Positive totalCages (25) accepted', validCages.success);

  // --- SECTION 9: Occupied Cages (>= 0 and <= Total Cages) ---
  console.log('\n--- 9. Occupied Cages & Capacity Limit Validation ---');
  const zeroOccupied = validatePayload(getBasePayload({ totalCages: 20, occupiedCages: 0 }));
  assertTest('Zero occupiedCages accepted (0 is allowed)', zeroOccupied.success);
  const negOccupied = validatePayload(getBasePayload({ totalCages: 20, occupiedCages: -2 }));
  assertTest('Negative occupiedCages rejected', !negOccupied.success);
  const equalOccupied = validatePayload(getBasePayload({ totalCages: 20, occupiedCages: 20 }));
  assertTest('Equal occupiedCages (20/20) accepted', equalOccupied.success);
  const overOccupied = validatePayload(getBasePayload({ totalCages: 20, occupiedCages: 25 }));
  assertTest('Occupied cages exceeding total cages (25 > 20) rejected', !overOccupied.success);

  // Summary
  console.log('\n====================================================');
  console.log(`Test Results: ${passedCount}/${totalCount} tests passed.`);
  console.log('====================================================');

  if (failures.length > 0) {
    console.error(`\n${failures.length} test(s) failed!`);
    process.exit(1);
  } else {
    console.log('\nAll comprehensive unit tests passed successfully!\n');
  }
};

// Run if executed directly
if (require.main === module) {
  runAllTests();
}

module.exports = { runAllTests };
