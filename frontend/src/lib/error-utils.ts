/**
 * Error handling utilities for components
 */

/**
 * Extract error message from an error object with a fallback
 * @param error - Error object (can be Error, unknown, or any)
 * @param defaultMessage - Default message if error is not an Error instance
 * @returns Error message string
 */
export function getErrorMessage(error: unknown, defaultMessage: string): string {
  if (error instanceof Error) {
    return error.message
  }
  return defaultMessage
}
