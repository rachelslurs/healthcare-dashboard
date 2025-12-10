import { createRoute, useParams } from '@tanstack/react-router'
import { patientIdLayoutRoute } from './layout'
import PatientForm from '@/features/patients/patient-form'

export const patientIdEditRoute = createRoute({
  getParentRoute: () => patientIdLayoutRoute,
  path: '/edit',
  component: EditPatient,
})

function EditPatient() {
  const params = useParams({ strict: false })
  return <PatientForm isEdit={true} patientId={params.patientId} />
}