import { describe, it, expect } from 'vitest'
import { patientFormSchema } from './patient-form-schema'

describe('patientFormSchema', () => {
  describe('required fields', () => {
    const getMinimalValidData = () => ({
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
        conditions: [],
        lastVisit: '2024-01-15',
      },
      insurance: {
        provider: 'Blue Cross',
        policyNumber: 'POL123456',
        copay: 25,
      },
    })

    it('should reject empty firstName', () => {
      const data = { ...getMinimalValidData(), firstName: '' }
      const result = patientFormSchema.safeParse(data)
      expect(result.success).toBe(false)
      if (!result.success) {
        const firstNameError = result.error.issues.find(e => e.path.includes('firstName'))
        expect(firstNameError).toBeDefined()
        expect(firstNameError?.message).toContain('required')
      }
    })

    it('should reject missing firstName', () => {
      const data = { ...getMinimalValidData() }
      delete (data as any).firstName
      const result = patientFormSchema.safeParse(data)
      expect(result.success).toBe(false)
      if (!result.success) {
        const firstNameError = result.error.issues.find(e => e.path.includes('firstName'))
        expect(firstNameError).toBeDefined()
      }
    })

    it('should reject empty lastName', () => {
      const data = { ...getMinimalValidData(), lastName: '' }
      const result = patientFormSchema.safeParse(data)
      expect(result.success).toBe(false)
      if (!result.success) {
        const lastNameError = result.error.issues.find(e => e.path.includes('lastName'))
        expect(lastNameError).toBeDefined()
        expect(lastNameError?.message).toContain('required')
      }
    })

    it('should reject missing lastName', () => {
      const data = { ...getMinimalValidData() }
      delete (data as any).lastName
      const result = patientFormSchema.safeParse(data)
      expect(result.success).toBe(false)
      if (!result.success) {
        const lastNameError = result.error.issues.find(e => e.path.includes('lastName'))
        expect(lastNameError).toBeDefined()
      }
    })

    it('should reject empty dateOfBirth', () => {
      const data = { ...getMinimalValidData(), dateOfBirth: '' }
      const result = patientFormSchema.safeParse(data)
      expect(result.success).toBe(false)
      if (!result.success) {
        const dobError = result.error.issues.find(e => e.path.includes('dateOfBirth'))
        expect(dobError).toBeDefined()
        expect(dobError?.message).toContain('required')
      }
    })

    it('should reject missing dateOfBirth', () => {
      const data = { ...getMinimalValidData() }
      delete (data as any).dateOfBirth
      const result = patientFormSchema.safeParse(data)
      expect(result.success).toBe(false)
      if (!result.success) {
        const dobError = result.error.issues.find(e => e.path.includes('dateOfBirth'))
        expect(dobError).toBeDefined()
      }
    })

    it('should reject empty email', () => {
      const data = { ...getMinimalValidData(), email: '' }
      const result = patientFormSchema.safeParse(data)
      expect(result.success).toBe(false)
      if (!result.success) {
        const emailError = result.error.issues.find(e => e.path.includes('email'))
        expect(emailError).toBeDefined()
      }
    })

    it('should reject missing email', () => {
      const data = { ...getMinimalValidData() }
      delete (data as any).email
      const result = patientFormSchema.safeParse(data)
      expect(result.success).toBe(false)
      if (!result.success) {
        const emailError = result.error.issues.find(e => e.path.includes('email'))
        expect(emailError).toBeDefined()
      }
    })

    it('should reject empty phone', () => {
      const data = { ...getMinimalValidData(), phone: '' }
      const result = patientFormSchema.safeParse(data)
      expect(result.success).toBe(false)
      if (!result.success) {
        const phoneError = result.error.issues.find(e => e.path.includes('phone'))
        expect(phoneError).toBeDefined()
        expect(phoneError?.message).toContain('required')
      }
    })

    it('should reject missing phone', () => {
      const data = { ...getMinimalValidData() }
      delete (data as any).phone
      const result = patientFormSchema.safeParse(data)
      expect(result.success).toBe(false)
      if (!result.success) {
        const phoneError = result.error.issues.find(e => e.path.includes('phone'))
        expect(phoneError).toBeDefined()
      }
    })

    it('should reject missing status', () => {
      const data = { ...getMinimalValidData() }
      delete (data as any).status
      const result = patientFormSchema.safeParse(data)
      expect(result.success).toBe(false)
      if (!result.success) {
        const statusError = result.error.issues.find(e => e.path.includes('status'))
        expect(statusError).toBeDefined()
      }
    })

    it('should reject invalid status value', () => {
      const data = { ...getMinimalValidData(), status: 'invalid' as any }
      const result = patientFormSchema.safeParse(data)
      expect(result.success).toBe(false)
      if (!result.success) {
        const statusError = result.error.issues.find(e => e.path.includes('status'))
        expect(statusError).toBeDefined()
      }
    })

    it('should reject missing lastVisit in medicalInfo', () => {
      const data = { ...getMinimalValidData() }
      delete (data.medicalInfo as any).lastVisit
      const result = patientFormSchema.safeParse(data)
      expect(result.success).toBe(false)
      if (!result.success) {
        const lastVisitError = result.error.issues.find(e => e.path.includes('lastVisit'))
        expect(lastVisitError).toBeDefined()
      }
    })
  })

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

    it('should require relationship when name is provided', () => {
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
          phone: '555-5678',
        },
        medicalInfo: {
          allergies: [],
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
        const contactError = result.error.issues.find(e => e.path.includes('emergencyContact'))
        expect(contactError).toBeDefined()
        expect(contactError?.message).toContain('relationship')
      }
    })

    it('should require phone when name is provided', () => {
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
          phone: null,
        },
        medicalInfo: {
          allergies: [],
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
        const contactError = result.error.issues.find(e => e.path.includes('emergencyContact'))
        expect(contactError).toBeDefined()
        expect(contactError?.message).toContain('phone')
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
    it('should require provider', () => {
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
          conditions: [],
          lastVisit: '2024-01-15',
        },
        insurance: {
          provider: '',
          policyNumber: 'POL123456',
          copay: 25,
        },
      }

      const result = patientFormSchema.safeParse(data)
      expect(result.success).toBe(false)
      if (!result.success) {
        const providerError = result.error.issues.find(e => e.path.includes('provider'))
        expect(providerError).toBeDefined()
        expect(providerError?.message).toContain('required')
      }
    })

    it('should require policy number', () => {
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
          conditions: [],
          lastVisit: '2024-01-15',
        },
        insurance: {
          provider: 'Blue Cross',
          policyNumber: '',
          copay: 25,
        },
      }

      const result = patientFormSchema.safeParse(data)
      expect(result.success).toBe(false)
      if (!result.success) {
        const policyError = result.error.issues.find(e => e.path.includes('policyNumber'))
        expect(policyError).toBeDefined()
        expect(policyError?.message).toContain('required')
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
        const copayError = result.error.issues.find(e => e.path.includes('copay'))
        expect(copayError).toBeDefined()
        expect(copayError?.message).toContain('0 or greater')
      }
    })

    it('should require deductible to be 0 or greater when provided', () => {
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
          conditions: [],
          lastVisit: '2024-01-15',
        },
        insurance: {
          provider: 'Blue Cross',
          policyNumber: 'POL123456',
          copay: 25,
          deductible: -100,
        },
      }

      const result = patientFormSchema.safeParse(data)
      expect(result.success).toBe(false)
      if (!result.success) {
        const deductibleError = result.error.issues.find(e => e.path.includes('deductible'))
        expect(deductibleError).toBeDefined()
        expect(deductibleError?.message).toContain('0 or greater')
      }
    })

    it('should allow deductible to be 0', () => {
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
          conditions: [],
          lastVisit: '2024-01-15',
        },
        insurance: {
          provider: 'Blue Cross',
          policyNumber: 'POL123456',
          copay: 25,
          deductible: 0,
        },
      }

      const result = patientFormSchema.safeParse(data)
      expect(result.success).toBe(true)
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

