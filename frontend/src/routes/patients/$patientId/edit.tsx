import { createRoute, useParams } from '@tanstack/react-router'

import QueryErrorDisplay from '@/components/errors/query-error-display'
import PatientForm from '@/features/patients/patient-form'

import { patientIdLayoutRoute } from './layout'

export const patientIdEditRoute = createRoute({
  getParentRoute: () => patientIdLayoutRoute,
  path: 'edit',
  component: EditPatient,
  errorComponent: ({ error, reset }) => (
    <QueryErrorDisplay error={error} reset={reset} title='Failed to load patient for editing' />
  ),
})

function EditPatient() {
  const params = useParams({ strict: false })
  return <PatientForm isEdit={true} patientId={params.patientId} />
}