import { memo } from 'react'
import { UseFormRegister, FieldErrors } from 'react-hook-form'
import { Fieldset, Legend, FieldGroup, Field, Label, ErrorMessage } from '@/components/ui/fieldset'
import { Input } from '@/components/ui/input'
import type { PatientFormData } from './patient-form-schema'

interface AddressSectionProps {
  register: UseFormRegister<PatientFormData>
  errors: FieldErrors<PatientFormData>
}

function AddressSection({
  register,
  errors,
}: AddressSectionProps) {
  return (
    <Fieldset>
      <Legend>Address</Legend>
      <FieldGroup>
        <Field>
          <Label>Street</Label>
          <Input
            type='text'
            {...register('address.street')}
            placeholder='123 Main St'
          />
          {errors.address?.street && (
            <ErrorMessage>{errors.address.street.message}</ErrorMessage>
          )}
        </Field>

        <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
          <Field>
            <Label>City</Label>
            <Input
              type='text'
              {...register('address.city')}
              placeholder='New York'
            />
            {errors.address?.city && (
              <ErrorMessage>{errors.address.city.message}</ErrorMessage>
            )}
          </Field>

          <Field>
            <Label>State</Label>
            <Input
              type='text'
              {...register('address.state')}
              placeholder='NY'
            />
            {errors.address?.state && (
              <ErrorMessage>{errors.address.state.message}</ErrorMessage>
            )}
          </Field>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
          <Field>
            <Label>ZIP Code</Label>
            <Input
              type='text'
              {...register('address.zipCode')}
              placeholder='10001'
            />
            {errors.address?.zipCode && (
              <ErrorMessage>{errors.address.zipCode.message}</ErrorMessage>
            )}
          </Field>

          <Field>
            <Label>Country</Label>
            <Input
              type='text'
              {...register('address.country')}
              placeholder='USA'
            />
          </Field>
        </div>
        {errors.address && typeof errors.address.message === 'string' && (
          <ErrorMessage>{errors.address.message}</ErrorMessage>
        )}
      </FieldGroup>
    </Fieldset>
  )
}

export default memo(AddressSection)
