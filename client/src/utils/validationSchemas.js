import { z } from 'zod';

// Full Name: At least 2 chars, letters and spaces only, no spaces only
export const fullNameSchema = z
  .string()
  .min(1, { message: 'Full name is required' })
  .refine((val) => val.trim().length > 0, { message: 'Full name cannot be empty or spaces only' })
  .refine((val) => val.trim().length >= 2, { message: 'Full name must be at least 2 characters' })
  .refine((val) => /^[a-zA-Z\s.]+$/.test(val), { message: 'Full name can only contain letters, dots, and spaces' });

// Email: valid email format, no spaces only
export const emailSchema = z
  .string()
  .min(1, { message: 'Email address is required' })
  .refine((val) => val.trim().length > 0, { message: 'Email cannot be empty or spaces only' })
  .refine((val) => !/\s/.test(val), { message: 'Email cannot contain spaces' })
  .email({ message: 'Please enter a valid email address (e.g. name@example.com)' });

// Indian Phone Number: Only numbers, exactly 10 digits starting with 6-9
export const phoneSchema = z
  .string()
  .min(1, { message: 'Phone number is required' })
  .refine((val) => val.trim().length > 0, { message: 'Phone number cannot be empty or spaces only' })
  .refine((val) => /^[0-9]+$/.test(val), { message: 'Phone number must contain numbers only' })
  .refine((val) => val.length === 10, { message: 'Phone number must be exactly 10 digits' })
  .refine((val) => /^[6-9]\d{9}$/.test(val), {
    message: 'Must be a valid 10-digit Indian mobile number (starting with 6, 7, 8, or 9)',
  });

// Password: >= 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char, no spaces
export const passwordSchema = z
  .string()
  .min(1, { message: 'Password is required' })
  .refine((val) => val.trim().length > 0, { message: 'Password cannot be empty or spaces only' })
  .refine((val) => !/\s/.test(val), { message: 'Password cannot contain spaces' })
  .refine((val) => val.length >= 8, { message: 'Password must be at least 8 characters long' })
  .refine((val) => /[A-Z]/.test(val), { message: 'Password must include at least 1 uppercase letter (A-Z)' })
  .refine((val) => /[a-z]/.test(val), { message: 'Password must include at least 1 lowercase letter (a-z)' })
  .refine((val) => /[0-9]/.test(val), { message: 'Password must include at least 1 number (0-9)' })
  .refine((val) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(val), {
    message: 'Password must include at least 1 special character (e.g. !@#$%^&*)',
  });

// Registration Schema combining fields & superRefine for confirmPassword
export const registerSchema = z
  .object({
    fullName: fullNameSchema,
    email: emailSchema,
    phoneNumber: phoneSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, { message: 'Please confirm your password' }),
  })
  .superRefine((data, ctx) => {
    if (data.password && data.confirmPassword && data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Passwords do not match',
        path: ['confirmPassword'],
      });
    }
  });

// Login Schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { message: 'Password is required' }),
});

// Indian PIN Code: Exactly 6 numeric digits
export const pincodeSchema = z
  .string()
  .min(1, { message: 'PIN code is required' })
  .refine((val) => val.trim().length > 0, { message: 'PIN code cannot be empty' })
  .refine((val) => /^[0-9]+$/.test(val), { message: 'PIN code must contain numbers only' })
  .refine((val) => val.length === 6, { message: 'PIN code must be exactly 6 digits' });

// State: Required string
export const stateSchema = z
  .string()
  .min(1, { message: 'State is required' })
  .refine((val) => val.trim().length > 0, { message: 'Please select a state' });

// District: Required string
export const districtSchema = z
  .string()
  .min(1, { message: 'District is required' })
  .refine((val) => val.trim().length > 0, { message: 'Please select a district' });

// City / Locality: Required string
export const citySchema = z
  .string()
  .min(1, { message: 'City / Locality is required' })
  .refine((val) => val.trim().length > 0, { message: 'Please select or enter a city / locality' });

// Address line: Optional or required string
export const addressLineSchema = z
  .string()
  .min(1, { message: 'Street address is required' })
  .refine((val) => val.trim().length >= 3, { message: 'Address must be at least 3 characters' });

