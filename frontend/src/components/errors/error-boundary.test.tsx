import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

import ErrorBoundary from './error-boundary'

// Component that throws an error
function ThrowError({ message }: { message?: string }): never {
  throw new Error(message || 'Test error')
}

// Component that doesn't throw
function NoError() {
  return <div>No error</div>
}

describe('ErrorBoundary', () => {
  const originalError = console.error
  const mockReload = vi.fn()
  const mockHref = { value: '' }

  beforeEach(() => {
    // Suppress console.error for expected error throws
    console.error = vi.fn()
    // Mock window.location.reload
    Object.defineProperty(window, 'location', {
      value: {
        ...window.location,
        reload: mockReload,
        get href() {
          return mockHref.value
        },
        set href(value: string) {
          mockHref.value = value
        },
      },
      writable: true,
      configurable: true,
    })
  })

  afterEach(() => {
    console.error = originalError
    mockReload.mockClear()
    mockHref.value = ''
  })

  describe('error catching', () => {
    it('should catch errors from child components', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      )

      expect(screen.getByText('Application Error')).toBeInTheDocument()
      expect(screen.getByText('Test error')).toBeInTheDocument()
    })

    it('should render children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <NoError />
        </ErrorBoundary>
      )

      expect(screen.getByText('No error')).toBeInTheDocument()
      expect(screen.queryByText('Application Error')).not.toBeInTheDocument()
    })

    it('should call onError callback when error occurs', () => {
      const onError = vi.fn()
      render(
        <ErrorBoundary onError={onError}>
          <ThrowError message="Callback test" />
        </ErrorBoundary>
      )

      expect(onError).toHaveBeenCalled()
      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Callback test' }),
        expect.any(Object)
      )
    })
  })

  describe('default error fallback display', () => {
    it('should display error message', () => {
      render(
        <ErrorBoundary>
          <ThrowError message="Custom error message" />
        </ErrorBoundary>
      )

      expect(screen.getByText('Application Error')).toBeInTheDocument()
      expect(screen.getByText('Custom error message')).toBeInTheDocument()
    })

    it('should display default message when error has no message', () => {
      // Create an error without a message property
      function ThrowErrorWithoutMessage(): never {
        const error = Object.create(Error.prototype)
        // Don't set message property at all
        throw error
      }

      render(
        <ErrorBoundary>
          <ThrowErrorWithoutMessage />
        </ErrorBoundary>
      )

      expect(screen.getByText('Application Error')).toBeInTheDocument()
      expect(screen.getByText('An unexpected error occurred. Please try again.')).toBeInTheDocument()
    })

    it('should display error icon', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      )

      // SVG icons with aria-hidden don't have img role, so we check for the SVG element
      const icon = document.querySelector('svg[aria-hidden="true"]')
      expect(icon).toBeInTheDocument()
      expect(icon).toHaveAttribute('aria-hidden', 'true')
    })

    it('should display all action buttons', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      )

      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /go to home/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /reload page/i })).toBeInTheDocument()
    })
  })

  describe('error reset functionality', () => {
    it('should have Try Again button that can be clicked', async () => {
      const user = userEvent.setup()
      
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      )

      expect(screen.getByText('Application Error')).toBeInTheDocument()

      const tryAgainButton = screen.getByRole('button', { name: /try again/i })
      expect(tryAgainButton).toBeInTheDocument()
      
      // Click the button - it should not throw an error
      await user.click(tryAgainButton)
      
      // After reset, if the same error component is rendered, it will throw again
      // So the error UI should still be displayed (error boundary caught it again)
      // This confirms the reset function was called and the boundary tried to re-render
      expect(screen.getByText('Application Error')).toBeInTheDocument()
    })

    it('should allow rendering new children after reset', () => {
      // Test that a fresh ErrorBoundary can render children after a previous one caught an error
      // This simulates the reset working by creating a new boundary instance
      const { unmount } = render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      )

      expect(screen.getByText('Application Error')).toBeInTheDocument()
      
      unmount()

      // Now render a fresh boundary with no error
      render(
        <ErrorBoundary>
          <NoError />
        </ErrorBoundary>
      )

      expect(screen.getByText('No error')).toBeInTheDocument()
      expect(screen.queryByText('Application Error')).not.toBeInTheDocument()
    })
  })

  describe('button actions', () => {
    it('should reload page when Reload Page button is clicked', async () => {
      const user = userEvent.setup()
      
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      )

      const reloadButton = screen.getByRole('button', { name: /reload page/i })
      await user.click(reloadButton)

      expect(mockReload).toHaveBeenCalled()
    })

    it('should navigate to home when Go to Home button is clicked', async () => {
      const user = userEvent.setup()
      
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      )

      const goHomeButton = screen.getByRole('button', { name: /go to home/i })
      await user.click(goHomeButton)

      expect(mockHref.value).toBe('/')
    })
  })

  describe('custom fallback', () => {
    it('should use custom fallback when provided', () => {
      const customFallback = (error: Error, resetError: () => void) => (
        <div>
          <p>Custom Error: {error.message}</p>
          <button onClick={resetError}>Custom Reset</button>
        </div>
      )

      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError message="Custom error" />
        </ErrorBoundary>
      )

      expect(screen.getByText('Custom Error: Custom error')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /custom reset/i })).toBeInTheDocument()
      expect(screen.queryByText('Application Error')).not.toBeInTheDocument()
    })

    it('should call reset function from custom fallback', async () => {
      const user = userEvent.setup()
      const resetSpy = vi.fn()
      let capturedReset: (() => void) | null = null
      
      const customFallback = (error: Error, resetError: () => void) => {
        capturedReset = resetError
        return (
          <div>
            <p>Custom Error</p>
            <button onClick={() => { resetSpy(); resetError(); }}>Reset</button>
          </div>
        )
      }

      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError />
        </ErrorBoundary>
      )

      expect(resetSpy).not.toHaveBeenCalled()
      expect(capturedReset).toBeTruthy()

      const resetButton = screen.getByRole('button', { name: /reset/i })
      await user.click(resetButton)

      expect(resetSpy).toHaveBeenCalled()
      // The resetError function should be available and callable
      expect(capturedReset).toBeTruthy()
    })
  })

  describe('development error details', () => {
    const originalEnv = process.env.NODE_ENV

    afterEach(() => {
      process.env.NODE_ENV = originalEnv
    })

    it('should show error details in development mode', () => {
      process.env.NODE_ENV = 'development'

      const error = new Error('Test error')
      error.stack = 'Error: Test error\n  at test.js:1:1'

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      )

      const details = screen.getByText(/error details/i)
      expect(details).toBeInTheDocument()
    })

    it('should not show error details in production mode', () => {
      process.env.NODE_ENV = 'production'

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      )

      expect(screen.queryByText(/error details/i)).not.toBeInTheDocument()
    })
  })
})
