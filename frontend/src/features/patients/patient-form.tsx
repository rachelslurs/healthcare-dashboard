import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import type { Patient, Address, EmergencyContact, Medication, InsuranceInfo } from './types'
import { getPatient, createPatient, updatePatient } from './api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Fieldset, Legend, FieldGroup, Field, Label, Description, ErrorMessage } from '@/components/ui/fieldset'

interface PatientFormProps {
  patient?: Patient
  patientId?: string
  isEdit?: boolean
}

// Default form values
const defaultFormData = {
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  email: '',
  phone: '',
  status: 'active' as const,
  address: undefined as Address | undefined,
  emergencyContact: {
    name: '',
    relationship: '',
    phone: '',
    email: '',
  },
  medicalInfo: {
    allergies: [] as string[],
    currentMedications: [] as Medication[],
    conditions: [] as string[],
    bloodType: 'O+' as const,
    lastVisit: '',
    status: 'active' as const,
  },
  insurance: {
    provider: '',
    policyNumber: '',
    groupNumber: '',
    effectiveDate: undefined as string | undefined,
    expirationDate: '',
    copay: 0,
    deductible: undefined as number | undefined,
  },
  documents: [] as Patient['documents'],
}

export default function PatientForm({ patient, patientId, isEdit = false }: PatientFormProps) {
  const navigate = useNavigate()
  const [formData, setFormData] = useState<typeof defaultFormData>(defaultFormData)
  const [isLoading, setIsLoading] = useState(isEdit && !patient)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [allergyInput, setAllergyInput] = useState('')
  const [conditionInput, setConditionInput] = useState('')

  // Fetch patient data for edit mode
  useEffect(() => {
    if (isEdit && patientId && !patient) {
      const fetchPatientData = async () => {
        setIsLoading(true)
        setError(null)
        try {
          const data = await getPatient(patientId)
          setFormData({
            firstName: data.firstName,
            lastName: data.lastName,
            dateOfBirth: data.dateOfBirth,
            email: data.email,
            phone: data.phone,
            status: data.status,
            address: data.address,
            emergencyContact: data.emergencyContact,
            medicalInfo: data.medicalInfo,
            insurance: data.insurance,
            documents: data.documents,
          })
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to load patient data')
        } finally {
          setIsLoading(false)
        }
      }
      fetchPatientData()
    } else if (isEdit && patient) {
      // If patient data is passed as prop, use it directly
      setFormData({
        firstName: patient.firstName,
        lastName: patient.lastName,
        dateOfBirth: patient.dateOfBirth,
        email: patient.email,
        phone: patient.phone,
        status: patient.status,
        address: patient.address,
        emergencyContact: patient.emergencyContact,
        medicalInfo: patient.medicalInfo,
        insurance: patient.insurance,
        documents: patient.documents,
      })
      setIsLoading(false)
    }
  }, [isEdit, patientId, patient])

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleNestedChange = (section: string, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value,
      },
    }))
  }

  const handleAddressChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      address: {
        ...(prev.address || { street: '', city: '', state: '', zipCode: '', country: 'USA' }),
        [field]: value,
      },
    }))
  }

  const handleAddAllergy = () => {
    if (allergyInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        medicalInfo: {
          ...prev.medicalInfo,
          allergies: [...prev.medicalInfo.allergies, allergyInput.trim()],
        },
      }))
      setAllergyInput('')
    }
  }

  const handleRemoveAllergy = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      medicalInfo: {
        ...prev.medicalInfo,
        allergies: prev.medicalInfo.allergies.filter((_, i) => i !== index),
      },
    }))
  }

  const handleAddCondition = () => {
    if (conditionInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        medicalInfo: {
          ...prev.medicalInfo,
          conditions: [...prev.medicalInfo.conditions, conditionInput.trim()],
        },
      }))
      setConditionInput('')
    }
  }

  const handleRemoveCondition = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      medicalInfo: {
        ...prev.medicalInfo,
        conditions: prev.medicalInfo.conditions.filter((_, i) => i !== index),
      },
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // Prepare form data, converting empty address to undefined
      const submitData = {
        ...formData,
        address: formData.address && 
          formData.address.street && 
          formData.address.city && 
          formData.address.state && 
          formData.address.zipCode
          ? formData.address
          : undefined,
      }

      if (isEdit && patientId) {
        await updatePatient(patientId, submitData)
        navigate({ to: `/patients/${patientId}` })
      } else {
        const newPatient = await createPatient(submitData)
        navigate({ to: `/patients/${newPatient.id}` })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save patient')
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    if (isEdit && patientId) {
      navigate({ to: `/patients/${patientId}` })
    } else {
      navigate({ to: '/patients' })
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-2">
            <div className="size-8 animate-spin rounded-full border-4 border-neutral-300 border-t-neutral-600" />
            <p className="text-sm text-gray-600">Loading patient information...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">{isEdit ? 'Edit Patient' : 'New Patient'}</h1>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4">
          <p className="text-red-800 font-medium">Error</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <Fieldset>
          <Legend>Basic Information</Legend>
          <FieldGroup>
            <Field>
              <Label>
                First Name <span className="text-red-500">*</span>
              </Label>
              <Input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                required
                placeholder="John"
              />
            </Field>

            <Field>
              <Label>
                Last Name <span className="text-red-500">*</span>
              </Label>
              <Input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                required
                placeholder="Doe"
              />
            </Field>

            <Field>
              <Label>
                Date of Birth <span className="text-red-500">*</span>
              </Label>
              <Input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                required
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Field>
                <Label>
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  placeholder="john.doe@example.com"
                />
              </Field>

              <Field>
                <Label>
                  Phone <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  required
                  placeholder="(555) 123-4567"
                />
              </Field>
            </div>

            <Field>
              <Label>
                Status <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                required
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="archived">Archived</option>
              </Select>
            </Field>
          </FieldGroup>
        </Fieldset>

        {/* Address */}
        <Fieldset>
          <Legend>Address (Optional)</Legend>
          <FieldGroup>
            <Field>
              <Label>Street</Label>
              <Input
                type="text"
                value={formData.address?.street || ''}
                onChange={(e) => handleAddressChange('street', e.target.value)}
                placeholder="123 Main St"
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Field>
                <Label>City</Label>
                <Input
                  type="text"
                  value={formData.address?.city || ''}
                  onChange={(e) => handleAddressChange('city', e.target.value)}
                  placeholder="New York"
                />
              </Field>

              <Field>
                <Label>State</Label>
                <Input
                  type="text"
                  value={formData.address?.state || ''}
                  onChange={(e) => handleAddressChange('state', e.target.value)}
                  placeholder="NY"
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Field>
                <Label>ZIP Code</Label>
                <Input
                  type="text"
                  value={formData.address?.zipCode || ''}
                  onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                  placeholder="10001"
                />
              </Field>

              <Field>
                <Label>Country</Label>
                <Input
                  type="text"
                  value={formData.address?.country || 'USA'}
                  onChange={(e) => handleAddressChange('country', e.target.value)}
                  placeholder="USA"
                />
              </Field>
            </div>
          </FieldGroup>
        </Fieldset>

        {/* Emergency Contact */}
        <Fieldset>
          <Legend>Emergency Contact</Legend>
          <FieldGroup>
            <Field>
              <Label>
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                type="text"
                value={formData.emergencyContact.name}
                onChange={(e) => handleNestedChange('emergencyContact', 'name', e.target.value)}
                required
                placeholder="Jane Doe"
              />
            </Field>

            <Field>
              <Label>
                Relationship <span className="text-red-500">*</span>
              </Label>
              <Input
                type="text"
                value={formData.emergencyContact.relationship}
                onChange={(e) => handleNestedChange('emergencyContact', 'relationship', e.target.value)}
                required
                placeholder="Spouse"
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Field>
                <Label>
                  Phone <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="tel"
                  value={formData.emergencyContact.phone}
                  onChange={(e) => handleNestedChange('emergencyContact', 'phone', e.target.value)}
                  required
                  placeholder="(555) 123-4567"
                />
              </Field>

              <Field>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.emergencyContact.email || ''}
                  onChange={(e) => handleNestedChange('emergencyContact', 'email', e.target.value)}
                  placeholder="jane.doe@example.com"
                />
              </Field>
            </div>
          </FieldGroup>
        </Fieldset>

        {/* Medical Information */}
        <Fieldset>
          <Legend>Medical Information</Legend>
          <FieldGroup>
            <Field>
              <Label>Allergies</Label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={allergyInput}
                    onChange={(e) => setAllergyInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddAllergy()
                      }
                    }}
                    placeholder="Enter allergy and press Enter or click Add"
                  />
                  <Button type="button" onClick={handleAddAllergy} outline>
                    Add
                  </Button>
                </div>
                {formData.medicalInfo.allergies.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.medicalInfo.allergies.map((allergy, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                      >
                        {allergy}
                        <button
                          type="button"
                          onClick={() => handleRemoveAllergy(index)}
                          className="text-blue-700 hover:text-blue-900"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Field>

            <Field>
              <Label>Medical Conditions</Label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={conditionInput}
                    onChange={(e) => setConditionInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddCondition()
                      }
                    }}
                    placeholder="Enter condition and press Enter or click Add"
                  />
                  <Button type="button" onClick={handleAddCondition} outline>
                    Add
                  </Button>
                </div>
                {formData.medicalInfo.conditions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.medicalInfo.conditions.map((condition, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm"
                      >
                        {condition}
                        <button
                          type="button"
                          onClick={() => handleRemoveCondition(index)}
                          className="text-purple-700 hover:text-purple-900"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Field>
                <Label>
                  Blood Type <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.medicalInfo.bloodType}
                  onChange={(e) =>
                    handleNestedChange('medicalInfo', 'bloodType', e.target.value as Patient['medicalInfo']['bloodType'])
                  }
                  required
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </Select>
              </Field>

              <Field>
                <Label>
                  Medical Status <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.medicalInfo.status}
                  onChange={(e) =>
                    handleNestedChange('medicalInfo', 'status', e.target.value as Patient['medicalInfo']['status'])
                  }
                  required
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="critical">Critical</option>
                </Select>
              </Field>
            </div>

            <Field>
              <Label>Last Visit</Label>
              <Input
                type="date"
                value={formData.medicalInfo.lastVisit}
                onChange={(e) => handleNestedChange('medicalInfo', 'lastVisit', e.target.value)}
              />
            </Field>

            <Field>
              <Label>Current Medications</Label>
              <Description>Medication management will be available in a future update</Description>
            </Field>
          </FieldGroup>
        </Fieldset>

        {/* Insurance Information */}
        <Fieldset>
          <Legend>Insurance Information</Legend>
          <FieldGroup>
            <Field>
              <Label>
                Provider <span className="text-red-500">*</span>
              </Label>
              <Input
                type="text"
                value={formData.insurance.provider}
                onChange={(e) => handleNestedChange('insurance', 'provider', e.target.value)}
                required
                placeholder="Blue Cross Blue Shield"
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Field>
                <Label>
                  Policy Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="text"
                  value={formData.insurance.policyNumber}
                  onChange={(e) => handleNestedChange('insurance', 'policyNumber', e.target.value)}
                  required
                  placeholder="POL123456"
                />
              </Field>

              <Field>
                <Label>Group Number</Label>
                <Input
                  type="text"
                  value={formData.insurance.groupNumber || ''}
                  onChange={(e) => handleNestedChange('insurance', 'groupNumber', e.target.value)}
                  placeholder="GRP789"
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Field>
                <Label>Effective Date</Label>
                <Input
                  type="date"
                  value={formData.insurance.effectiveDate || ''}
                  onChange={(e) => handleNestedChange('insurance', 'effectiveDate', e.target.value || undefined)}
                />
              </Field>

              <Field>
                <Label>Expiration Date</Label>
                <Input
                  type="date"
                  value={formData.insurance.expirationDate || ''}
                  onChange={(e) => handleNestedChange('insurance', 'expirationDate', e.target.value)}
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Field>
                <Label>
                  Copay ($) <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.insurance.copay}
                  onChange={(e) => handleNestedChange('insurance', 'copay', parseFloat(e.target.value) || 0)}
                  required
                  placeholder="25.00"
                />
              </Field>

              <Field>
                <Label>Deductible ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.insurance.deductible ?? ''}
                  onChange={(e) => handleNestedChange('insurance', 'deductible', e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="1000.00"
                />
              </Field>
            </div>
          </FieldGroup>
        </Fieldset>

        {/* Form Actions */}
        <div className="flex gap-4 justify-end pt-6 border-t">
          <Button type="button" onClick={handleCancel} outline>
            Cancel
          </Button>
          <Button type="submit" color="blue" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : isEdit ? 'Update Patient' : 'Create Patient'}
          </Button>
        </div>
      </form>
    </div>
  )
}