// Date of Birth: Must be past date
export const dobSchema = z
  .string()
  .refine((val) => !val || new Date(val) <= new Date(), {
    message: 'Date of birth cannot be in the future',
  });

// Comprehensive Address Schema
export const addressSchema = z.object({
  address: z.string().optional(),
  state: stateSchema,
  district: districtSchema,
  city: citySchema,
  pincode: pincodeSchema,
});

// Indian Vehicle Registration Number (e.g., KL-07-AB-1234, DL 01 A 1234, MH12DE1234)
export const vehicleNumberSchema = z
  .string()
  .min(1, { message: 'Vehicle registration number is required' })
  .refine((val) => val.trim().length > 0, { message: 'Vehicle number cannot be empty' })
  .refine(
    (val) =>
      /^[A-Z]{2}[ -]?[0-9]{1,2}[ -]?[A-Z]{1,3}[ -]?[0-9]{4}$/i.test(val.trim()),
    {
      message: 'Enter a valid Indian vehicle number (e.g. KL-07-AB-1234 or DL 01 A 1234)',
    }
  );

// Emergency Contact Schema
export const emergencyContactSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Emergency contact name is required' })
    .refine((val) => val.trim().length >= 2, {
      message: 'Emergency contact name must be at least 2 characters',
    })
    .refine((val) => /^[a-zA-Z\s]+$/.test(val), {
      message: 'Name can only contain letters and spaces',
    }),
  phone: phoneSchema,
  relation: z.string().min(1, { message: 'Please specify relationship' }),
});

// Volunteer Application Schema
export const volunteerApplicationSchema = z
  .object({
    fullName: fullNameSchema,
    email: emailSchema,
    phone: phoneSchema,
    district: districtSchema,
    city: citySchema,
    emergencyContact: emergencyContactSchema,
    availability: z
      .array(z.string())
      .min(1, { message: 'Please select at least one availability schedule' }),
    interests: z
      .array(z.string())
      .min(1, { message: 'Please select at least one area of interest' }),
    hasVehicle: z.boolean().default(false),
    vehicleType: z.string().optional(),
    vehicleNumber: z.string().optional(),
    agreedToTerms: z
      .boolean()
      .refine((val) => val === true, {
        message: 'You must agree to the volunteer code of conduct & safety guidelines',
      }),
  })
  .superRefine((data, ctx) => {
    if (data.hasVehicle && data.vehicleType && data.vehicleType !== 'None') {
      const vNum = (data.vehicleNumber || '').trim();
      if (!vNum) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Vehicle registration number is required when vehicle is listed',
          path: ['vehicleNumber'],
        });
      } else if (!/^[A-Z]{2}[ -]?[0-9]{1,2}[ -]?[A-Z]{1,3}[ -]?[0-9]{4}$/i.test(vNum)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Invalid vehicle number format (e.g. KL-07-AB-1234)',
          path: ['vehicleNumber'],
        });
      }
    }
  });

// Rescue Team Application Schema
export const rescueTeamApplicationSchema = z.object({
  teamName: z
    .string()
    .min(1, { message: 'Team name is required' })
    .refine((val) => val.trim().length >= 3, { message: 'Team name must be at least 3 characters' }),
  teamLeadName: fullNameSchema,
  contactEmail: emailSchema,
  contactPhone: phoneSchema,
  operatingDistrict: districtSchema,
  coverageZone: z
    .string()
    .min(1, { message: 'Coverage zone or base location is required' })
    .refine((val) => val.trim().length >= 3, {
      message: 'Coverage zone must be at least 3 characters',
    }),
  vehicleType: z.string().min(1, { message: 'Please select a vehicle type' }),
  vehicleNumber: vehicleNumberSchema,
  totalMembers: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val >= 1, {
      message: 'Team must have at least 1 active squad responder',
    }),
  equipment: z
    .array(z.string())
    .min(1, { message: 'Please select at least one piece of rescue gear' }),
  address: addressLineSchema,
});

