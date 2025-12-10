import type { PaginatedData } from '@/components/layout/data-table'
import type { Activity } from './types'

// API parameter types
export interface GetActivitiesParams {
  page?: number
  pageSize?: number
  sortBy?: 'timestamp'
  sortOrder?: 'asc' | 'desc'
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

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
    throw new Error(`Failed to fetch activities: ${response.statusText}`)
  }

  const data = await response.json()

  // Transform backend response to match frontend PaginatedData format
  // Backend may return camelCase (pageSize, totalPages) or snake_case (page_size, total_pages)
  return {
    items: data.items,
    total: data.total,
    page: data.page,
    page_size: data.pageSize || data.page_size,
    total_pages: data.totalPages || data.total_pages,
  }
}
