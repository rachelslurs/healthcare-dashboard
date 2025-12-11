import { memo } from 'react'
import { UseFormRegister, FieldErrors } from 'react-hook-form'
import { Fieldset, Legend, FieldGroup, Field, Label, ErrorMessage } from '@/components/ui/fieldset'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import type { PatientFormData } from './patient-form-schema'

interface BasicInformationSectionProps {
  register: UseFormRegister<PatientFormData>
  errors: FieldErrors<PatientFormData>
}

function BasicInformationSection({
  register,
  errors,
}: BasicInformationSectionProps) {
  return (
    <Fieldset>
      <Legend>Basic Information</Legend>
      <FieldGroup>
        <Field>
          <Label>
            First Name <span className='text-red-500'>*</span>
          </Label>
          <Input
            type='text'
            {...register('firstName')}
            placeholder='John'
          />
          {errors.firstName && (
            <ErrorMessage>{errors.firstName.message}</ErrorMessage>
          )}
        </Field>

        <Field>
          <Label>
            Last Name <span className='text-red-500'>*</span>
          </Label>
          <Input
            type='text'
            {...register('lastName')}
            placeholder='Doe'
          />
          {errors.lastName && (
            <ErrorMessage>{errors.lastName.message}</ErrorMessage>
          )}
        </Field>

        <Field>
          <Label>
            Date of Birth <span className='text-red-500'>*</span>
          </Label>
          <Input
            type='date'
            {...register('dateOfBirth')}
          />
          {errors.dateOfBirth && (
            <ErrorMessage>{errors.dateOfBirth.message}</ErrorMessage>
          )}
        </Field>

        <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
          <Field>
            <Label>
              Email <span className='text-red-500'>*</span>
            </Label>
            <Input
              type='email'
              {...register('email')}
              placeholder='john.doe@example.com'
            />
            {errors.email && (
              <ErrorMessage>{errors.email.message}</ErrorMessage>
            )}
          </Field>

          <Field>
            <Label>
              Phone <span className='text-red-500'>*</span>
            </Label>
            <Input
              type='tel'
              {...register('phone')}
              placeholder='(555) 123-4567'
            />
            {errors.phone && (
              <ErrorMessage>{errors.phone.message}</ErrorMessage>
            )}
          </Field>
        </div>

        <Field>
          <Label>
            Status <span className='text-red-500'>*</span>
          </Label>
          <Select {...register('status')}>
            <option value='active'>Active</option>
            <option value='inactive'>Inactive</option>
            <option value='archived'>Archived</option>
          </Select>
          {errors.status && (
            <ErrorMessage>{errors.status.message}</ErrorMessage>
          )}
        </Field>
      </FieldGroup>
    </Fieldset>
  )
}

export default memo(BasicInformationSection)
