import clsx from 'clsx'
import type React from 'react'

import type { Toast, ToastAction } from '@/lib/toast'

import { Button } from './button'

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
        'group pointer-events-auto relative flex w-full max-w-sm items-start gap-3 overflow-hidden rounded-lg border bg-ascertain-white p-4 pr-8 shadow-xs ring-1 ring-zinc-950/5 transition-all duration-300',
        isOpen
          ? 'opacity-100 translate-x-0'
          : 'opacity-0 translate-x-full pointer-events-none',
        isDestructive
          ? 'border-red-200/50 bg-red-50/50'
          : 'border-neutral-800/10 bg-ascertain-white'
      )}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className="grid gap-1 flex-1 min-w-0">
        {toast.title && (
          <div
            className={clsx(
              'text-sm font-medium',
              isDestructive ? 'text-red-900' : 'text-ascertain-foreground'
            )}
          >
            {toast.title}
          </div>
        )}
        {toast.description && (
          <div
            className={clsx(
              'text-sm',
              isDestructive ? 'text-red-800' : 'text-neutral-600'
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
                  : 'border-neutral-800/20 text-neutral-700 hover:bg-neutral-800/5'
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
          'absolute right-2 top-2 rounded-md p-1 opacity-0 transition-opacity hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-1 group-hover:opacity-100',
          isDestructive 
            ? 'text-red-700/60 hover:text-red-900' 
            : 'text-neutral-600 hover:text-ascertain-foreground'
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
