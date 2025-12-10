import { createRoute } from '@tanstack/react-router'
import { patientIdLayoutRoute } from './layout'
import PatientDetail from '@/features/patients/patient-detail'
import QueryErrorDisplay from '@/components/errors/query-error-display'

export const patientIdIndexRoute = createRoute({
  getParentRoute: () => patientIdLayoutRoute,
  path: '/',
  component: PatientDetail,
  errorComponent: ({ error, reset }) => (
    <QueryErrorDisplay error={error} reset={reset} title="Failed to load patient details" />
  ),
})