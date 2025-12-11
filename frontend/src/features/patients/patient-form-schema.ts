import { z } from 'zod'

// Simplified medication schema
const medicationSchema = z.object({
  name: z.string().min(1, 'Medication name is required'),
  dosage: z.string().optional(),
  frequency: z.string().optional(),
})

// Address schema - optional, but if provided, all fields are required
// Validation ensures if any field is filled, all required fields must be filled
const addressSchema = z.object({
  street: z.string(),
  city: z.string(),
  state: z.string(),
  zipCode: z.string(),
  country: z.string(),
}).optional()

// Emergency contact schema - optional, but if provided, name/relationship/phone are required
// Email is always optional
const emergencyContactSchema = z.object({
  name: z.string(),
  relationship: z.string(),
  phone: z.string(),
  email: z.string().email('Invalid email address').optional(),
}).optional()

// Medical info schema
const medicalInfoSchema = z.object({
  allergies: z.array(z.string()),
  currentMedications: z.array(medicationSchema),
  conditions: z.array(z.string()),
  bloodType: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
  lastVisit: z.string().optional(), // Optional to match backend
})

// Insurance schema
const insuranceSchema = z.object({
  provider: z.string().min(1, 'Insurance provider is required'),
  policyNumber: z.string().min(1, 'Policy number is required'),
  groupNumber: z.string().optional(),
  effectiveDate: z.string().optional(),
  expirationDate: z.string().optional(),
  copay: z.number().min(0, 'Copay must be 0 or greater'),
  deductible: z.number().min(0, 'Deductible must be 0 or greater').optional(),
})

// Main patient form schema
export const patientFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required').refine(
    (date) => {
      const dateObj = new Date(date)
      return !isNaN(dateObj.getTime()) && dateObj < new Date()
    },
    { message: 'Date of birth must be a valid date in the past' }
  ),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  status: z.enum(['active', 'inactive', 'archived']),
  address: addressSchema,
  emergencyContact: emergencyContactSchema,
  medicalInfo: medicalInfoSchema,
  insurance: insuranceSchema,
})
// Note: Address and emergencyContact are optional in the schema
// The form UI can still show empty objects, but we'll convert them to undefined before submission

export type PatientFormData = z.output<typeof patientFormSchema>
