import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import useUnsavedChanges from '@/hooks/useUnsavedChanges'
import { useForm, Controller, useWatch, useFieldArray, type SubmitHandler } from 'react-hook-form'

import LoadingBrand from '@/components/feedback/loading-brand'
import QueryErrorDisplay from '@/components/errors/query-error-display'
import { Button } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import { formatDateForInput } from '@/lib/date-utils'
import { getErrorMessage } from '@/lib/error-utils'
import { toast } from '@/lib/toast'

import { getPatient, createPatient, updatePatient, uploadPatientPhoto } from './api'
import { patientFormSchema, type PatientFormData } from './patient-form-schema'
import type { Patient } from './types'
import BasicInformationSection from './basic-information-section'
import PhotoUploadSection from './photo-upload-section'
import AddressSection from './address-section'
import EmergencyContactSection from './emergency-contact-section'
import MedicalInformationSection from './medical-information-section'
import InsuranceInformationSection from './insurance-information-section'


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
  // Only keep state for things that can't be in React Hook Form (file objects, previews)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState<string | undefined>(undefined)
  const fileInputRef = useRef<HTMLInputElement>(null)
  // Temporary input state for new items (cleared after adding)
  const [newAllergyInput, setNewAllergyInput] = useState('')
  const [newConditionInput, setNewConditionInput] = useState('')
  const [editingMedicationIndex, setEditingMedicationIndex] = useState<number | null>(null)

  // Fetch patient data for edit mode using React Query
  const {
    data: fetchedPatient,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['patient', patientId],
    queryFn: () => {
      if (!patientId) {
        throw new Error('Patient ID is required')
      }
      return getPatient(patientId)
    },
    enabled: isEdit && !!patientId && !patient, // Only fetch if in edit mode, has patientId, and patient not provided as prop
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  const form = useForm<PatientFormData>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: defaultFormValues,
    mode: 'onBlur', // Validate on blur for better UX
  })

  const {
    register,
    control,
    formState: { errors, isSubmitting, isValid, isDirty },
    setValue,
    reset,
    handleSubmit,
    getValues,
  } = form

  // Use useFieldArray for managing arrays
  const {
    fields: allergyFields,
    append: appendAllergy,
    remove: removeAllergy,
  } = useFieldArray({
    control,
    name: 'medicalInfo.allergies',
  })

  const {
    fields: conditionFields,
    append: appendCondition,
    remove: removeCondition,
  } = useFieldArray({
    control,
    name: 'medicalInfo.conditions',
  })

  const {
    fields: medicationFields,
    append: appendMedication,
    remove: removeMedication,
    update: updateMedication,
  } = useFieldArray({
    control,
    name: 'medicalInfo.currentMedications',
  })

  // Watch emergency contact to show conditional required fields
  // Memoize the computed boolean to prevent unnecessary re-renders when value doesn't change
  const emergencyContact = useWatch({ control, name: 'emergencyContact' })
  const hasEmergencyContact = useMemo(() => {
    if (!emergencyContact) return false
    return !!(emergencyContact.name?.trim() || 
              emergencyContact.relationship?.trim() || 
              emergencyContact.phone?.trim() || 
              emergencyContact.email?.trim())
  }, [emergencyContact])
  
  // Get current values from field arrays
  const allergies = useMemo(() => allergyFields.map((field) => field.value || ''), [allergyFields])
  const conditions = useMemo(() => conditionFields.map((field) => field.value || ''), [conditionFields])
  const medications = useMemo(() => medicationFields.map((field) => field.value), [medicationFields])

  // Use the patient from props or from the query
  const patientData = patient || fetchedPatient
  const hasInitializedForm = useRef<string | undefined>(undefined)
  
  // With proper schema alignment and reset() using keepDefaultValues: false,
  // isDirty should correctly compare against the loaded values, not the initial defaults
  // Only consider unsaved changes if form has been initialized (for edit mode) or if we're in create mode
  const hasUnsavedChanges = (isEdit ? hasInitializedForm.current === patientId : true) && (isDirty || !!photoFile)

  // Block navigation when there are unsaved changes
  const { markNavigationConfirmed } = useUnsavedChanges({
    hasUnsavedChanges,
  })

  // Populate form when patient data is available (only once per patient)
  useEffect(() => {
    if (isEdit && patientData && hasInitializedForm.current !== patientId) {
      reset({
        firstName: patientData.firstName,
        lastName: patientData.lastName,
        dateOfBirth: formatDateForInput(patientData.dateOfBirth),
        email: patientData.email,
        phone: patientData.phone,
        status: patientData.status,
        address: patientData.address || {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'USA',
        },
        emergencyContact: patientData.emergencyContact || {
          name: '',
          relationship: '',
          phone: '',
          email: '',
        },
        medicalInfo: {
          allergies: patientData.medicalInfo.allergies,
          conditions: patientData.medicalInfo.conditions,
          bloodType: patientData.medicalInfo.bloodType ?? undefined,
          lastVisit: patientData.medicalInfo.lastVisit ? formatDateForInput(patientData.medicalInfo.lastVisit) : undefined,
          currentMedications: patientData.medicalInfo.currentMedications || [],
        },
        insurance: {
          ...patientData.insurance,
          groupNumber: patientData.insurance.groupNumber ?? undefined,
          effectiveDate: patientData.insurance.effectiveDate ? formatDateForInput(patientData.insurance.effectiveDate) : undefined,
          expirationDate: patientData.insurance.expirationDate ? formatDateForInput(patientData.insurance.expirationDate) : '',
          copay: patientData.insurance.copay,
          deductible: patientData.insurance.deductible ?? undefined,
        },
      }, {
        keepDefaultValues: false, // Update default values to match reset values
        // This ensures isDirty compares against the loaded patient data, not the initial empty defaults
      })
      
      setCurrentPhotoUrl(patientData.photoUrl)
      hasInitializedForm.current = patientId
    }
  }, [isEdit, patientData, patientId, reset])

  const handleAddAllergy = useCallback(() => {
    if (newAllergyInput.trim()) {
      appendAllergy(newAllergyInput.trim(), { shouldFocus: false })
      setNewAllergyInput('')
    }
  }, [newAllergyInput, appendAllergy])

  const handleRemoveAllergy = useCallback(
    (index: number) => {
      removeAllergy(index)
    },
    [removeAllergy]
  )

  const handleAddCondition = useCallback(() => {
    if (newConditionInput.trim()) {
      appendCondition(newConditionInput.trim(), { shouldFocus: false })
      setNewConditionInput('')
    }
  }, [newConditionInput, appendCondition])

  const handleRemoveCondition = useCallback(
    (index: number) => {
      removeCondition(index)
    },
    [removeCondition]
  )

  // Memoize itemLabel functions to prevent Tags component re-renders
  const allergyItemLabel = useCallback((allergy: string) => `Remove ${allergy}`, [])
  const conditionItemLabel = useCallback((condition: string) => `Remove ${condition}`, [])

  // Medication handlers using useFieldArray
  const handleAppendMedication = useCallback(
    (medication: PatientFormData['medicalInfo']['currentMedications'][0]) => {
      appendMedication(medication, { shouldFocus: false })
    },
    [appendMedication]
  )

  const handleEditMedication = useCallback(
    (index: number) => {
      setEditingMedicationIndex(index)
    },
    []
  )

  const handleRemoveMedication = useCallback(
    (index: number) => {
      removeMedication(index)
      if (editingMedicationIndex === index) {
        setEditingMedicationIndex(null)
      }
    },
    [removeMedication, editingMedicationIndex]
  )

  const handleCancelEditMedication = useCallback(() => {
    setEditingMedicationIndex(null)
  }, [])

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
    console.log('Form submission started', { isEdit, patientId, formData })
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
        // Only require name, relationship, and phone (email is optional)
        emergencyContact: (() => {
          const ec = formData.emergencyContact
          if (!ec) return undefined
          
          const name = ec.name?.trim()
          const relationship = ec.relationship?.trim()
          const phone = ec.phone?.trim()
          
          if (name && relationship && phone) {
            return {
              name,
              relationship,
              phone,
              email: ec.email?.trim() || undefined,
            }
          }
          return undefined
        })(),
        // Schema now matches backend - lastVisit is optional
        medicalInfo: {
          allergies: formData.medicalInfo.allergies,
          conditions: formData.medicalInfo.conditions,
          bloodType: formData.medicalInfo.bloodType,
          lastVisit: formData.medicalInfo.lastVisit || undefined, // Optional, send undefined if empty
          // Medications are now managed in the UI
          currentMedications: formData.medicalInfo.currentMedications || [],
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
              description: `Patient information was saved successfully, but the photo could not be uploaded: ${getErrorMessage(photoErr, 'Unknown error')}`,
              variant: 'destructive',
            })
          }
        }
        
        // Invalidate query caches to refresh the lists and patient detail
        queryClient.invalidateQueries({ queryKey: ['activities'] })
        queryClient.invalidateQueries({ queryKey: ['patients'] })
        queryClient.invalidateQueries({ queryKey: ['patient', patientId] })
        
        toast({
          title: 'Patient updated',
          description: 'Patient information has been successfully updated.',
        })
        
        // Reset form state and photo file after successful submission
        reset(undefined, { keepDefaultValues: false })
        setPhotoFile(null)
        setPhotoPreview(null)
        
        // Mark navigation as confirmed before navigating after successful submission
        markNavigationConfirmed()
        navigate({ to: `/patients/${patientId}` })
      } else {
        const newPatient = await createPatient(submitData)
        
        // Invalidate activities query cache to refresh the activities list
        queryClient.invalidateQueries({ queryKey: ['activities'] })
        
        toast({
          title: 'Patient created',
          description: `${submitData.firstName} ${submitData.lastName} has been successfully added to the system.`,
        })
        
        // Reset form state and photo file after successful submission
        reset(undefined, { keepDefaultValues: false })
        setPhotoFile(null)
        setPhotoPreview(null)
        
        // Mark navigation as confirmed before navigating after successful submission
        markNavigationConfirmed()
        navigate({ to: `/patients/${newPatient.id}` })
      }
    } catch (err) {
      console.error('Form submission error:', err)
      const errorMessage = getErrorMessage(err, 'Failed to save patient')
      console.error('Error message:', errorMessage)
      
      toast({
        title: isEdit ? 'Failed to update patient' : 'Failed to create patient',
        description: errorMessage,
        variant: 'destructive',
      })
    }
  }


  const handleCancel = useCallback(() => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to leave?'
      )
      if (!confirmed) {
        return
      }
      // Mark that user confirmed, so blocker won't trigger
      markNavigationConfirmed()
    }
    
    if (isEdit && patientId) {
      navigate({ to: `/patients/${patientId}` })
    } else {
      navigate({ to: '/patients' })
    }
  }, [isEdit, patientId, navigate, hasUnsavedChanges, markNavigationConfirmed])

  if (isLoading) {
    return (
      <div className='p-6'>
        <div className='flex items-center justify-center min-h-[400px]'>
          <div className='flex flex-col items-center gap-4'>
            <LoadingBrand size='lg' className='text-violet-600' />
            <p className='text-sm text-gray-600'>Loading patient information...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='p-6'>
        <QueryErrorDisplay
          error={error instanceof Error ? error : new Error('Failed to load patient')}
          reset={() => refetch()}
          title='Failed to load patient'
          retryLabel='Try again'
        />
      </div>
    )
  }

  return (
    <div className='p-6 max-w-4xl mx-auto'>
      <Heading level={1} className='mb-6'>{isEdit ? 'Edit Patient' : 'New Patient'}</Heading>

      <form 
        onSubmit={(e) => {
          console.log('Form onSubmit event triggered')
          form.handleSubmit(onSubmit)(e)
        }} 
        className='space-y-8' 
        noValidate
      >
        <BasicInformationSection register={register} errors={errors} />

        {isEdit && (
          <PhotoUploadSection
            photoFile={photoFile}
            photoPreview={photoPreview}
            currentPhotoUrl={currentPhotoUrl}
            onPhotoChange={handlePhotoChange}
            onRemovePhoto={handleRemovePhoto}
            fileInputRef={fileInputRef}
          />
        )}

        <AddressSection register={register} errors={errors} />

        <EmergencyContactSection
          register={register}
          errors={errors}
          hasEmergencyContact={hasEmergencyContact}
        />

        <MedicalInformationSection
          register={register}
          control={control}
          newAllergyInput={newAllergyInput}
          onNewAllergyInputChange={setNewAllergyInput}
          onAddAllergy={handleAddAllergy}
          onRemoveAllergy={handleRemoveAllergy}
          allergyFields={allergyFields}
          allergyItemLabel={allergyItemLabel}
          newConditionInput={newConditionInput}
          onNewConditionInputChange={setNewConditionInput}
          onAddCondition={handleAddCondition}
          onRemoveCondition={handleRemoveCondition}
          conditionFields={conditionFields}
          conditionItemLabel={conditionItemLabel}
          medicationFields={medicationFields}
          onAppendMedication={handleAppendMedication}
          onRemoveMedication={handleRemoveMedication}
          onEditMedication={handleEditMedication}
          onCancelEditMedication={handleCancelEditMedication}
          editingMedicationIndex={editingMedicationIndex}
        />

        <InsuranceInformationSection
          register={register}
          control={control}
          errors={errors}
        />

        {/* Form Actions */}
        <div className='flex gap-4 justify-end pt-6'>
          <Button type='button' onClick={handleCancel} outline>
            Cancel
          </Button>
          <Button 
            type='submit' 
            color='violet' 
            disabled={
              isSubmitting || 
              (isEdit && !isDirty && !photoFile)
            }
            onClick={() => {
              console.log('Submit button clicked', { 
                isSubmitting, 
                isDirty, 
                isValid,
                hasPhotoFile: !!photoFile,
                hasErrors: Object.keys(errors).length > 0, 
                errors 
              })
            }}
          >
            {isSubmitting ? 'Saving...' : isEdit ? 'Update Patient' : 'Create Patient'}
          </Button>
        </div>
      </form>
    </div>
  )
}
