import { createRoute } from '@tanstack/react-router'
import { baseRoute } from '../_base'
import ActivitiesList from '@/features/activities/activities-list'
import QueryErrorDisplay from '@/components/errors/query-error-display'

export const baseIndexRoute = createRoute({
  getParentRoute: () => baseRoute,
  path: '/',
  component: ActivitiesList,
  errorComponent: ({ error, reset }) => (
    <QueryErrorDisplay error={error} reset={reset} title="Failed to load activities" />
  ),
})
