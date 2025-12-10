import { Patient } from '@/types/patient'

interface PatientFormProps {
  patient?: Patient
  patientId?: string
  isEdit?: boolean
}

export default function PatientForm({ patient, patientId, isEdit = false }: PatientFormProps) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        {isEdit ? 'Edit Patient' : 'New Patient'}
      </h1>
      <p className="text-gray-600">
        Patient form will be implemented here
        {isEdit && patient && ` - Editing patient: ${patient.firstName} ${patient.lastName}`}
        {isEdit && patientId && !patient && ` - Patient ID: ${patientId}`}
      </p>
      {isEdit && (
        <div className="mt-4">
          <p className="text-sm text-gray-500">Photo upload and document upload will be available here</p>
        </div>
      )}
    </div>
  )
}
