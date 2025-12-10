import { createRouter } from '@tanstack/react-router'
import { rootRoute } from './routes/__root'
import { baseRoute } from './routes/_base'
import { baseIndexRoute } from './routes/_base/index'
import { notFoundRoute } from './routes/_base/$'
import { patientsIndexRoute } from './routes/patients/index'
import { patientsNewRoute } from './routes/patients/new'
import { patientIdLayoutRoute } from './routes/patients/$patientId/layout'
import { patientIdIndexRoute } from './routes/patients/$patientId/index'
import { patientIdEditRoute } from './routes/patients/$patientId/edit'

const routeTree = rootRoute.addChildren([
  baseRoute.addChildren([
    baseIndexRoute,
    patientsIndexRoute,
    patientsNewRoute,
    patientIdLayoutRoute.addChildren([
      patientIdIndexRoute,
      patientIdEditRoute,
    ]),
    notFoundRoute,
  ]),
])

export function getRouter() {
  const router = createRouter({
    routeTree,
    scrollRestoration: true,
  })

  return router
}