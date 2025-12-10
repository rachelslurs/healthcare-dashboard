import { createRoute } from '@tanstack/react-router'
import { patientIdLayoutRoute } from './layout'
import PatientDetail from '@/features/patients/patient-detail'

export const patientIdIndexRoute = createRoute({
  getParentRoute: () => patientIdLayoutRoute,
  path: '/',
  component: PatientDetail,
})