// Veterinary Staff Application Schema
export const veterinaryStaffApplicationSchema = z
  .object({
    fullName: fullNameSchema,
    email: emailSchema,
    phone: phoneSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, { message: 'Please confirm your password' }),
    position: z.string().min(1, { message: 'Staff position is required' }),
    councilRegistrationNumber: z
      .string()
      .min(1, { message: 'Council registration number is mandatory' })
      .refine((val) => val.trim().length >= 4, {
        message: 'Registration number must be at least 4 characters',
      }),
    qualification: z.string().min(1, { message: 'Please select veterinary qualification' }),
    experienceYears: z
      .union([z.string(), z.number()])
      .transform((val) => Number(val))
      .refine((val) => !isNaN(val) && val >= 0, {
        message: 'Experience must be a positive number of years',
      }),
  })
  .superRefine((data, ctx) => {
    if (data.password && data.confirmPassword && data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Passwords do not match',
        path: ['confirmPassword'],
      });
    }
  });

// Rescue Request / Animal in Distress Schema
export const rescueRequestSchema = z.object({
  animalType: z.string().min(1, { message: 'Please select an animal type' }),
  animalCondition: z.string().min(1, { message: 'Please select the animal condition' }),
  description: z
    .string()
    .min(1, { message: 'Description is required' })
    .refine((val) => val.trim().length >= 10, {
      message: 'Please provide at least 10 characters detailing the animal and situation',
    }),
  locationAddress: z
    .string()
    .min(1, { message: 'Incident location or landmark is required' })
    .refine((val) => val.trim().length >= 5, {
      message: 'Please provide at least 5 characters for landmark / address',
    }),
  latitude: z
    .union([z.string(), z.number(), z.null(), z.undefined()])
    .optional()
    .refine(
      (val) => val === '' || val === null || val === undefined || (!isNaN(Number(val)) && Number(val) >= -90 && Number(val) <= 90),
      { message: 'Latitude must be between -90 and 90 degrees' }
    ),
  longitude: z
    .union([z.string(), z.number(), z.null(), z.undefined()])
    .optional()
    .refine(
      (val) => val === '' || val === null || val === undefined || (!isNaN(Number(val)) && Number(val) >= -180 && Number(val) <= 180),
      { message: 'Longitude must be between -180 and 180 degrees' }
    ),
});

