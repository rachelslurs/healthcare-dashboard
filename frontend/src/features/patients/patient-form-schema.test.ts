import { describe, it, expect } from 'vitest'
import { patientFormSchema } from './patient-form-schema'

describe('patientFormSchema', () => {
  describe('basic validation', () => {
    it('should validate a complete valid patient form', () => {
      const validData = {
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
        email: 'john.doe@example.com',
        phone: '555-1234',
        status: 'active' as const,
        address: {
          street: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          zipCode: '12345',
          country: 'USA',
        },
        emergencyContact: {
          name: 'Jane Doe',
          relationship: 'Spouse',
          phone: '555-5678',
          email: 'jane.doe@example.com',
        },
        medicalInfo: {
          allergies: ['Peanuts'],
          currentMedications: [],
          conditions: ['Hypertension'],
          bloodType: 'O+' as const,
          lastVisit: '2024-01-15',
        },
        insurance: {
          provider: 'Blue Cross',
          policyNumber: 'POL123456',
          groupNumber: 'GRP789',
          effectiveDate: '2024-01-01',
          expirationDate: '2024-12-31',
          copay: 25,
          deductible: 1000,
        },
      }

      const result = patientFormSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject missing required fields', () => {
      const invalidData = {
        firstName: '',
        lastName: 'Doe',
      }

      const result = patientFormSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.some(e => e.path.includes('firstName'))).toBe(true)
      }
    })

    it('should reject invalid email format', () => {
      const invalidData = {
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
        email: 'invalid-email',
        phone: '555-1234',
        status: 'active' as const,
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: '',
        },
        emergencyContact: {
          name: null,
          relationship: null,
          phone: null,
        },
        medicalInfo: {
          allergies: [],
          currentMedications: [],
          conditions: [],
          lastVisit: '2024-01-15',
        },
        insurance: {
          provider: 'Blue Cross',
          policyNumber: 'POL123456',
          copay: 25,
        },
      }

      const result = patientFormSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.some(e => e.path.includes('email'))).toBe(true)
      }
    })

    it('should reject future date of birth', () => {
      const futureDate = new Date()
      futureDate.setFullYear(futureDate.getFullYear() + 1)
      const invalidData = {
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: futureDate.toISOString().split('T')[0],
        email: 'john.doe@example.com',
        phone: '555-1234',
        status: 'active' as const,
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: '',
        },
        emergencyContact: {
          name: null,
          relationship: null,
          phone: null,
        },
        medicalInfo: {
          allergies: [],
          currentMedications: [],
          conditions: [],
          lastVisit: '2024-01-15',
        },
        insurance: {
          provider: 'Blue Cross',
          policyNumber: 'POL123456',
          copay: 25,
        },
      }

      const result = patientFormSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.some(e => e.path.includes('dateOfBirth'))).toBe(true)
      }
    })
  })

  describe('address validation', () => {
    it('should allow empty address when all fields are empty', () => {
      const data = {
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
        email: 'john.doe@example.com',
        phone: '555-1234',
        status: 'active' as const,
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: '',
        },
        emergencyContact: {
          name: null,
          relationship: null,
          phone: null,
        },
        medicalInfo: {
          allergies: [],
          currentMedications: [],
          conditions: [],
          lastVisit: '2024-01-15',
        },
        insurance: {
          provider: 'Blue Cross',
          policyNumber: 'POL123456',
          copay: 25,
        },
      }

      const result = patientFormSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should require all address fields if any field is filled', () => {
      const data = {
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
        email: 'john.doe@example.com',
        phone: '555-1234',
        status: 'active' as const,
        address: {
          street: '123 Main St',
          city: '',
          state: '',
          zipCode: '',
          country: '',
        },
        emergencyContact: {
          name: null,
          relationship: null,
          phone: null,
        },
        medicalInfo: {
          allergies: [],
          currentMedications: [],
          conditions: [],
          lastVisit: '2024-01-15',
        },
        insurance: {
          provider: 'Blue Cross',
          policyNumber: 'POL123456',
          copay: 25,
        },
      }

      const result = patientFormSchema.safeParse(data)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.some(e => e.path.includes('address'))).toBe(true)
      }
    })
  })

  describe('emergency contact validation', () => {
    it('should allow empty emergency contact when name is null', () => {
      const data = {
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
        email: 'john.doe@example.com',
        phone: '555-1234',
        status: 'active' as const,
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: '',
        },
        emergencyContact: {
          name: null,
          relationship: null,
          phone: null,
        },
        medicalInfo: {
          allergies: [],
          currentMedications: [],
          conditions: [],
          lastVisit: '2024-01-15',
        },
        insurance: {
          provider: 'Blue Cross',
          policyNumber: 'POL123456',
          copay: 25,
        },
      }

      const result = patientFormSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should require relationship and phone when name is provided', () => {
      const data = {
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
        email: 'john.doe@example.com',
        phone: '555-1234',
        status: 'active' as const,
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: '',
        },
        emergencyContact: {
          name: 'Jane Doe',
          relationship: null,
          phone: null,
        },
        medicalInfo: {
          allergies: [],
          currentMedications: [],
          conditions: [],
          lastVisit: '2024-01-15',
        },
        insurance: {
          provider: 'Blue Cross',
          policyNumber: 'POL123456',
          copay: 25,
        },
      }

      const result = patientFormSchema.safeParse(data)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.some(e => e.path.includes('emergencyContact'))).toBe(true)
      }
    })

    it('should allow empty email for emergency contact', () => {
      const data = {
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
        email: 'john.doe@example.com',
        phone: '555-1234',
        status: 'active' as const,
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: '',
        },
        emergencyContact: {
          name: 'Jane Doe',
          relationship: 'Spouse',
          phone: '555-5678',
          email: '',
        },
        medicalInfo: {
          allergies: [],
          currentMedications: [],
          conditions: [],
          lastVisit: '2024-01-15',
        },
        insurance: {
          provider: 'Blue Cross',
          policyNumber: 'POL123456',
          copay: 25,
        },
      }

      const result = patientFormSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should validate email format when email is provided for emergency contact', () => {
      const data = {
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
        email: 'john.doe@example.com',
        phone: '555-1234',
        status: 'active' as const,
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: '',
        },
        emergencyContact: {
          name: 'Jane Doe',
          relationship: 'Spouse',
          phone: '555-5678',
          email: 'invalid-email',
        },
        medicalInfo: {
          allergies: [],
          currentMedications: [],
          conditions: [],
          lastVisit: '2024-01-15',
        },
        insurance: {
          provider: 'Blue Cross',
          policyNumber: 'POL123456',
          copay: 25,
        },
      }

      const result = patientFormSchema.safeParse(data)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.some(e => e.path.includes('emergencyContact') && e.path.includes('email'))).toBe(true)
      }
    })
  })

  describe('insurance validation', () => {
    it('should require provider and policy number', () => {
      const data = {
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
        email: 'john.doe@example.com',
        phone: '555-1234',
        status: 'active' as const,
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: '',
        },
        emergencyContact: {
          name: null,
          relationship: null,
          phone: null,
        },
        medicalInfo: {
          allergies: [],
          currentMedications: [],
          conditions: [],
          lastVisit: '2024-01-15',
        },
        insurance: {
          provider: '',
          policyNumber: '',
          copay: 25,
        },
      }

      const result = patientFormSchema.safeParse(data)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.some(e => e.path.includes('insurance'))).toBe(true)
      }
    })

    it('should require copay to be 0 or greater', () => {
      const data = {
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
        email: 'john.doe@example.com',
        phone: '555-1234',
        status: 'active' as const,
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: '',
        },
        emergencyContact: {
          name: null,
          relationship: null,
          phone: null,
        },
        medicalInfo: {
          allergies: [],
          currentMedications: [],
          conditions: [],
          lastVisit: '2024-01-15',
        },
        insurance: {
          provider: 'Blue Cross',
          policyNumber: 'POL123456',
          copay: -10,
        },
      }

      const result = patientFormSchema.safeParse(data)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.some(e => e.path.includes('copay'))).toBe(true)
      }
    })
  })

  describe('medical info validation', () => {
    it('should validate blood type enum', () => {
      const data = {
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
        email: 'john.doe@example.com',
        phone: '555-1234',
        status: 'active' as const,
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: '',
        },
        emergencyContact: {
          name: null,
          relationship: null,
          phone: null,
        },
        medicalInfo: {
          allergies: [],
          currentMedications: [],
          conditions: [],
          bloodType: 'INVALID' as any,
          lastVisit: '2024-01-15',
        },
        insurance: {
          provider: 'Blue Cross',
          policyNumber: 'POL123456',
          copay: 25,
        },
      }

      const result = patientFormSchema.safeParse(data)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.some(e => e.path.includes('bloodType'))).toBe(true)
      }
    })
  })
})

