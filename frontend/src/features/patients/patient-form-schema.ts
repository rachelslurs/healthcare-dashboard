import { z } from 'zod'

// Medication schema
const medicationSchema = z.object({
  id: z.string(),
  name: z.string(),
  dosage: z.string(),
  frequency: z.string(),
  prescribedBy: z.string(),
  startDate: z.string(),
  endDate: z.string().optional(),
  isActive: z.boolean(),
})

// Address schema - always present in form, but fields can be empty
// Validation ensures if any field is filled, all required fields must be filled
const addressSchema = z.object({
  street: z.string(),
  city: z.string(),
  state: z.string(),
  zipCode: z.string(),
  country: z.string(),
})

// Emergency contact schema - always present in form, but fields can be empty
// Validation ensures if name is provided, relationship and phone must be filled
// Email is always optional
const emergencyContactSchema = z.object({
  name: z.string().nullable(),
  relationship: z.string().nullable(),
  phone: z.string().nullable(),
  email: z.union([
    z.string().email('Invalid email address'),
    z.literal(''),
    z.null(),
    z.undefined(),
  ]).optional(),
})

// Medical info schema
const medicalInfoSchema = z.object({
  allergies: z.array(z.string()),
  currentMedications: z.array(medicationSchema),
  conditions: z.array(z.string()),
  bloodType: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
  lastVisit: z.string(),
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
}).refine(
  (data) => {
    // If name is provided, relationship and phone must also be provided
    // Email is always optional
    const hasName = data.emergencyContact.name?.trim()
    if (hasName) {
      return (
        data.emergencyContact.relationship?.trim() &&
        data.emergencyContact.phone?.trim()
      )
    }
    return true
  },
  {
    message: 'Emergency contact relationship and phone are required when a name is provided',
    path: ['emergencyContact'],
  }
).refine(
  (data) => {
    // If any address field is filled, all required fields must be filled
    const hasAnyField = data.address.street?.trim() || 
                        data.address.city?.trim() || 
                        data.address.state?.trim() ||
                        data.address.zipCode?.trim()
    if (hasAnyField) {
      return (
        data.address.street?.trim() &&
        data.address.city?.trim() &&
        data.address.state?.trim() &&
        data.address.zipCode?.trim()
      )
    }
    return true
  },
  {
    message: 'All address fields are required if address is provided',
    path: ['address'],
  }
)

export type PatientFormData = z.output<typeof patientFormSchema>
