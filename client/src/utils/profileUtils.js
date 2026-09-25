/**
 * Utility helpers to evaluate and monitor Public User profile completion status.
 */

export const checkProfileCompletion = (user) => {
  if (!user) {
    return {
      isComplete: false,
      percentage: 0,
      completedCount: 0,
      totalCount: 8,
      missingFields: [
        'Full Name',
        'Phone Number',
        'State',
        'District',
        'City / Locality',
        'PIN Code',
        'Residential Address',
        'Date of Birth',
      ],
      checklist: [],
    };
  }

  const rawPhone = (user.phoneNumber || '').replace(/\D/g, '');
  const isPhoneValid =
    rawPhone.length === 10 &&
    user.phoneNumber !== 'Not provided' &&
    /^[6-9]\d{9}$/.test(rawPhone);

  const hasName = Boolean(user.fullName && user.fullName.trim().length >= 2);
  const hasState = Boolean(user.state && user.state.trim().length > 0);
  const hasDistrict = Boolean(user.district && user.district.trim().length > 0);
  const hasCity = Boolean(user.city && user.city.trim().length > 0);
  const hasPincode = Boolean(
    user.pincode && /^\d{6}$/.test(String(user.pincode).trim())
  );
  const hasAddress = Boolean(user.address && user.address.trim().length >= 3);
  const hasDob = Boolean(user.dob);

  const checklist = [
    {
      key: 'fullName',
      label: 'Full Name',
      isComplete: hasName,
      description: 'Your registered legal full name',
    },
    {
      key: 'phoneNumber',
      label: 'Phone Number',
      isComplete: isPhoneValid,
      description: 'Valid 10-digit mobile number for rescue coordination',
    },
    {
      key: 'dob',
      label: 'Date of Birth',
      isComplete: hasDob,
      description: 'Birth date for identity and age verification',
    },
    {
      key: 'state',
      label: 'State',
      isComplete: hasState,
      description: 'State of residence (e.g. Kerala)',
    },
    {
      key: 'district',
      label: 'District',
      isComplete: hasDistrict,
      description: 'District for nearby rescue assignment',
    },
    {
      key: 'city',
      label: 'City / Locality',
      isComplete: hasCity,
      description: 'Town or city name',
    },
    {
      key: 'pincode',
      label: 'PIN Code',
      isComplete: hasPincode,
      description: '6-digit postal code',
    },
    {
      key: 'address',
      label: 'Residential Address',
      isComplete: hasAddress,
      description: 'Street or house address',
    },
  ];

  const totalCount = checklist.length;
  const completedCount = checklist.filter((item) => item.isComplete).length;
  const percentage = Math.round((completedCount / totalCount) * 100);
  const missingFields = checklist
    .filter((item) => !item.isComplete)
    .map((item) => item.label);
  const isComplete = missingFields.length === 0;

  return {
    isComplete,
    percentage,
    completedCount,
    totalCount,
    missingFields,
    checklist,
  };
};

export const ACTION_TABS = [
  'Report Animal',
  'Adopt a Pet',
  'Register Shelter',
  'Register Rescue Team',
  'Volunteer',
  'Join Vet Staff',
];

export const isActionTab = (tabName) => {
  return ACTION_TABS.includes(tabName);
};
