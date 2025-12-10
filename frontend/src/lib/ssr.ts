/**
 * SSR-safe utility functions for accessing browser APIs
 */

/**
 * Safely gets the current URL search string, returning empty string in SSR contexts
 * @returns The current URL search string (e.g., "?page=1&sortBy=name") or empty string in SSR
 */
export function getSearchString(): string {
  if (typeof window === 'undefined') {
    return ''
  }
  return window.location.search
}

/**
 * Safely creates a URLSearchParams object from the current URL search string
 * @returns A URLSearchParams object, or an empty one in SSR contexts
 */
export function getSearchParams(): URLSearchParams {
  if (typeof window === 'undefined') {
    return new URLSearchParams()
  }
  return new URLSearchParams(window.location.search)
}
