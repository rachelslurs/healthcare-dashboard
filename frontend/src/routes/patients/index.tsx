import { createRoute } from '@tanstack/react-router'
import { z } from 'zod'

import QueryErrorDisplay from '@/components/errors/query-error-display'
import PatientsList from '@/features/patients/patients-list'

import { baseRoute } from '../_base'

const patientsRouteSearchSchema = z.object({
  page: z.number().optional().default(1),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
})

export const patientsIndexRoute = createRoute({
  getParentRoute: () => baseRoute,
  path: '/patients',
  validateSearch: patientsRouteSearchSchema,
  component: PatientsList,
  errorComponent: ({ error, reset }) => (
    <QueryErrorDisplay error={error} reset={reset} title="Failed to load patients" />
  ),
})