// Admin Add User Role-Based Schema
export const adminAddUserSchema = z
  .object({
    fullName: z.string().optional(),
    email: emailSchema,
    phoneNumber: phoneSchema,
    password: passwordSchema,
    role: z.enum(
      [
        'Public User',
        'Rescue Team',
        'Shelter',
        'Veterinary Staff',
      ],
      {
        errorMap: () => ({ message: 'Please select a valid role' }),
      }
    ),
    status: z.enum(['Active', 'Suspended', 'Inactive']).default('Active'),
    city: z.string().optional(),
    district: z.string().optional(),
    state: z.string().optional(),
    address: z.string().optional(),
    pincode: z
      .string()
      .optional()
      .refine(
        (val) => !val || /^[0-9]{6}$/.test(val.trim()),
        { message: 'PIN code must be exactly 6 digits' }
      ),
    dob: z.string().optional(),

    // Rescue Team fields
    teamName: z.string().optional(),
    vehicleType: z.string().optional(),
    vehicleNumber: z.string().optional(),
    operatingDistrict: z.string().optional(),
    coverageZone: z.string().optional(),
    totalMembers: z.union([z.string(), z.number()]).optional(),
    equipment: z.array(z.string()).optional(),

    // Shelter fields
    shelterName: z.string().optional(),
    registrationType: z.string().optional(),
    registrationNumber: z.string().optional(),
    shelterPhoneNumber: z.string().optional(),
    shelterEmail: z.string().optional(),
    totalStaffs: z.union([z.string(), z.number()]).optional(),
    totalCages: z.union([z.string(), z.number()]).optional(),
    occupiedCages: z.union([z.string(), z.number()]).optional(),
    shelterStatus: z.string().optional(),

    // Veterinary Staff fields
    shelterId: z.string().optional(),
    position: z.string().optional(),
    councilRegistrationNumber: z.string().optional(),
    qualification: z.string().optional(),
    specialization: z.string().optional(),
    experience: z.union([z.string(), z.number()]).optional(),
  })
  .superRefine((data, ctx) => {
    // For Public User and Veterinary Staff, require personal full name
    if (data.role === 'Public User' || data.role === 'Veterinary Staff') {
      const name = (data.fullName || '').trim();
      if (!name) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Full name is required',
          path: ['fullName'],
        });
      } else if (name.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Full name must be at least 2 characters',
          path: ['fullName'],
        });
      } else if (!/^[a-zA-Z\s.]+$/.test(name)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Full name can only contain letters, dots, and spaces',
          path: ['fullName'],
        });
      }
    }

    if (data.role === 'Rescue Team') {
      if (!data.teamName || data.teamName.trim().length < 3) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Rescue team name is required (min 3 characters)',
          path: ['teamName'],
        });
      }
      if (!data.vehicleType) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Please select a vehicle type',
          path: ['vehicleType'],
        });
      }
      const vNum = (data.vehicleNumber || '').trim();
      if (!vNum) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Vehicle registration number is required',
          path: ['vehicleNumber'],
        });
      } else if (!/^[A-Z]{2}[ -]?[0-9]{1,2}[ -]?[A-Z]{1,3}[ -]?[0-9]{4}$/i.test(vNum)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Enter a valid Indian vehicle number (e.g. KL-07-AB-1234)',
          path: ['vehicleNumber'],
        });
      }
      if (!data.operatingDistrict || !data.operatingDistrict.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Operating district is required',
          path: ['operatingDistrict'],
        });
      }
    }

    if (data.role === 'Shelter') {
      if (!data.shelterName || data.shelterName.trim().length < 3) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Shelter facility name is required (min 3 characters)',
          path: ['shelterName'],
        });
      }
      if (!data.registrationType) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Please select registration type',
          path: ['registrationType'],
        });
      }
      if (!data.registrationNumber || data.registrationNumber.trim().length < 3) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Registration number is required (min 3 characters)',
          path: ['registrationNumber'],
        });
      }
      const cages = Number(data.totalCages);
      if (isNaN(cages) || cages < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Total cages must be at least 1',
          path: ['totalCages'],
        });
      }
      const occ = Number(data.occupiedCages || 0);
      if (!isNaN(occ) && !isNaN(cages) && occ > cages) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Occupied cages cannot exceed total cages',
          path: ['occupiedCages'],
        });
      }
    }

    if (data.role === 'Veterinary Staff') {
      if (!data.position) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Please select staff position',
          path: ['position'],
        });
      }
      if (!data.councilRegistrationNumber || data.councilRegistrationNumber.trim().length < 4) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Council registration number is mandatory (min 4 characters)',
          path: ['councilRegistrationNumber'],
        });
      }
      if (!data.qualification || data.qualification.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Qualification is required',
          path: ['qualification'],
        });
      }
      if (!data.shelterId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Please select an assigned shelter',
          path: ['shelterId'],
        });
      }
    }
  });

// Shelter Animal Creation Schema
export const shelterAnimalSchema = z.object({
  species: z.string().min(1, { message: 'Species is required' }),
  breed: z
    .string()
    .min(1, { message: 'Breed is required' })
    .refine((val) => val.trim().length >= 2, { message: 'Breed must be at least 2 characters' }),
  approxAge: z
    .string()
    .min(1, { message: 'Approximate age is required (e.g. 2y, 6m)' })
    .refine((val) => val.trim().length >= 1, { message: 'Please provide approximate age' }),
  cageNumber: z.string().optional(),
});

// Admin Animal Creation Schema
export const adminAnimalSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Animal name is required' })
    .refine((val) => val.trim().length >= 2, { message: 'Animal name must be at least 2 characters' }),
  species: z.string().min(1, { message: 'Species / category is required' }),
  breed: z
    .string()
    .optional()
    .refine((val) => !val || val.trim().length >= 2, {
      message: 'Breed must be at least 2 characters if provided',
    }),
  approxAge: z
    .string()
    .optional()
    .refine((val) => !val || val.trim().length >= 1, { message: 'Please provide approximate age' }),
});

// Shelter Cage Creation Schema
export const shelterCageSchema = z.object({
  cageCategoryId: z.string().min(1, { message: 'Please select an animal category' }),
  cageNumber: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val >= 1, {
      message: 'Cage number must be a positive number greater than 0',
    }),
});

