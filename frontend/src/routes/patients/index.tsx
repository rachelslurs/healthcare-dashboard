import { createRoute } from '@tanstack/react-router'
import { baseRoute } from '../_base'
import PatientsList from '@/features/patients/patients-list'

export const patientsIndexRoute = createRoute({
  getParentRoute: () => baseRoute,
  path: '/patients',
  component: PatientsList,
})