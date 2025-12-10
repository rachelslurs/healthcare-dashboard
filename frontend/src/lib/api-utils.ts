import type { PaginatedData } from '@/components/layout/data-table'

/**
 * API utility functions for common operations
 */

/**
 * Backend paginated response structure
 * Handles both camelCase and snake_case formats from the API
 */
interface BackendPaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  // Support both camelCase and snake_case formats
  pageSize?: number
  page_size?: number
  totalPages?: number
  total_pages?: number
}

/**
 * Transform backend paginated response to match frontend PaginatedData format
 * Handles both camelCase (pageSize, totalPages) and snake_case (page_size, total_pages) formats
 * @param data - Backend response data
 * @returns Transformed PaginatedData object
 */
export function transformPaginatedResponse<T>(
  data: BackendPaginatedResponse<T>
): PaginatedData<T> {
  return {
    items: data.items,
    total: data.total,
    page: data.page,
    page_size: data.pageSize ?? data.page_size ?? 10, // Default to 10 if neither is provided
    total_pages: data.totalPages ?? data.total_pages ?? 1, // Default to 1 if neither is provided
  }
}

/**
 * Handle API error responses with consistent error messages
 * @param response - Fetch Response object
 * @param defaultMessage - Default error message if no detail is found
 * @param notFoundMessage - Custom message for 404 errors (optional)
 * @returns Promise that rejects with an Error
 */
export async function handleApiError(
  response: Response,
  defaultMessage: string,
  notFoundMessage?: string
): Promise<never> {
  if (response.status === 404 && notFoundMessage) {
    throw new Error(notFoundMessage)
  }

  // Try to extract error detail from response body
  let errorMessage = defaultMessage
  try {
    const errorData = (await response.json()) as unknown
    if (
      typeof errorData === 'object' &&
      errorData !== null &&
      'detail' in errorData &&
      typeof (errorData as { detail: unknown }).detail === 'string'
    ) {
      errorMessage = (errorData as { detail: string }).detail
    } else if (response.statusText) {
      errorMessage = `${defaultMessage}: ${response.statusText}`
    }
  } catch {
    // If JSON parsing fails, use statusText or default message
    if (response.statusText) {
      errorMessage = `${defaultMessage}: ${response.statusText}`
    }
  }

  throw new Error(errorMessage)
}
