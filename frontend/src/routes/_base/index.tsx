import { createRoute } from '@tanstack/react-router'

import QueryErrorDisplay from '@/components/errors/query-error-display'
import ActivitiesList from '@/features/activities/activities-list'

import { baseRoute } from '../_base'

export const baseIndexRoute = createRoute({
  getParentRoute: () => baseRoute,
  path: '/',
  component: ActivitiesList,
  errorComponent: ({ error, reset }) => (
    <QueryErrorDisplay error={error} reset={reset} title='Failed to load activities' />
  ),
})
