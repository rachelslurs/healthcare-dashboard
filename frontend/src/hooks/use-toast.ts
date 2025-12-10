import { useState, useEffect } from 'react'

import { getToastState, subscribe, toast as toastFn, dismissToast, type Toast } from '@/lib/toast'

export type UseToastReturn = {
  toasts: Toast[]
  toast: typeof toastFn
  dismiss: (toastId: string) => void
}

/**
 * Hook to access toast state and functions
 * 
 * Subscribes to global toast state changes and provides:
 * - Current toast array
 * - Toast creation function
 * - Toast dismissal function
 * 
 * @example
 * ```tsx
 * const { toasts, toast, dismiss } = useToast()
 * 
 * // Show a toast
 * toast({ title: "Success", description: "Patient created" })
 * 
 * // Dismiss a toast
 * dismiss(toastId)
 * ```
 */
export default function useToast(): UseToastReturn {
  // Initialize state with current memory state
  const [toasts, setToasts] = useState(() => getToastState().toasts)

  useEffect(() => {
    // Subscribe to state changes
    const unsubscribe = subscribe((state) => {
      setToasts(state.toasts)
    })

    // Unsubscribe on unmount
    return unsubscribe
  }, [])

  return {
    toasts,
    toast: toastFn,
    dismiss: dismissToast,
  }
}
