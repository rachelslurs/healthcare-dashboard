import { memo, useCallback } from 'react'
import { Control, Controller, UseFormRegister, FieldArrayWithId } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Fieldset, Legend, FieldGroup, Field, Label } from '@/components/ui/fieldset'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import Tags from './tags'
import MedicationsManager from './medications-manager'
import type { PatientFormData } from './patient-form-schema'

interface MedicalInformationSectionProps {
  register: UseFormRegister<PatientFormData>
  control: Control<PatientFormData>
  // Allergies
  newAllergyInput: string
  onNewAllergyInputChange: (value: string) => void
  onAddAllergy: () => void
  onRemoveAllergy: (index: number) => void
  allergyFields: FieldArrayWithId<PatientFormData, 'medicalInfo.allergies', 'id'>[]
  allergyItemLabel: (allergy: string) => string
  // Conditions
  newConditionInput: string
  onNewConditionInputChange: (value: string) => void
  onAddCondition: () => void
  onRemoveCondition: (index: number) => void
  conditionFields: FieldArrayWithId<PatientFormData, 'medicalInfo.conditions', 'id'>[]
  conditionItemLabel: (condition: string) => string
  // Medications
  medicationFields: FieldArrayWithId<PatientFormData, 'medicalInfo.currentMedications', 'id'>[]
  onAppendMedication: (medication: PatientFormData['medicalInfo']['currentMedications'][0]) => void
  onRemoveMedication: (index: number) => void
  onEditMedication: (index: number) => void
  onCancelEditMedication: () => void
  editingMedicationIndex: number | null
}

function MedicalInformationSection({
  register,
  control,
  newAllergyInput,
  onNewAllergyInputChange,
  onAddAllergy,
  onRemoveAllergy,
  allergyFields,
  allergyItemLabel,
  newConditionInput,
  onNewConditionInputChange,
  onAddCondition,
  onRemoveCondition,
  conditionFields,
  conditionItemLabel,
  medicationFields,
  onAppendMedication,
  onUpdateMedication,
  onRemoveMedication,
  onEditMedication,
  onCancelEditMedication,
  editingMedicationIndex,
}: MedicalInformationSectionProps) {
  const allergies = useMemo(() => allergyFields.map((field) => field.value || ''), [allergyFields])
  const conditions = useMemo(() => conditionFields.map((field) => field.value || ''), [conditionFields])

  const handleAllergyKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        onAddAllergy()
      }
    },
    [onAddAllergy]
  )

  const handleConditionKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        onAddCondition()
      }
    },
    [onAddCondition]
  )
  return (
    <Fieldset>
      <Legend>Medical Information</Legend>
      <FieldGroup>
        <Field>
          <Label>Allergies</Label>
          <div data-slot='control' className='space-y-2'>
            <div className='flex gap-2'>
              <Input
                type='text'
                value={newAllergyInput}
                onChange={(e) => onNewAllergyInputChange(e.target.value)}
                onKeyDown={handleAllergyKeyDown}
                placeholder='Enter allergy and press Enter or click Add'
              />
              <Button type='button' onClick={onAddAllergy} outline>
                Add
              </Button>
            </div>
            <Tags
              items={allergies}
              onRemove={onRemoveAllergy}
              color='blue'
              itemLabel={allergyItemLabel}
            />
          </div>
        </Field>

        <Field>
          <Label>Medical Conditions</Label>
          <div data-slot='control' className='space-y-2'>
            <div className='flex gap-2'>
              <Input
                type='text'
                value={newConditionInput}
                onChange={(e) => onNewConditionInputChange(e.target.value)}
                onKeyDown={handleConditionKeyDown}
                placeholder='Enter condition and press Enter or click Add'
              />
              <Button type='button' onClick={onAddCondition} outline>
                Add
              </Button>
            </div>
            <Tags
              items={conditions}
              onRemove={onRemoveCondition}
              color='blue'
              itemLabel={conditionItemLabel}
            />
          </div>
        </Field>

        <Field>
          <Label>Blood Type</Label>
          <Controller
            name='medicalInfo.bloodType'
            control={control}
            render={({ field }) => (
              <Select
                value={field.value || ''}
                onChange={(e) => field.onChange(e.target.value || undefined)}
              >
                <option value=''>Not specified</option>
                <option value='A+'>A+</option>
                <option value='A-'>A-</option>
                <option value='B+'>B+</option>
                <option value='B-'>B-</option>
                <option value='AB+'>AB+</option>
                <option value='AB-'>AB-</option>
                <option value='O+'>O+</option>
                <option value='O-'>O-</option>
              </Select>
            )}
          />
        </Field>

        <Field>
          <Label>Last Visit</Label>
          <Input
            type='date'
            {...register('medicalInfo.lastVisit')}
          />
        </Field>

        <MedicationsManager
          control={control}
          medicationFields={medicationFields}
          onAppendMedication={onAppendMedication}
          onRemoveMedication={onRemoveMedication}
          onEditMedication={onEditMedication}
          onCancelEditMedication={onCancelEditMedication}
          editingMedicationIndex={editingMedicationIndex}
        />
      </FieldGroup>
    </Fieldset>
  )
}

export default memo(MedicalInformationSection)
