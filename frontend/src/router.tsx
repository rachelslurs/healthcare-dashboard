import { createRouter } from '@tanstack/react-router'

import { rootRoute } from './routes/__root'
import { baseRoute } from './routes/_base'
import { baseIndexRoute } from './routes/_base/index'
import { notFoundRoute } from './routes/_base/$'
import { patientsIndexRoute } from './routes/patients'
import { patientIdIndexRoute } from './routes/patients/$patientId'
import { patientIdEditRoute } from './routes/patients/$patientId/edit'
import { patientIdLayoutRoute } from './routes/patients/$patientId/layout'
import { patientsNewRoute } from './routes/patients/new'

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