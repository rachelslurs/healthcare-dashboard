import { memo, useCallback } from 'react'
import { Control, Controller, UseFormRegister, FieldErrors } from 'react-hook-form'
import { Fieldset, Legend, FieldGroup, Field, Label, ErrorMessage } from '@/components/ui/fieldset'
import { Input } from '@/components/ui/input'
import type { PatientFormData } from './patient-form-schema'

interface InsuranceInformationSectionProps {
  register: UseFormRegister<PatientFormData>
  control: Control<PatientFormData>
  errors: FieldErrors<PatientFormData>
}

function InsuranceInformationSection({
  register,
  control,
  errors,
}: InsuranceInformationSectionProps) {
  const handleCopayChange = useCallback(
    (onChange: (value: number) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(parseFloat(e.target.value) || 0)
    },
    []
  )

  const handleDeductibleChange = useCallback(
    (onChange: (value: number | undefined) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value ? parseFloat(e.target.value) : undefined)
    },
    []
  )
  return (
    <Fieldset>
      <Legend>Insurance Information</Legend>
      <FieldGroup>
        <Field>
          <Label>
            Provider <span className='text-red-500'>*</span>
          </Label>
          <Input
            type='text'
            {...register('insurance.provider')}
            placeholder='Blue Cross Blue Shield'
          />
          {errors.insurance?.provider && (
            <ErrorMessage>{errors.insurance.provider.message}</ErrorMessage>
          )}
        </Field>

        <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
          <Field>
            <Label>
              Policy Number <span className='text-red-500'>*</span>
            </Label>
            <Input
              type='text'
              {...register('insurance.policyNumber')}
              placeholder='POL123456'
            />
            {errors.insurance?.policyNumber && (
              <ErrorMessage>{errors.insurance.policyNumber.message}</ErrorMessage>
            )}
          </Field>

          <Field>
            <Label>Group Number</Label>
            <Input
              type='text'
              {...register('insurance.groupNumber')}
              placeholder='GRP789'
            />
          </Field>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
          <Field>
            <Label>Effective Date</Label>
            <Input
              type='date'
              {...register('insurance.effectiveDate')}
            />
          </Field>

          <Field>
            <Label>Expiration Date</Label>
            <Input
              type='date'
              {...register('insurance.expirationDate')}
            />
          </Field>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
          <Field>
            <Label>
              Copay ($) <span className='text-red-500'>*</span>
            </Label>
            <Controller
              name='insurance.copay'
              control={control}
              render={({ field }) => (
                <Input
                  type='number'
                  step='0.01'
                  min='0'
                  value={field.value}
                  onChange={handleCopayChange(field.onChange)}
                  placeholder='25.00'
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
              name='insurance.deductible'
              control={control}
              render={({ field }) => (
                <Input
                  type='number'
                  step='0.01'
                  min='0'
                  value={field.value ?? ''}
                  onChange={handleDeductibleChange(field.onChange)}
                  placeholder='1000.00'
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
  )
}

export default memo(InsuranceInformationSection)
