import { createRoute } from '@tanstack/react-router'
import { baseRoute } from '../_base'
import PatientForm from '@/features/patients/patient-form'
import QueryErrorDisplay from '@/components/errors/query-error-display'

export const patientsNewRoute = createRoute({
  getParentRoute: () => baseRoute,
  path: '/patients/new',
  component: NewPatient,
  errorComponent: ({ error, reset }) => (
    <QueryErrorDisplay error={error} reset={reset} title="Failed to load form" />
  ),
})

function NewPatient() {
  return <PatientForm isEdit={false} />
}