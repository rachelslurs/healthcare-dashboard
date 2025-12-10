import { createRoute, Outlet } from '@tanstack/react-router'
import { baseRoute } from '../../_base'

export const patientIdLayoutRoute = createRoute({
  getParentRoute: () => baseRoute,
  path: '/patients/$patientId',
  component: PatientLayout,
})

function PatientLayout() {
  return <Outlet />
}
