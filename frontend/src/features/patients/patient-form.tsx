import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { useForm, Controller, useWatch, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Patient } from './types'
import { getPatient, createPatient, updatePatient, uploadPatientPhoto } from './api'
import { toast } from '@/lib/toast'
import { patientFormSchema, type PatientFormData } from './patient-form-schema'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Convert ISO date string to YYYY-MM-DD format for date input
const formatDateForInput = (dateString: string | undefined): string => {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    // Check if date is valid
    if (isNaN(date.getTime())) return ''
    // Return YYYY-MM-DD format
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  } catch {
    return ''
  }
}
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Fieldset, Legend, FieldGroup, Field, Label, Description, ErrorMessage } from '@/components/ui/fieldset'
import PhotoPreview from './photo-preview'

interface PatientFormProps {
  patient?: Patient
  patientId?: string
  isEdit?: boolean
}

// Default form values - must match PatientFormData structure exactly
const defaultFormValues: PatientFormData = {
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  email: '',
  phone: '',
  status: 'active',
  address: {
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
  },
  emergencyContact: {
    name: '',
    relationship: '',
    phone: '',
    email: '',
  },
  medicalInfo: {
    allergies: [],
    currentMedications: [],
    conditions: [],
    bloodType: undefined,
    lastVisit: '',
  },
  insurance: {
    provider: '',
    policyNumber: '',
    groupNumber: undefined,
    effectiveDate: undefined,
    expirationDate: '',
    copay: 0,
    deductible: undefined,
  },
}