// Shelter Capacity Limit Schema
export const shelterCapacitySchema = z
  .object({
    categoryId: z.string().min(1, { message: 'Please select an animal category' }),
    total: z
      .union([z.string(), z.number()])
      .transform((val) => Number(val))
      .refine((val) => !isNaN(val) && val >= 1, {
        message: 'Total capacity must be a positive number of at least 1',
      }),
    occupied: z
      .union([z.string(), z.number(), z.undefined()])
      .transform((val) => (val === '' || val === undefined ? 0 : Number(val)))
      .refine((val) => !isNaN(val) && val >= 0, {
        message: 'Occupied count cannot be negative',
      }),
  })
  .superRefine((data, ctx) => {
    if (data.occupied > data.total) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Occupied count cannot exceed total capacity limit',
        path: ['occupied'],
      });
    }
  });

// Clinical Medical Record Schema
export const clinicalRecordSchema = z
  .object({
    animalId: z.string().min(1, { message: 'Please select a patient animal' }),
    report: z
      .string()
      .min(1, { message: 'Clinical findings or examination notes are required' })
      .refine((val) => val.trim().length >= 10, {
        message: 'Clinical report must contain at least 10 characters',
      }),
    temperature: z
      .string()
      .optional()
      .refine(
        (val) => {
          if (!val || !val.trim()) return true;
          const num = Number(val.replace(/[^\d.]/g, ''));
          return !isNaN(num) && num >= 90 && num <= 112;
        },
        { message: 'Body temperature must be between 90°F and 112°F' }
      ),
    weight: z
      .string()
      .optional()
      .refine(
        (val) => {
          if (!val || !val.trim()) return true;
          const num = Number(val.replace(/[^\d.]/g, ''));
          return !isNaN(num) && num > 0 && num <= 250;
        },
        { message: 'Weight must be a positive number up to 250 kg' }
      ),
    isSurgery: z.boolean().default(false),
    procedureName: z.string().optional(),
    anesthesia: z.string().optional(),
    postOpCare: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.isSurgery) {
      if (!data.procedureName || data.procedureName.trim().length < 3) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Surgical procedure name is required (min 3 chars)',
          path: ['procedureName'],
        });
      }
      if (!data.anesthesia || data.anesthesia.trim().length < 3) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Anesthesia protocol is required',
          path: ['anesthesia'],
        });
      }
    }
  });

// Vaccination Record Schema
export const vaccinationRecordSchema = z
  .object({
    animalId: z.string().min(1, { message: 'Please select an animal' }),
    vaccineName: z
      .string()
      .min(1, { message: 'Vaccine name is required' })
      .refine((val) => val.trim().length >= 2, { message: 'Vaccine name must be at least 2 characters' }),
    dateGiven: z
      .string()
      .min(1, { message: 'Administration date is required' })
      .refine((val) => !val || new Date(val) <= new Date(new Date().setHours(23, 59, 59, 999)), {
        message: 'Administration date cannot be in the future',
      }),
    nextDueDate: z.string().optional(),
    batchNumber: z
      .string()
      .min(1, { message: 'Batch number is required' })
      .refine((val) => val.trim().length >= 3, {
        message: 'Batch number must be at least 3 characters',
      }),
  })
  .superRefine((data, ctx) => {
    if (data.dateGiven && data.nextDueDate) {
      if (new Date(data.nextDueDate) < new Date(data.dateGiven)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Next booster due date must be on or after the administration date',
          path: ['nextDueDate'],
        });
      }
    }
  });

// Reminder Modal Schema
export const reminderModalSchema = z.object({
  animalId: z.string().min(1, { message: 'Please select an animal' }),
  reminderType: z.string().min(1, { message: 'Please choose a reminder type' }),
  dueDate: z
    .string()
    .min(1, { message: 'Scheduled date is required' })
    .refine((val) => !val || new Date(val).setHours(0, 0, 0, 0) >= new Date().setHours(0, 0, 0, 0), {
      message: 'Scheduled date cannot be in the past',
    }),
  notes: z
    .string()
    .min(1, { message: 'Reminder notes are required' })
    .refine((val) => val.trim().length >= 5, {
      message: 'Reminder notes must be at least 5 characters',
    }),
});

// Audit / Valuation Visit Report Schema
export const auditReportSchema = z.object({
  reportText: z
    .string()
    .min(1, { message: 'Inspection / audit report text is required' })
    .refine((val) => val.trim().length >= 15, {
      message: 'Audit report must contain at least 15 characters of detailed observations',
    }),
  decision: z.enum(['Approved', 'Rejected'], {
    errorMap: () => ({ message: 'Please select an audit decision (Approved or Rejected)' }),
  }),
});

