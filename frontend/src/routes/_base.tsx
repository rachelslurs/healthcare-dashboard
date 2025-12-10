import { createRoute } from '@tanstack/react-router'

import MainLayout from '@/components/layout/main-layout'

import { rootRoute } from './__root'

export const baseRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: '/_base',
  component: MainLayout,
})
