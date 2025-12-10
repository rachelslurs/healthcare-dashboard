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

// Document schema
const documentSchema = z.object({
  id: z.string(),
  type: z.enum(['medical_record', 'insurance_card', 'photo_id', 'test_result', 'other']),
  name: z.string(),
  uploadDate: z.string(),
  fileSize: z.number(),
  mimeType: z.string(),
  url: z.string(),
})

// Address schema - always present in form, but fields can be empty
// Validation ensures if any field is filled, all required fields must be filled
const addressSchema = z.object({
  street: z.string(),
  city: z.string(),
  state: z.string(),
  zipCode: z.string(),
  country: z.string().default('USA'),
})

// Emergency contact schema - always present in form, but fields can be empty
// Validation ensures if any field is filled, name/relationship/phone must be filled
const emergencyContactSchema = z.object({
  name: z.string(),
  relationship: z.string(),
  phone: z.string(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
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
  documents: z.array(documentSchema).default([]),
}).refine(
  (data) => {
    // If any emergency contact field is filled, name, relationship, and phone must all be filled
    const hasAnyField = data.emergencyContact.name?.trim() || 
                        data.emergencyContact.relationship?.trim() || 
                        data.emergencyContact.phone?.trim() ||
                        data.emergencyContact.email?.trim()
    if (hasAnyField) {
      return (
        data.emergencyContact.name?.trim() &&
        data.emergencyContact.relationship?.trim() &&
        data.emergencyContact.phone?.trim()
      )
    }
    return true
  },
  {
    message: 'Emergency contact name, relationship, and phone are required if emergency contact is provided',
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

export type PatientFormData = z.infer<typeof patientFormSchema>