// Category Schema
export const animalCategorySchema = z.object({
  categoryName: z
    .string()
    .min(1, { message: 'Category name is required' })
    .refine((val) => val.trim().length >= 2, {
      message: 'Category name must be at least 2 characters',
    })
    .refine((val) => /^[a-zA-Z\s]+$/.test(val), {
      message: 'Category name can only contain letters and spaces',
    }),
  categoryDescription: z.string().max(500, { message: 'Description cannot exceed 500 characters' }).optional(),
});

// Helper function to extract all Zod error messages mapped by field path
export const extractZodErrors = (input) => {
  if (!input) {
    const res = {};
    Object.defineProperty(res, 'isValid', { value: true, enumerable: false, writable: true });
    Object.defineProperty(res, 'errors', { value: {}, enumerable: false, writable: true });
    return res;
  }
  if (input.success === true) {
    const res = {};
    Object.defineProperty(res, 'isValid', { value: true, enumerable: false, writable: true });
    Object.defineProperty(res, 'errors', { value: {}, enumerable: false, writable: true });
    return res;
  }

  const issues = input.issues || input.error?.issues || [];
  const errors = {};
  issues.forEach((issue) => {
    const key = issue.path.join('.') || 'form';
    if (!errors[key]) {
      errors[key] = issue.message;
    }
  });

  const res = { ...errors };
  Object.defineProperty(res, 'isValid', {
    value: issues.length === 0,
    enumerable: false,
    writable: true,
  });
  Object.defineProperty(res, 'errors', {
    value: errors,
    enumerable: false,
    writable: true,
  });
  return res;
};

// Single field validator helper function for live instant field validation
export const validateField = (schema, fieldName, value, allData = {}) => {
  if (fieldName === 'confirmPassword') {
    const result = registerSchema.safeParse({ ...allData, confirmPassword: value });
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path.includes('confirmPassword'));
      if (issue) return issue.message;
    }
    return '';
  }

  // For Rescue Team & Shelter, teamName/shelterName is used instead of a separate fullName
  if (fieldName === 'fullName' && (allData?.role === 'Rescue Team' || allData?.role === 'Shelter')) {
    return '';
  }

  const fieldSchemas = {
    fullName: fullNameSchema,
    name: fullNameSchema,
    teamLeadName: fullNameSchema,
    email: emailSchema,
    contactEmail: emailSchema,
    shelterEmail: emailSchema,
    phoneNumber: phoneSchema,
    phone: phoneSchema,
    contactPhone: phoneSchema,
    shelterPhoneNumber: phoneSchema,
    password: passwordSchema,
    pincode: pincodeSchema,
    state: stateSchema,
    district: districtSchema,
    operatingDistrict: districtSchema,
    city: citySchema,
    address: addressLineSchema,
    dob: dobSchema,
    vehicleNumber: vehicleNumberSchema,
    teamName: z
      .string()
      .min(1, { message: 'Team name is required' })
      .refine((v) => v.trim().length >= 3, { message: 'Team name must be at least 3 characters' }),
    shelterName: z
      .string()
      .min(1, { message: 'Shelter name is required' })
      .refine((v) => v.trim().length >= 3, { message: 'Shelter name must be at least 3 characters' }),
    registrationNumber: z
      .string()
      .min(1, { message: 'Registration number is required' })
      .refine((v) => v.trim().length >= 3, { message: 'Registration number must be at least 3 characters' }),
    councilRegistrationNumber: z
      .string()
      .min(1, { message: 'Council registration number is mandatory' })
      .refine((v) => v.trim().length >= 4, { message: 'Must be at least 4 characters' }),
    qualification: z.string().min(1, { message: 'Qualification is required' }),
    position: z.string().min(1, { message: 'Position is required' }),
    shelterId: z.string().min(1, { message: 'Please select an assigned shelter' }),
  };

  const targetSchema = fieldSchemas[fieldName] || schema;
  if (!targetSchema) return '';

  const result = targetSchema.safeParse(value);
  if (!result.success) {
    return result.error.issues[0]?.message || 'Invalid field value';
  }
  return '';
};


