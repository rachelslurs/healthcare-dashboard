import { createRoute } from '@tanstack/react-router'

import QueryErrorDisplay from '@/components/errors/query-error-display'
import PatientDetail from '@/features/patients/patient-detail'

import { patientIdLayoutRoute } from './layout'

export const patientIdIndexRoute = createRoute({
  getParentRoute: () => patientIdLayoutRoute,
  path: '/',
  component: PatientDetail,
  errorComponent: ({ error, reset }) => (
    <QueryErrorDisplay error={error} reset={reset} title='Failed to load patient details' />
  ),
})