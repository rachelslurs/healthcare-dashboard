import { createRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { baseRoute } from '../_base'
import PatientsList from '@/features/patients/patients-list'
import QueryErrorDisplay from '@/components/errors/query-error-display'

const patientsSearchSchema = z.object({
  page: z.number().optional().default(1),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
})

export const patientsIndexRoute = createRoute({
  getParentRoute: () => baseRoute,
  path: '/patients',
  validateSearch: patientsSearchSchema,
  component: PatientsList,
  errorComponent: ({ error, reset }) => (
    <QueryErrorDisplay error={error} reset={reset} title="Failed to load patients" />
  ),
})