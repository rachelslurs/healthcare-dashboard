import { memo, useCallback, useState } from 'react'
import { Control, Controller, FieldArrayWithId } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Field, Label } from '@/components/ui/fieldset'
import { Input } from '@/components/ui/input'
import type { PatientFormData } from './patient-form-schema'

interface MedicationsManagerProps {
  control: Control<PatientFormData>
  medicationFields: FieldArrayWithId<PatientFormData, 'medicalInfo.currentMedications', 'id'>[]
  onAppendMedication: (medication: PatientFormData['medicalInfo']['currentMedications'][0]) => void
  onRemoveMedication: (index: number) => void
  onEditMedication: (index: number) => void
  onCancelEditMedication: () => void
  editingMedicationIndex: number | null
}

function MedicationsManager({
  control,
  medicationFields,
  onAppendMedication,
  onRemoveMedication,
  onEditMedication,
  onCancelEditMedication,
  editingMedicationIndex,
}: MedicationsManagerProps) {
  // Minimal state only for the temporary "new medication" input (before it's added to form)
  const [newMedication, setNewMedication] = useState({ name: '', dosage: '', frequency: '' })

  const handleNewMedicationChange = useCallback(
    (field: 'name' | 'dosage' | 'frequency', value: string) => {
      setNewMedication((prev) => ({ ...prev, [field]: value }))
    },
    []
  )

  const handleAddMedication = useCallback(() => {
    if (!newMedication.name.trim()) return

    onAppendMedication({
      name: newMedication.name.trim(),
      dosage: newMedication.dosage.trim() || undefined,
      frequency: newMedication.frequency.trim() || undefined,
    })

    // Clear the temporary input
    setNewMedication({ name: '', dosage: '', frequency: '' })
  }, [newMedication, onAppendMedication])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && newMedication.name.trim()) {
        e.preventDefault()
        handleAddMedication()
      }
    },
    [newMedication.name, handleAddMedication]
  )

  return (
    <Field>
      <Label>Current Medications</Label>
      <div data-slot='control' className='space-y-2'>
        <div className='space-y-4'>
          {/* Medication Input Form */}
          <div className='space-y-3 p-4 border border-neutral-200 rounded-lg'>
            {editingMedicationIndex !== null ? (
              // Editing mode - use Controller to edit directly in the form
              <>
                <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
                  <Controller
                    name={`medicalInfo.currentMedications.${editingMedicationIndex}.name`}
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder='Medication name *'
                        required
                      />
                    )}
                  />
                  <Controller
                    name={`medicalInfo.currentMedications.${editingMedicationIndex}.dosage`}
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        value={field.value || ''}
                        placeholder='Dosage (optional)'
                      />
                    )}
                  />
                  <Controller
                    name={`medicalInfo.currentMedications.${editingMedicationIndex}.frequency`}
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        value={field.value || ''}
                        placeholder='Frequency (optional)'
                      />
                    )}
                  />
                </div>
                <div className='flex gap-2'>
                  <Button type='button' onClick={onCancelEditMedication} outline>
                    Done Editing
                  </Button>
                  <Button type='button' onClick={onCancelEditMedication} outline>
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              // Adding mode - use temporary state for new medication
              <>
                <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
                  <Input
                    type='text'
                    value={newMedication.name}
                    onChange={(e) => handleNewMedicationChange('name', e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder='Medication name *'
                    required
                  />
                  <Input
                    type='text'
                    value={newMedication.dosage}
                    onChange={(e) => handleNewMedicationChange('dosage', e.target.value)}
                    placeholder='Dosage (optional)'
                  />
                  <Input
                    type='text'
                    value={newMedication.frequency}
                    onChange={(e) => handleNewMedicationChange('frequency', e.target.value)}
                    placeholder='Frequency (optional)'
                  />
                </div>
                <div className='flex gap-2'>
                  <Button type='button' onClick={handleAddMedication} outline>
                    Add Medication
                  </Button>
                </div>
              </>
            )}
          </div>

          {/* Medications List */}
          {medicationFields.length > 0 && (
            <div className='space-y-2'>
              {medicationFields.map((field, index) => (
                <MedicationItem
                  key={field.id}
                  medication={field.value}
                  index={index}
                  onEdit={onEditMedication}
                  onRemove={onRemoveMedication}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Field>
  )
}

interface MedicationItemProps {
  medication: PatientFormData['medicalInfo']['currentMedications'][0]
  index: number
  onEdit: (index: number) => void
  onRemove: (index: number) => void
}

const MedicationItem = memo(function MedicationItem({
  medication,
  index,
  onEdit,
  onRemove,
}: MedicationItemProps) {
  const handleEdit = useCallback(() => {
    onEdit(index)
  }, [index, onEdit])

  const handleRemove = useCallback(() => {
    onRemove(index)
  }, [index, onRemove])

  return (
    <div className='flex items-center justify-between p-3 border border-neutral-200 rounded-lg'>
      <div className='flex-1'>
        <div className='font-medium'>{medication.name}</div>
        {(medication.dosage || medication.frequency) && (
          <div className='text-sm text-neutral-600'>
            {medication.dosage && <span>{medication.dosage}</span>}
            {medication.dosage && medication.frequency && <span> • </span>}
            {medication.frequency && <span>{medication.frequency}</span>}
          </div>
        )}
      </div>
      <div className='flex gap-2'>
        <Button type='button' onClick={handleEdit} outline size='sm'>
          Edit
        </Button>
        <Button type='button' onClick={handleRemove} outline size='sm'>
          Remove
        </Button>
      </div>
    </div>
  )
})

export default memo(MedicationsManager)
