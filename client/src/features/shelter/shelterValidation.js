import { z } from 'zod';

export const REGISTRATION_TYPES = [
  'NGO_DARPAN',
  'MCA_CIN',
  'NGO_PAN',
  'AWBI_ID',
  'STATE_TRUST_SOCIETY',
];

export const SHELTER_REGISTRATION_RULES = {
  NGO_DARPAN: {
    label: 'NGO Darpan (NITI Aayog)',
    regex: /^[A-Z]{2}\/\d{4}\/\d{7}$/,
    error: 'Invalid NGO Darpan ID. Expected format: XX/YYYY/ZZZZZZZ',
    example: 'KL/2026/0123456',
    hint: '2-letter state code / 4-digit year / 7-digit system number',
  },
  MCA_CIN: {
    label: 'MCA Corporate Identification Number (CIN)',
    regex: /^U\d{5}[A-Z]{2}\d{4}NPL\d{6}$/,
    error: "Invalid Corporate Identification Number. Section 8 Companies must contain 'NPL'.",
    example: 'U85300MH2026NPL399124',
    hint: 'Must start with U, contain state code, year, NPL, and 6 digits',
  },
  NGO_PAN: {
    label: 'NGO Trust / Society PAN',
    regex: /^[A-Z]{3}[TA][A-Z]\d{4}[A-Z]$/,
    error: "Invalid NGO PAN. The 4th character must be 'T' (Trust) or 'A' (Association).",
    example: 'AAATB4112G or CHEAF8853F',
    hint: '10 alphanumeric characters with 4th letter T (Trust) or A (Association)',
  },
  AWBI_ID: {
    label: 'Animal Welfare Board of India (AWBI)',
    regex: /^[A-Z]{2}\/\d{1,4}\/\d{4}-AWO$/,
    error: 'Invalid AWBI ID. Expected format: StateCode/Number/Year-AWO',
    example: 'DL/043/2021-AWO',
    hint: 'State code / 1-4 digit file no / 4-digit year - AWO',
  },
  STATE_TRUST_SOCIETY: {
    label: 'State Trust / Local Society Registration',
    regex: /^[A-Z0-9\/\-\.\s]{5,40}$/i,
    error: 'Invalid character or length for local registration number.',
    example: 'MUM/4509/2018/GBBSD or REG/KL/2024/001234',
    hint: 'Between 5 to 40 alphanumeric characters with slashes/hyphens',
  },
};

export const clientShelterZodSchema = z
  .object({
    shelterName: z
      .string()
      .trim()
      .min(1, 'Shelter name is required')
      .min(2, 'Shelter name must be at least 2 characters long')
      .max(120, 'Shelter name cannot exceed 120 characters')
      .refine((val) => val.trim().length > 0, {
        message: 'Shelter name cannot consist of whitespace only',
      }),

    registrationType: z.enum(REGISTRATION_TYPES, {
      errorMap: () => ({
        message: 'Please select a valid registration type',
      }),
    }),

    registrationNumber: z
      .string()
      .trim()
      .min(1, 'Registration number is required')
      .refine((val) => val.trim().length > 0, {
        message: 'Registration number cannot consist of whitespace only',
      }),

    shelterEmail: z
      .string()
      .trim()
      .min(1, 'Shelter email is required')
      .email('Please enter a valid email address (e.g. shelter@domain.com)'),

    shelterPhoneNumber: z
      .string()
      .trim()
      .min(1, 'Contact number is required')
      .refine((val) => /^[6-9]\d{9}$/.test(val.replace(/\D/g, '')), {
        message: 'Contact number must be a valid 10-digit Indian phone number (starting with 6, 7, 8, or 9)',
      }),

    latitude: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === 'string' ? parseFloat(val) : val))
      .refine((val) => !isNaN(val), {
        message: 'Latitude must be a valid number or decimal',
      })
      .refine((val) => val >= -90 && val <= 90, {
        message: 'Latitude must be between -90 and 90 degrees',
      }),

    longitude: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === 'string' ? parseFloat(val) : val))
      .refine((val) => !isNaN(val), {
        message: 'Longitude must be a valid number or decimal',
      })
      .refine((val) => val >= -180 && val <= 180, {
        message: 'Longitude must be between -180 and 180 degrees',
      }),

    totalStaffs: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === 'string' ? Number(val) : val))
      .refine((val) => !isNaN(val) && Number.isInteger(val) && val > 0, {
        message: 'Total staff must be a positive whole number greater than 0',
      }),

    totalCages: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === 'string' ? Number(val) : val))
      .refine((val) => !isNaN(val) && Number.isInteger(val) && val > 0, {
        message: 'Total cages must be a positive whole number greater than 0',
      }),

    occupiedCages: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === 'string' ? Number(val) : val))
      .refine((val) => !isNaN(val) && Number.isInteger(val) && val >= 0, {
        message: 'Occupied cages must be 0 or a positive whole number (no negative numbers)',
      }),
  })
  .superRefine((data, ctx) => {
    // 1. Conditional registrationNumber check
    const formattedNumber = data.registrationNumber ? data.registrationNumber.trim().toUpperCase() : '';
    const rule = SHELTER_REGISTRATION_RULES[data.registrationType];

    if (rule && !rule.regex.test(formattedNumber)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: rule.error,
        path: ['registrationNumber'],
      });
    }

    // 2. Capacity constraint: occupiedCages cannot exceed totalCages
    if (
      typeof data.occupiedCages === 'number' &&
      typeof data.totalCages === 'number' &&
      !isNaN(data.occupiedCages) &&
      !isNaN(data.totalCages) &&
      data.occupiedCages > data.totalCages
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Occupied cages (${data.occupiedCages}) cannot exceed total cages capacity (${data.totalCages})`,
        path: ['occupiedCages'],
      });
    }
  });

/**
 * Validates a single field live against the Zod schema
 */
export const validateShelterField = (fieldName, value, fullFormData = {}) => {
  const dataToValidate = {
    ...fullFormData,
    [fieldName]: value,
  };

  const result = clientShelterZodSchema.safeParse(dataToValidate);

  if (result.success) {
    return { valid: true, error: '' };
  }

  const fieldIssue = result.error.issues.find((issue) => issue.path[0] === fieldName);
  return {
    valid: !fieldIssue,
    error: fieldIssue ? fieldIssue.message : '',
  };
};

/**
 * Validates full form and returns a map of field errors
 */
export const validateFullShelterForm = (formData) => {
  const result = clientShelterZodSchema.safeParse(formData);
  if (result.success) {
    return { valid: true, errors: {}, data: result.data };
  }

  const errors = {};
  result.error.issues.forEach((issue) => {
    const fieldName = issue.path[0];
    if (!errors[fieldName]) {
      errors[fieldName] = issue.message;
    }
  });

  return { valid: false, errors, data: null };
};
