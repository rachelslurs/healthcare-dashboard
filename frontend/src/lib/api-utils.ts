import type { PaginatedData } from '@/components/layout/data-table'

/**
 * API utility functions for common operations
 */

/**
 * Transform backend paginated response to match frontend PaginatedData format
 * Handles both camelCase (pageSize, totalPages) and snake_case (page_size, total_pages) formats
 * @param data - Backend response data
 * @returns Transformed PaginatedData object
 */
export function transformPaginatedResponse<T>(data: any): PaginatedData<T> {
  return {
    items: data.items,
    total: data.total,
    page: data.page,
    page_size: data.pageSize || data.page_size,
    total_pages: data.totalPages || data.total_pages,
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
    const errorData = await response.json().catch(() => ({}))
    if (errorData.detail) {
      errorMessage = errorData.detail
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

/**
 * Create a standardized API error message
 * @param action - The action that failed (e.g., "fetch patients", "create patient")
 * @param resource - The resource type (e.g., "patient", "activity")
 * @param id - Optional resource ID for specific resource operations
 * @returns Error message string
 */
export function createApiErrorMessage(action: string, resource: string, id?: string): string {
  if (id) {
    return `Failed to ${action} ${resource} with ID ${id}`
  }
  return `Failed to ${action} ${resource}`
}
