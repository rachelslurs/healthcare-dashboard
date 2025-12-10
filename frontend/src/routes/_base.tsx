import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './_root'
import MainLayout from '@/components/layout/main-layout'

export const baseRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: '/_base',
  component: MainLayout,
})
