import { createRoute } from '@tanstack/react-router'
import { baseRoute } from '../_base'
import PatientsList from '@/features/patients/patients-list'
import QueryErrorDisplay from '@/components/errors/query-error-display'

export const patientsIndexRoute = createRoute({
  getParentRoute: () => baseRoute,
  path: '/patients',
  component: PatientsList,
  errorComponent: ({ error, reset }) => (
    <QueryErrorDisplay error={error} reset={reset} title="Failed to load patients" />
  ),
})