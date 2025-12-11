import { useBlocker } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'

interface UseUnsavedChangesOptions {
  /**
   * Whether there are unsaved changes that should block navigation
   */
  hasUnsavedChanges: boolean
  /**
   * Custom message to show in the confirmation dialog
   * @default "You have unsaved changes. Are you sure you want to leave?"
   */
  message?: string
  /**
   * Whether to enable browser beforeunload event (for page refresh/close)
   * @default true
   */
  enableBeforeUnload?: boolean
}

/**
 * Reusable hook for blocking navigation when there are unsaved changes.
 * Shows a confirmation dialog when user attempts to navigate away (back button, refresh, etc.)
 * 
 * @example
 * ```tsx
 * const { markNavigationConfirmed } = useUnsavedChanges({
 *   hasUnsavedChanges: isDirty || !!photoFile,
 * })
 * 
 * // When programmatically navigating (e.g., Cancel button), mark as confirmed first
 * const handleCancel = () => {
 *   if (hasUnsavedChanges) {
 *     const confirmed = window.confirm('Leave?')
 *     if (!confirmed) return
 *     markNavigationConfirmed()
 *   }
 *   navigate({ to: '/somewhere' })
 * }
 * ```
 */
export default function useUnsavedChanges({
  hasUnsavedChanges,
  message = 'You have unsaved changes. Are you sure you want to leave?',
  enableBeforeUnload = true,
}: UseUnsavedChangesOptions) {
  const confirmedLeaveRef = useRef(false)

  // Block navigation when there are unsaved changes (unless user confirmed via programmatic navigation)
  const { status, proceed, reset: resetBlocker } = useBlocker({
    shouldBlockFn: () => hasUnsavedChanges && !confirmedLeaveRef.current,
    enableBeforeUnload,
    withResolver: true,
  })

  // Show confirmation dialog when navigation is blocked
  useEffect(() => {
    if (status === 'blocked') {
      const confirmed = window.confirm(message)
      if (confirmed) {
        proceed()
      } else {
        resetBlocker()
      }
    }
  }, [status, proceed, resetBlocker, message])

  /**
   * Mark that navigation was confirmed (e.g., via Cancel button).
   * Call this before programmatic navigation to bypass the blocker.
   */
  const markNavigationConfirmed = () => {
    confirmedLeaveRef.current = true
    // Reset after a short delay to allow navigation
    setTimeout(() => {
      confirmedLeaveRef.current = false
    }, 100)
  }

  return {
    markNavigationConfirmed,
  }
}
