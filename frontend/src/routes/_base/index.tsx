import { createRoute } from '@tanstack/react-router'
import { baseRoute } from '../_base'
import ActivitiesList from '@/features/activities/activities-list'

export const baseIndexRoute = createRoute({
  getParentRoute: () => baseRoute,
  path: '/',
  component: ActivitiesList,
})
