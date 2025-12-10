import type { PaginatedData } from '@/components/layout/data-table'
import type { Activity } from './types'
import { API_BASE_URL } from '@/lib/constants'
import { transformPaginatedResponse, handleApiError } from '@/lib/api-utils'

// API parameter types
export interface GetActivitiesParams {
  page?: number
  pageSize?: number
  sortBy?: 'timestamp'
  sortOrder?: 'asc' | 'desc'
}

/**
 * Get paginated list of activities
 */
export async function getActivities(
  params: GetActivitiesParams = {}
): Promise<PaginatedData<Activity>> {
  const { page = 1, pageSize = 10, sortBy, sortOrder } = params

  const searchParams = new URLSearchParams({
    page: page.toString(),
    page_size: pageSize.toString(),
  })

  if (sortBy) {
    searchParams.append('sort_by', sortBy)
  }

  if (sortOrder) {
    searchParams.append('sort_order', sortOrder)
  }

  const response = await fetch(`${API_BASE_URL}/api/activities?${searchParams}`)

  if (!response.ok) {
    await handleApiError(response, 'Failed to fetch activities')
  }

  const data = await response.json()
  return transformPaginatedResponse<Activity>(data)
}
