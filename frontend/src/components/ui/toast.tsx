import clsx from 'clsx'
import type React from 'react'
import { Button } from './button'
import type { Toast, ToastAction } from '@/lib/toast'

export interface ToastProps {
  toast: Toast
  onOpenChange: (open: boolean) => void
}

/**
 * Toast component for displaying notifications
 * 
 * Supports:
 * - Title and description
 * - Variant styling (default, destructive)
 * - Custom actions
 * - Auto-dismiss and manual close
 */
export function Toast({ toast, onOpenChange }: ToastProps) {
  const handleClose = () => {
    onOpenChange(false)
  }

  const handleActionClick = (action: ToastAction) => {
    action.onClick()
    // Optionally dismiss after action
    handleClose()
  }

  const isDestructive = toast.variant === 'destructive'

  // Determine if toast is open (default to true if not specified)
  const isOpen = toast.open !== false

  return (
    <div
      className={clsx(
        'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-lg border p-4 pr-6 shadow-lg transition-all duration-300',
        isOpen
          ? 'opacity-100 translate-x-0'
          : 'opacity-0 translate-x-full pointer-events-none',
        isDestructive
          ? 'border-red-200 bg-red-50 text-red-950'
          : 'border-zinc-200 bg-white text-zinc-950'
      )}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className="grid gap-1 flex-1">
        {toast.title && (
          <div
            className={clsx(
              'text-sm font-semibold',
              isDestructive ? 'text-red-900' : 'text-zinc-900'
            )}
          >
            {toast.title}
          </div>
        )}
        {toast.description && (
          <div
            className={clsx(
              'text-sm opacity-90',
              isDestructive ? 'text-red-800' : 'text-zinc-600'
            )}
          >
            {toast.description}
          </div>
        )}
        {toast.action && (
          <div className="mt-2">
            <Button
              outline
              onClick={() => handleActionClick(toast.action!)}
              className={clsx(
                'text-xs px-2 py-1',
                isDestructive
                  ? 'border-red-300 text-red-700 hover:bg-red-100'
                  : 'border-zinc-300 text-zinc-700 hover:bg-zinc-100'
              )}
            >
              {toast.action.altText}
            </Button>
          </div>
        )}
      </div>
      <button
        onClick={handleClose}
        className={clsx(
          'absolute right-2 top-2 rounded-md p-1 text-zinc-950/50 opacity-0 transition-opacity hover:text-zinc-950 focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100',
          isDestructive && 'text-red-700/50 hover:text-red-900'
        )}
        aria-label="Close"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  )
}
