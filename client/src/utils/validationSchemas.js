import { z } from 'zod';

// Full Name: At least 2 chars, letters and spaces only, no spaces only
export const fullNameSchema = z
  .string()
  .min(1, { message: 'Full name is required' })
  .refine((val) => val.trim().length > 0, { message: 'Full name cannot be empty or spaces only' })
  .refine((val) => val.trim().length >= 2, { message: 'Full name must be at least 2 characters' })
  .refine((val) => /^[a-zA-Z\s]+$/.test(val), { message: 'Full name can only contain letters and spaces' });

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

  const fieldSchemas = {
    fullName: fullNameSchema,
    email: emailSchema,
    phoneNumber: phoneSchema,
    phone: phoneSchema,
    password: passwordSchema,
    pincode: pincodeSchema,
    state: stateSchema,
    district: districtSchema,
    city: citySchema,
    address: addressLineSchema,
    dob: dobSchema,
  };

  const targetSchema = fieldSchemas[fieldName] || schema;
  if (!targetSchema) return '';

  const result = targetSchema.safeParse(value);
  if (!result.success) {
    return result.error.issues[0]?.message || 'Invalid field value';
  }
  return '';
};

