import React, { Component, type ReactNode } from 'react'

import { Button } from '../ui/button'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: (error: Error, resetError: () => void) => ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
    }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo)
    }

    // Call optional error handler
    this.props.onError?.(error, errorInfo)
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
    })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.resetError)
      }

      // Default fallback UI
      return <DefaultErrorFallback error={this.state.error} onReset={this.resetError} />
    }

    return this.props.children
  }
}

interface DefaultErrorFallbackProps {
  error: Error
  onReset: () => void
}

function DefaultErrorFallback({ error, onReset }: DefaultErrorFallbackProps) {
  const handleReload = () => {
    window.location.reload()
  }

  const handleGoHome = () => {
    window.location.href = '/'
  }

  const getErrorMessage = (error: Error): string => {
    if (error.message) {
      return error.message
    }
    return 'An unexpected error occurred. Please try again.'
  }

  return (
    <div className='flex flex-col items-center justify-center min-h-screen p-6 bg-ascertain-background'>
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
        
        <h2 className='text-lg font-semibold text-red-800 mb-2'>
          Application Error
        </h2>
        
        <p className='text-red-600 text-sm mb-6'>
          {getErrorMessage(error)}
        </p>
        
        <div className='flex flex-col sm:flex-row gap-3 justify-center'>
          <Button onClick={onReset} color='red'>
            Try Again
          </Button>
          <Button onClick={handleGoHome} outline>
            Go to Home
          </Button>
          <Button onClick={handleReload} outline>
            Reload Page
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
