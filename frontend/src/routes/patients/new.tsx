import { createRoute } from '@tanstack/react-router'
import { baseRoute } from '../_base'
import PatientForm from '@/features/patients/patient-form'

export const patientsNewRoute = createRoute({
  getParentRoute: () => baseRoute,
  path: '/patients/new',
  component: NewPatient,
})

function NewPatient() {
  return <PatientForm isEdit={false} />
}