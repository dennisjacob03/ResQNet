const { z } = require('zod');

const HOUSING_TYPES = ['House', 'Apartment', 'Townhouse', 'Mobile Home', 'Other'];
const OWNERSHIP_STATUSES = ['Own', 'Rent'];
const APPLICATION_STATUSES = [
  'Pending',
  'Under Review',
  'Shelter Visit',
  'Approved',
  'Rejected',
  'Withdrawn',
];

// Phone regex allowing 10-digit Indian numbers or standard international formats (+91, digits, dashes, spaces)
const PHONE_REGEX = /^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[6789]\d{9}$|^(\+?\d{1,4}[-.\s]?)?\(?\d{2,5}\)?[-.\s]?\d{3,5}[-.\s]?\d{3,5}$/;

const adoptionApplicationSchemaZod = z
  .object({
    pet_id: z
      .string({
        required_error: 'Pet ID is required',
        invalid_type_error: 'Pet ID must be a string',
      })
      .trim()
      .regex(/^[0-9a-fA-F]{24}$/, 'Pet ID must be a valid 24-character ID'),

    housing_type: z.enum(HOUSING_TYPES, {
      errorMap: () => ({
        message:
          "Housing type must be one of: 'House', 'Apartment', 'Townhouse', 'Mobile Home', 'Other'",
      }),
    }),

    ownership_status: z.enum(OWNERSHIP_STATUSES, {
      errorMap: () => ({
        message: "Ownership status must be either 'Own' or 'Rent'",
      }),
    }),

    landlord_details: z
      .object({
        name: z.string().trim().optional(),
        phone: z.string().trim().optional(),
      })
      .optional(),

    agreements: z.object(
      {
        return_policy: z
          .boolean({
            required_error: 'You must acknowledge the Pet Return Policy',
            invalid_type_error: 'Return policy agreement must be a boolean',
          })
          .refine((val) => val === true, {
            message:
              'You must agree to the Pet Return Policy to submit an adoption application',
          }),
      },
      { required_error: 'Agreements object is required' }
    ),

    notes: z
      .string()
      .max(1000, 'Notes cannot exceed 1000 characters')
      .optional()
      .default(''),
  })
  .superRefine((data, ctx) => {
    // If renting, landlord details (name and valid phone) are strictly required
    if (data.ownership_status === 'Rent') {
      const landlordName = data.landlord_details?.name?.trim();
      const landlordPhone = data.landlord_details?.phone?.trim();

      if (!landlordName || landlordName.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['landlord_details', 'name'],
          message:
            'Landlord name is required when renting and must be at least 2 characters',
        });
      }

      if (!landlordPhone || !PHONE_REGEX.test(landlordPhone)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['landlord_details', 'phone'],
          message:
            'Valid landlord contact phone number is required when renting',
        });
      }
    }
  });

// Schema for updating application status (Shelter / Admin)
const updateStatusSchemaZod = z.object({
  application_status: z.enum(
    [
      'Pending',
      'Under Review',
      'Shelter Visit',
      'Approved',
      'Rejected',
      'Withdrawn',
    ],
    {
      errorMap: () => ({
        message:
          "Status must be one of: 'Pending', 'Under Review', 'Shelter Visit', 'Approved', 'Rejected', 'Withdrawn'",
      }),
    }
  ),
  remarks: z
    .string()
    .max(1000, 'Remarks cannot exceed 1000 characters')
    .optional()
    .default(''),
});

// Schema for submitting shelter visit inspection report & decision
const submitVisitReportSchemaZod = z.object({
  reportText: z
    .string({
      required_error: 'Shelter visit inspection report text is required',
    })
    .trim()
    .min(10, 'Inspection report must be at least 10 characters long'),
  decision: z.enum(['Approved', 'Rejected'], {
    errorMap: () => ({
      message: "Decision must be either 'Approved' (Pass) or 'Rejected' (Fail)",
    }),
  }),
  checks: z
    .object({
      visitDone: z.boolean().optional().default(false),
      housingVerified: z.boolean().optional().default(false),
      agreementConfirmed: z.boolean().optional().default(false),
    })
    .optional()
    .default({}),
});

const validateAdoptionApplication = (data) => {
  return adoptionApplicationSchemaZod.safeParse(data);
};

const validateUpdateStatus = (data) => {
  return updateStatusSchemaZod.safeParse(data);
};

const validateSubmitVisitReport = (data) => {
  return submitVisitReportSchemaZod.safeParse(data);
};

module.exports = {
  HOUSING_TYPES,
  OWNERSHIP_STATUSES,
  APPLICATION_STATUSES,
  adoptionApplicationSchemaZod,
  updateStatusSchemaZod,
  submitVisitReportSchemaZod,
  validateAdoptionApplication,
  validateUpdateStatus,
  validateSubmitVisitReport,
};
