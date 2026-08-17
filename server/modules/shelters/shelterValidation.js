const { z } = require('zod');

// Registration Type enum definition
const REGISTRATION_TYPES = [
  'NGO_DARPAN',
  'MCA_CIN',
  'NGO_PAN',
  'AWBI_ID',
  'STATE_TRUST_SOCIETY',
];

// Regex and error message configuration per type
const SHELTER_REGISTRATION_RULES = {
  NGO_DARPAN: {
    regex: /^[A-Z]{2}\/\d{4}\/\d{7}$/,
    error: 'Invalid NGO Darpan ID. Expected format: XX/YYYY/ZZZZZZZ',
    example: 'KL/2026/0123456',
  },
  MCA_CIN: {
    regex: /^U\d{5}[A-Z]{2}\d{4}NPL\d{6}$/,
    error: "Invalid Corporate Identification Number. Section 8 Companies must contain 'NPL'.",
    example: 'U85300MH2026NPL399124',
  },
  NGO_PAN: {
    regex: /^[A-Z]{3}[TA][A-Z]\d{4}[A-Z]$/,
    error: "Invalid NGO PAN. The 4th character must be 'T' (Trust) or 'A' (Association).",
    example: 'AABCT4112G or CHEPA8853F',
  },
  AWBI_ID: {
    regex: /^[A-Z]{2}\/\d{1,4}\/\d{4}-AWO$/,
    error: 'Invalid AWBI ID. Expected format: StateCode/Number/Year-AWO',
    example: 'DL/043/2021-AWO',
  },
  STATE_TRUST_SOCIETY: {
    regex: /^[A-Z0-9\/\-\.\s]{5,40}$/i,
    error: 'Invalid character or length for local registration number.',
    example: 'MUM/4509/2018/GBBSD or REG/KL/2024/001234',
  },
};

// Comprehensive Zod schema for full shelter application payload
const shelterRegistrationZodSchema = z
  .object({
    shelterName: z
      .string({
        required_error: 'Shelter name is required',
        invalid_type_error: 'Shelter name must be a string',
      })
      .trim()
      .min(2, 'Shelter name must be at least 2 characters long')
      .max(120, 'Shelter name cannot exceed 120 characters')
      .refine((val) => val.trim().length > 0, {
        message: 'Shelter name cannot consist of whitespace only',
      }),

    registrationType: z.enum(REGISTRATION_TYPES, {
      errorMap: () => ({
        message:
          "Invalid registration type. Must be one of: 'NGO_DARPAN', 'MCA_CIN', 'NGO_PAN', 'AWBI_ID', 'STATE_TRUST_SOCIETY'",
      }),
    }),

    registrationNumber: z
      .string({
        required_error: 'Registration number is required',
        invalid_type_error: 'Registration number must be a string',
      })
      .trim()
      .min(1, 'Registration number is required')
      .refine((val) => val.trim().length > 0, {
        message: 'Registration number cannot consist of whitespace only',
      }),

    shelterEmail: z
      .string({
        required_error: 'Shelter email is required',
        invalid_type_error: 'Shelter email must be a string',
      })
      .trim()
      .email('Please provide a valid shelter email address (e.g. shelter@example.com)'),

    shelterPhoneNumber: z
      .union([z.string(), z.number()], {
        required_error: 'Contact number is required',
      })
      .transform((val) => String(val).trim())
      .refine((val) => /^[6-9]\d{9}$/.test(val), {
        message:
          'Contact number must be a valid 10-digit Indian phone number (numbers only, starting with 6-9)',
      }),

    latitude: z
      .union([z.string(), z.number()], {
        required_error: 'Latitude is required',
      })
      .transform((val) => (typeof val === 'string' ? parseFloat(val) : val))
      .refine((val) => !isNaN(val), {
        message: 'Latitude must be a valid number or decimal',
      })
      .refine((val) => val >= -90 && val <= 90, {
        message: 'Latitude must be between -90 and 90 degrees',
      }),

    longitude: z
      .union([z.string(), z.number()], {
        required_error: 'Longitude is required',
      })
      .transform((val) => (typeof val === 'string' ? parseFloat(val) : val))
      .refine((val) => !isNaN(val), {
        message: 'Longitude must be a valid number or decimal',
      })
      .refine((val) => val >= -180 && val <= 180, {
        message: 'Longitude must be between -180 and 180 degrees',
      }),

    totalStaffs: z
      .union([z.string(), z.number()], {
        required_error: 'Total staff count is required',
      })
      .transform((val) => (typeof val === 'string' ? Number(val) : val))
      .refine((val) => Number.isInteger(val) && val > 0, {
        message:
          'Total staff must be a whole positive number greater than 0 (no negative or zero allowed)',
      }),

    totalCages: z
      .union([z.string(), z.number()], {
        required_error: 'Total cages count is required',
      })
      .transform((val) => (typeof val === 'string' ? Number(val) : val))
      .refine((val) => Number.isInteger(val) && val > 0, {
        message:
          'Total cages must be a whole positive number greater than 0 (no negative or zero allowed)',
      }),

    occupiedCages: z
      .union([z.string(), z.number()], {
        required_error: 'Occupied cages count is required',
      })
      .transform((val) => (typeof val === 'string' ? Number(val) : val))
      .refine((val) => Number.isInteger(val) && val >= 0, {
        message:
          'Occupied cages must be a whole number 0 or greater (no negative numbers allowed)',
      }),
  })
  .superRefine((data, ctx) => {
    // 1. Conditional registrationNumber validation based on registrationType
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
      data.occupiedCages > data.totalCages
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Occupied cages cannot be greater than total cages capacity',
        path: ['occupiedCages'],
      });
    }
  });

// Express validation middleware
const validateShelterRegistration = (req, res, next) => {
  // Normalize fields before parsing
  if (typeof req.body?.registrationNumber === 'string') {
    req.body.registrationNumber = req.body.registrationNumber.trim().toUpperCase();
  }
  if (typeof req.body?.shelterName === 'string') {
    req.body.shelterName = req.body.shelterName.trim();
  }
  if (typeof req.body?.shelterEmail === 'string') {
    req.body.shelterEmail = req.body.shelterEmail.trim();
  }

  const result = shelterRegistrationZodSchema.safeParse(req.body);

  if (!result.success) {
    const firstIssue = result.error.issues[0];
    const errorMessage = firstIssue?.message || 'Validation error';

    return res.status(400).json({
      success: false,
      message: errorMessage,
      error: errorMessage,
      details: result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
    });
  }

  // Assign sanitized & transformed data
  req.validatedBody = result.data;
  next();
};

module.exports = {
  REGISTRATION_TYPES,
  SHELTER_REGISTRATION_RULES,
  shelterRegistrationZodSchema,
  validateShelterRegistration,
};
