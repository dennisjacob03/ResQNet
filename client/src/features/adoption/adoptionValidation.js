import { z } from 'zod';

export const HOUSING_TYPES = [
  'House',
  'Apartment',
  'Townhouse',
  'Mobile Home',
  'Other',
];

export const OWNERSHIP_STATUSES = ['Own', 'Rent'];

const PHONE_REGEX =
  /^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[6789]\d{9}$|^(\+?\d{1,4}[-.\s]?)?\(?\d{2,5}\)?[-.\s]?\d{3,5}[-.\s]?\d{3,5}$/;

export const adoptionFormZodSchema = z
  .object({
    pet_id: z
      .string()
      .trim()
      .min(1, 'Pet ID is required')
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid Pet ID reference'),

    housing_type: z.enum(HOUSING_TYPES, {
      errorMap: () => ({
        message: 'Please select a valid housing type from the list',
      }),
    }),

    ownership_status: z.enum(OWNERSHIP_STATUSES, {
      errorMap: () => ({
        message: "Please specify whether you 'Own' or 'Rent' your home",
      }),
    }),

    landlord_details: z
      .object({
        name: z.string().trim().optional(),
        phone: z.string().trim().optional(),
      })
      .optional(),

    agreements: z.object({
      return_policy: z
        .boolean()
        .refine((val) => val === true, {
          message:
            'You must agree to the Pet Return Policy before submitting',
        }),
    }),

    notes: z
      .string()
      .max(1000, 'Notes cannot exceed 1000 characters')
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.ownership_status === 'Rent') {
      const landlordName = data.landlord_details?.name?.trim();
      const landlordPhone = data.landlord_details?.phone?.trim();

      if (!landlordName || landlordName.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['landlord_name'],
          message: 'Landlord full name is required when renting',
        });
      }

      if (!landlordPhone || !PHONE_REGEX.test(landlordPhone)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['landlord_phone'],
          message: 'Valid landlord phone number (10 digits) is required',
        });
      }
    }
  });

/**
 * Validates adoption form state and returns a mapped error object { [field]: 'Error message' }
 */
export const validateAdoptionFormData = (formData) => {
  const result = adoptionFormZodSchema.safeParse(formData);
  if (result.success) {
    return { isValid: true, errors: {} };
  }

  const errors = {};
  result.error.issues.forEach((issue) => {
    const key = issue.path.join('.');
    if (!errors[key]) {
      errors[key] = issue.message;
    }
  });

  return { isValid: false, errors };
};
