import { memo } from 'react'
import { UseFormRegister, FieldErrors } from 'react-hook-form'
import { Fieldset, Legend, FieldGroup, Field, Label, ErrorMessage } from '@/components/ui/fieldset'
import { Input } from '@/components/ui/input'
import type { PatientFormData } from './patient-form-schema'

interface EmergencyContactSectionProps {
  register: UseFormRegister<PatientFormData>
  errors: FieldErrors<PatientFormData>
  hasEmergencyContact: boolean
}

function EmergencyContactSection({
  register,
  errors,
  hasEmergencyContact,
}: EmergencyContactSectionProps) {
  return (
    <Fieldset>
      <Legend>Emergency Contact</Legend>
      <FieldGroup>
        <Field>
          <Label>
            Name {hasEmergencyContact && <span className='text-red-500'>*</span>}
          </Label>
          <Input
            type='text'
            {...register('emergencyContact.name')}
            placeholder='Jane Doe'
          />
          {errors.emergencyContact?.name && (
            <ErrorMessage>{errors.emergencyContact.name.message}</ErrorMessage>
          )}
        </Field>

        <Field>
          <Label>
            Relationship {hasEmergencyContact && <span className='text-red-500'>*</span>}
          </Label>
          <Input
            type='text'
            {...register('emergencyContact.relationship')}
            placeholder='Spouse'
          />
          {errors.emergencyContact?.relationship && (
            <ErrorMessage>{errors.emergencyContact.relationship.message}</ErrorMessage>
          )}
        </Field>

        <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
          <Field>
            <Label>
              Phone {hasEmergencyContact && <span className='text-red-500'>*</span>}
            </Label>
            <Input
              type='tel'
              {...register('emergencyContact.phone')}
              placeholder='(555) 123-4567'
            />
            {errors.emergencyContact?.phone && (
              <ErrorMessage>{errors.emergencyContact.phone.message}</ErrorMessage>
            )}
          </Field>

          <Field>
            <Label>Email</Label>
            <Input
              type='email'
              {...register('emergencyContact.email')}
              placeholder='jane.doe@example.com'
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
  )
}

export default memo(EmergencyContactSection)