export default function PatientForm({ patient, patientId, isEdit = false }: PatientFormProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isLoading, setIsLoading] = useState(isEdit && !patient)
  const [allergyInput, setAllergyInput] = useState('')
  const [conditionInput, setConditionInput] = useState('')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState<string | undefined>(undefined)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<PatientFormData>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: defaultFormValues,
    mode: 'onBlur', // Validate on blur for better UX
  })

  const {
    register,
    control,
    formState: { errors, isSubmitting },
    setValue,
    reset,
  } = form

  // Watch emergency contact to show conditional required fields
  const emergencyContact = useWatch({ control, name: 'emergencyContact' })
  
  // Watch allergies and conditions to avoid multiple watch calls
  const allergies = useWatch({ control, name: 'medicalInfo.allergies' }) || []
  const conditions = useWatch({ control, name: 'medicalInfo.conditions' }) || []

  // Fetch patient data for edit mode
  useEffect(() => {
    if (isEdit && patientId && !patient) {
      const fetchPatientData = async () => {
        setIsLoading(true)
        try {
          const data = await getPatient(patientId)
          reset({
            firstName: data.firstName,
            lastName: data.lastName,
            dateOfBirth: formatDateForInput(data.dateOfBirth),
            email: data.email,
            phone: data.phone,
            status: data.status,
            address: data.address || {
              street: '',
              city: '',
              state: '',
              zipCode: '',
              country: 'USA',
            },
            emergencyContact: data.emergencyContact || {
              name: '',
              relationship: '',
              phone: '',
              email: '',
            },
            medicalInfo: {
              ...data.medicalInfo,
              bloodType: data.medicalInfo.bloodType ?? undefined,
            },
            insurance: {
              ...data.insurance,
              groupNumber: data.insurance.groupNumber ?? undefined,
              effectiveDate: data.insurance.effectiveDate ?? undefined,
              expirationDate: data.insurance.expirationDate ?? '',
              copay: data.insurance.copay,
              deductible: data.insurance.deductible ?? undefined,
            },
          })
          setCurrentPhotoUrl(data.photoUrl)
        } catch (err) {
          toast({
            title: 'Error',
            description: err instanceof Error ? err.message : 'Failed to load patient data',
            variant: 'destructive',
          })
        } finally {
          setIsLoading(false)
        }
      }
      fetchPatientData()
    } else if (isEdit && patient) {
      // If patient data is passed as prop, use it directly
      reset({
        firstName: patient.firstName,
        lastName: patient.lastName,
        dateOfBirth: formatDateForInput(patient.dateOfBirth),
        email: patient.email,
        phone: patient.phone,
        status: patient.status,
        address: patient.address || {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'USA',
        },
        emergencyContact: patient.emergencyContact || {
          name: '',
          relationship: '',
          phone: '',
          email: '',
        },
        medicalInfo: {
          ...patient.medicalInfo,
          bloodType: patient.medicalInfo.bloodType ?? undefined,
        },
        insurance: {
          ...patient.insurance,
          groupNumber: patient.insurance.groupNumber ?? undefined,
          effectiveDate: patient.insurance.effectiveDate ?? undefined,
          expirationDate: patient.insurance.expirationDate ?? '',
          copay: patient.insurance.copay,
          deductible: patient.insurance.deductible ?? undefined,
        },
      })
      setCurrentPhotoUrl(patient.photoUrl)
      setIsLoading(false)
    }
  }, [isEdit, patientId, patient, reset])

  const handleAddAllergy = useCallback(() => {
    if (allergyInput.trim()) {
      setValue('medicalInfo.allergies', [...allergies, allergyInput.trim()], {
        shouldValidate: true,
      })
      setAllergyInput('')
    }
  }, [allergyInput, allergies, setValue])

  const handleRemoveAllergy = useCallback((index: number) => {
    setValue(
      'medicalInfo.allergies',
      allergies.filter((_, i) => i !== index),
      { shouldValidate: true }
    )
  }, [allergies, setValue])

  const handleAddCondition = useCallback(() => {
    if (conditionInput.trim()) {
      setValue('medicalInfo.conditions', [...conditions, conditionInput.trim()], {
        shouldValidate: true,
      })
      setConditionInput('')
    }
  }, [conditionInput, conditions, setValue])

  const handleRemoveCondition = useCallback((index: number) => {
    setValue(
      'medicalInfo.conditions',
      conditions.filter((_, i) => i !== index),
      { shouldValidate: true }
    )
  }, [conditions, setValue])

  const handlePhotoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png']
    if (!validTypes.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Please select a valid image file (JPEG or PNG)',
        variant: 'destructive',
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Image file size must be less than 5MB',
        variant: 'destructive',
      })
      return
    }

    setPhotoFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }, [])

  const handleRemovePhoto = useCallback(() => {
    setPhotoFile(null)
    setPhotoPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [])

  const onSubmit: SubmitHandler<PatientFormData> = async (formData) => {
    try {
      // Prepare form data, converting empty address to undefined
      const submitData = {
        ...formData,
        address: formData.address && 
          formData.address.street?.trim() && 
          formData.address.city?.trim() && 
          formData.address.state?.trim() && 
          formData.address.zipCode?.trim()
          ? formData.address
          : undefined,
        // Convert empty emergency contact to undefined
        emergencyContact: formData.emergencyContact &&
          formData.emergencyContact.name?.trim() &&
          formData.emergencyContact.relationship?.trim() &&
          formData.emergencyContact.phone?.trim()
          ? formData.emergencyContact
          : undefined,
        // Ensure lastVisit is a string (not undefined)
        medicalInfo: {
          ...formData.medicalInfo,
          lastVisit: formData.medicalInfo.lastVisit || '',
        },
        // Documents field is not used in the form, but required by API
        documents: [],
      }

      if (isEdit && patientId) {
        await updatePatient(patientId, submitData)
        
        // Upload photo if a new one was selected
        if (photoFile) {
          try {
            await uploadPatientPhoto(patientId, photoFile)
          } catch (photoErr) {
            // Show error for photo upload but still navigate since patient was updated
            toast({
              title: 'Patient updated, but photo upload failed',
              description: `Patient information was saved successfully, but the photo could not be uploaded: ${photoErr instanceof Error ? photoErr.message : 'Unknown error'}`,
              variant: 'destructive',
            })
          }
        }
        
        // Invalidate activities query cache to refresh the activities list
        queryClient.invalidateQueries({ queryKey: ['activities'] })
        
        toast({
          title: 'Patient updated',
          description: 'Patient information has been successfully updated.',
        })
        
        navigate({ to: `/patients/${patientId}` })
      } else {
        const newPatient = await createPatient(submitData)
        
        // Invalidate activities query cache to refresh the activities list
        queryClient.invalidateQueries({ queryKey: ['activities'] })
        
        toast({
          title: 'Patient created',
          description: `${submitData.firstName} ${submitData.lastName} has been successfully added to the system.`,
        })
        
        navigate({ to: `/patients/${newPatient.id}` })
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save patient'
      
      toast({
        title: isEdit ? 'Failed to update patient' : 'Failed to create patient',
        description: errorMessage,
        variant: 'destructive',
      })
    }
  }

  const handleCancel = useCallback(() => {
    if (isEdit && patientId) {
      navigate({ to: `/patients/${patientId}` })
    } else {
      navigate({ to: '/patients' })
    }
  }, [isEdit, patientId, navigate])

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

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                {...register('firstName')}
                placeholder="John"
              />
              {errors.firstName && (
                <ErrorMessage>{errors.firstName.message}</ErrorMessage>
              )}
            </Field>

            <Field>
              <Label>
                Last Name <span className="text-red-500">*</span>
              </Label>
              <Input
                type="text"
                {...register('lastName')}
                placeholder="Doe"
              />
              {errors.lastName && (
                <ErrorMessage>{errors.lastName.message}</ErrorMessage>
              )}
            </Field>

            <Field>
              <Label>
                Date of Birth <span className="text-red-500">*</span>
              </Label>
              <Input
                type="date"
                {...register('dateOfBirth')}
              />
              {errors.dateOfBirth && (
                <ErrorMessage>{errors.dateOfBirth.message}</ErrorMessage>
              )}
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Field>
                <Label>
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="email"
                  {...register('email')}
                  placeholder="john.doe@example.com"
                />
                {errors.email && (
                  <ErrorMessage>{errors.email.message}</ErrorMessage>
                )}
              </Field>

              <Field>
                <Label>
                  Phone <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="tel"
                  {...register('phone')}
                  placeholder="(555) 123-4567"
                />
                {errors.phone && (
                  <ErrorMessage>{errors.phone.message}</ErrorMessage>
                )}
              </Field>
            </div>

            <Field>
              <Label>
                Status <span className="text-red-500">*</span>
              </Label>
              <Select {...register('status')}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="archived">Archived</option>
              </Select>
              {errors.status && (
                <ErrorMessage>{errors.status.message}</ErrorMessage>
              )}
            </Field>
          </FieldGroup>
        </Fieldset>

        {/* Photo Upload - Edit Mode Only */}
        {isEdit && (
          <Fieldset>
            <Legend>Patient Photo</Legend>
            <FieldGroup>
              <Field>
                <Label>Photo</Label>
                <div className="space-y-4">
                  {/* Photo Preview */}
                  {(photoPreview || currentPhotoUrl) && (
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <PhotoPreview 
                          photoPreview={photoPreview}
                          currentPhotoUrl={currentPhotoUrl}
                          apiBaseUrl={API_BASE_URL}
                        />
                      </div>
                      {photoFile && (
                        <Button
                          type="button"
                          onClick={handleRemovePhoto}
                          outline
                        >
                          Remove New Photo
                        </Button>
                      )}
                    </div>
                  )}
                  
                  {/* File Input */}
                  <div className="flex items-center gap-4">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png"
                      onChange={handlePhotoChange}
                      className="block w-full text-sm text-neutral-600
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-lg file:border-0
                        file:text-sm file:font-semibold
                        file:bg-neutral-100 file:text-neutral-700
                        hover:file:bg-neutral-200
                        file:cursor-pointer"
                    />
                  </div>
                  <Description>
                    Upload a patient photo (JPEG or PNG, max 5MB). This will replace any existing photo.
                  </Description>
                </div>
              </Field>
            </FieldGroup>
          </Fieldset>
        )}

        {/* Address */}
        <Fieldset>
          <Legend>Address (Optional)</Legend>
          <FieldGroup>
            <Field>
              <Label>Street</Label>
              <Input
                type="text"
                {...register('address.street')}
                placeholder="123 Main St"
              />
              {errors.address?.street && (
                <ErrorMessage>{errors.address.street.message}</ErrorMessage>
              )}
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Field>
                <Label>City</Label>
                <Input
                  type="text"
                  {...register('address.city')}
                  placeholder="New York"
                />
                {errors.address?.city && (
                  <ErrorMessage>{errors.address.city.message}</ErrorMessage>
                )}
              </Field>

              <Field>
                <Label>State</Label>
                <Input
                  type="text"
                  {...register('address.state')}
                  placeholder="NY"
                />
                {errors.address?.state && (
                  <ErrorMessage>{errors.address.state.message}</ErrorMessage>
                )}
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Field>
                <Label>ZIP Code</Label>
                <Input
                  type="text"
                  {...register('address.zipCode')}
                  placeholder="10001"
                />
                {errors.address?.zipCode && (
                  <ErrorMessage>{errors.address.zipCode.message}</ErrorMessage>
                )}
              </Field>

              <Field>
                <Label>Country</Label>
                <Input
                  type="text"
                  {...register('address.country')}
                  placeholder="USA"
                />
              </Field>
            </div>
            {errors.address && typeof errors.address.message === 'string' && (
              <ErrorMessage>{errors.address.message}</ErrorMessage>
            )}
          </FieldGroup>
        </Fieldset>

        {/* Emergency Contact */}
        <Fieldset>
          <Legend>Emergency Contact (Optional)</Legend>
          <FieldGroup>
            <Field>
              <Label>
                Name {emergencyContact && <span className="text-red-500">*</span>}
              </Label>
              <Input
                type="text"
                {...register('emergencyContact.name')}
                placeholder="Jane Doe"
              />
              {errors.emergencyContact?.name && (
                <ErrorMessage>{errors.emergencyContact.name.message}</ErrorMessage>
              )}
            </Field>

            <Field>
              <Label>
                Relationship {emergencyContact && <span className="text-red-500">*</span>}
              </Label>
              <Input
                type="text"
                {...register('emergencyContact.relationship')}
                placeholder="Spouse"
              />
              {errors.emergencyContact?.relationship && (
                <ErrorMessage>{errors.emergencyContact.relationship.message}</ErrorMessage>
              )}
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Field>
                <Label>
                  Phone {emergencyContact && <span className="text-red-500">*</span>}
                </Label>
                <Input
                  type="tel"
                  {...register('emergencyContact.phone')}
                  placeholder="(555) 123-4567"
                />
                {errors.emergencyContact?.phone && (
                  <ErrorMessage>{errors.emergencyContact.phone.message}</ErrorMessage>
                )}
              </Field>

              <Field>
                <Label>Email</Label>
                <Input
                  type="email"
                  {...register('emergencyContact.email')}
                  placeholder="jane.doe@example.com"
                />
                {errors.emergencyContact?.email && (
                  <ErrorMessage>{errors.emergencyContact.email.message}</ErrorMessage>
                )}
              </Field>
            </div>
            {errors.emergencyContact && typeof errors.emergencyContact.message === 'string' && (
              <ErrorMessage>{errors.emergencyContact.message}</ErrorMessage>
            )}
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
                {allergies.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {allergies.map((allergy, index) => (
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
                {conditions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {conditions.map((condition, index) => (
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

            <Field>
              <Label>Blood Type</Label>
              <Controller
                name="medicalInfo.bloodType"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value || ''}
                    onChange={(e) => field.onChange(e.target.value || undefined)}
                  >
                    <option value="">Not specified</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </Select>
                )}
              />
            </Field>

            <Field>
              <Label>Last Visit</Label>
              <Input
                type="date"
                {...register('medicalInfo.lastVisit')}
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
                {...register('insurance.provider')}
                placeholder="Blue Cross Blue Shield"
              />
              {errors.insurance?.provider && (
                <ErrorMessage>{errors.insurance.provider.message}</ErrorMessage>
              )}
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Field>
                <Label>
                  Policy Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="text"
                  {...register('insurance.policyNumber')}
                  placeholder="POL123456"
                />
                {errors.insurance?.policyNumber && (
                  <ErrorMessage>{errors.insurance.policyNumber.message}</ErrorMessage>
                )}
              </Field>

              <Field>
                <Label>Group Number</Label>
                <Input
                  type="text"
                  {...register('insurance.groupNumber')}
                  placeholder="GRP789"
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Field>
                <Label>Effective Date</Label>
                <Input
                  type="date"
                  {...register('insurance.effectiveDate')}
                />
              </Field>

              <Field>
                <Label>Expiration Date</Label>
                <Input
                  type="date"
                  {...register('insurance.expirationDate')}
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Field>
                <Label>
                  Copay ($) <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="insurance.copay"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={field.value}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      placeholder="25.00"
                    />
                  )}
                />
                {errors.insurance?.copay && (
                  <ErrorMessage>{errors.insurance.copay.message}</ErrorMessage>
                )}
              </Field>

              <Field>
                <Label>Deductible ($)</Label>
                <Controller
                  name="insurance.deductible"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                      placeholder="1000.00"
                    />
                  )}
                />
                {errors.insurance?.deductible && (
                  <ErrorMessage>{errors.insurance.deductible.message}</ErrorMessage>
                )}
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
