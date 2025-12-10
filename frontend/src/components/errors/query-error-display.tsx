import { useRouter } from '@tanstack/react-router'

import { Button } from '../ui/button'

interface QueryErrorDisplayProps {
  error: Error
  reset?: () => void
  title?: string
  retryLabel?: string
}

export default function QueryErrorDisplay({
  error,
  reset,
  title = 'Something went wrong',
  retryLabel = 'Try again',
}: QueryErrorDisplayProps) {
  const router = useRouter()

  const handleRetry = () => {
    if (reset) {
      reset()
    } else {
      // Reload the current route to trigger a refetch
      const currentLocation = router.state.location
      router.navigate({
        to: currentLocation.pathname,
        search: currentLocation.search,
        replace: true,
      })
    }
  }

  const getErrorMessage = (error: Error): string => {
    // Handle common error types
    if (error.message) {
      return error.message
    }
    
    // Handle network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return 'Unable to connect to the server. Please check your connection and try again.'
    }
    
    // Handle HTTP errors
    if ('status' in error) {
      const httpError = error as Error & { status: number }
      const status = httpError.status
      if (status === 404) {
        return 'The requested resource was not found.'
      }
      if (status === 500) {
        return 'A server error occurred. Please try again later.'
      }
      if (status >= 400 && status < 500) {
        return 'There was a problem with your request. Please check your input and try again.'
      }
    }
    
    return 'An unexpected error occurred. Please try again.'
  }

  return (
    <div className='flex flex-col items-center justify-center min-h-[400px] p-6'>
      <div className='w-full max-w-md rounded-lg bg-red-50 border border-red-200 p-6 text-center'>
        <div className='mb-4'>
          <svg
            className='mx-auto h-12 w-12 text-red-600'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
            aria-hidden='true'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
            />
          </svg>
        </div>
        
        <h2 className='text-lg font-semibold text-red-800 mb-2'>{title}</h2>
        
        <p className='text-red-600 text-sm mb-6'>
          {getErrorMessage(error)}
        </p>
        
        <div className='flex flex-col sm:flex-row gap-3 justify-center'>
          <Button onClick={handleRetry} color='red'>
            {retryLabel}
          </Button>
          <Button
            onClick={() => router.navigate({ to: '/' })}
            outline
          >
            Go to Home
          </Button>
        </div>
        
        {process.env.NODE_ENV === 'development' && (
          <details className='mt-6 text-left'>
            <summary className='text-xs text-red-700 cursor-pointer hover:text-red-800'>
              Error Details (Development Only)
            </summary>
            <pre className='mt-2 text-xs text-red-600 bg-red-100 p-3 rounded overflow-auto max-h-40'>
              {error.stack || error.toString()}
            </pre>
          </details>
        )}
      </div>
    </div>
  )
}
