import { createRoute } from '@tanstack/react-router'
import { baseRoute } from '../_base'
import ActivityPage from '@/features/activity/activity-page'

export const baseIndexRoute = createRoute({
  getParentRoute: () => baseRoute,
  path: '/',
  component: ActivityPage,
})
