import clsx from 'clsx'
import type React from 'react'

interface LoadingSpinnerProps {
  message?: string
  className?: string
}

/**
 * Reusable loading spinner component
 * @param message - Optional loading message to display below the spinner
 * @param className - Optional additional CSS classes for the container
 */
export default function LoadingSpinner({ 
  message = 'Loading...', 
  className 
}: LoadingSpinnerProps) {
  return (
    <div className={clsx('flex items-center justify-center min-h-[400px]', className)}>
      <div className='flex flex-col items-center gap-2'>
        <div className='size-8 animate-spin rounded-full border-4 border-neutral-300 border-t-neutral-600' />
        {message && (
          <p className='text-sm text-gray-600'>{message}</p>
        )}
      </div>
    </div>
  )
}
