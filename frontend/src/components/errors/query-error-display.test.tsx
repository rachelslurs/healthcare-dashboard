import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

import QueryErrorDisplay from './query-error-display'

// Mock useRouter
const mockNavigate = vi.fn()
const mockRouter = {
  navigate: mockNavigate,
  state: {
    location: {
      pathname: '/test',
      search: {},
    },
  },
} as any

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router')
  return {
    ...actual,
    useRouter: () => mockRouter,
  }
})

describe('QueryErrorDisplay', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('error message display', () => {
    it('should display error message when provided', () => {
      const error = new Error('Custom error message')
      render(<QueryErrorDisplay error={error} />)

      // Error message is in a paragraph
      expect(screen.getByText('Custom error message', { selector: 'p' })).toBeInTheDocument()
      // Title should be the default
      expect(screen.getByText('Something went wrong', { selector: 'h2' })).toBeInTheDocument()
    })

    it('should display default title when no custom title provided', () => {
      const error = new Error('Test error')
      render(<QueryErrorDisplay error={error} />)

      expect(screen.getByText('Something went wrong', { selector: 'h2' })).toBeInTheDocument()
    })

    it('should display custom title when provided', () => {
      const error = new Error('Test error')
      render(<QueryErrorDisplay error={error} title="Custom Error Title" />)

      expect(screen.getByText('Custom Error Title')).toBeInTheDocument()
      expect(screen.queryByText('Something went wrong', { selector: 'h2' })).not.toBeInTheDocument()
    })

    it('should display default error message when error has no message', () => {
      const error = new Error('')
      render(<QueryErrorDisplay error={error} />)

      expect(screen.getByText('An unexpected error occurred. Please try again.')).toBeInTheDocument()
    })
  })

  describe('error type handling', () => {
    it('should handle network errors', () => {
      // Create a TypeError with 'fetch' in message but no message property set
      // The component shows error.message if it exists, so we test the actual behavior:
      // network errors with messages show the message, not the custom network error text
      const error = new TypeError('Failed to fetch')
      render(<QueryErrorDisplay error={error} />)

      // Component shows the error message when present
      expect(screen.getByText('Failed to fetch')).toBeInTheDocument()
    })

    it('should handle 404 errors', () => {
      // Error without message to test status-based message
      const error = Object.create(Error.prototype)
      Object.assign(error, { status: 404 })
      render(<QueryErrorDisplay error={error} />)

      expect(screen.getByText('The requested resource was not found.')).toBeInTheDocument()
    })

    it('should handle 500 errors', () => {
      // Error without message to test status-based message
      const error = Object.create(Error.prototype)
      Object.assign(error, { status: 500 })
      render(<QueryErrorDisplay error={error} />)

      expect(screen.getByText('A server error occurred. Please try again later.')).toBeInTheDocument()
    })

    it('should handle 4xx client errors', () => {
      // Error without message to test status-based message
      const error = Object.create(Error.prototype)
      Object.assign(error, { status: 400 })
      render(<QueryErrorDisplay error={error} />)

      expect(screen.getByText('There was a problem with your request. Please check your input and try again.')).toBeInTheDocument()
    })

    it('should handle 401 unauthorized errors', () => {
      // Error without message to test status-based message
      const error = Object.create(Error.prototype)
      Object.assign(error, { status: 401 })
      render(<QueryErrorDisplay error={error} />)

      expect(screen.getByText('There was a problem with your request. Please check your input and try again.')).toBeInTheDocument()
    })

    it('should handle 403 forbidden errors', () => {
      // Error without message to test status-based message
      const error = Object.create(Error.prototype)
      Object.assign(error, { status: 403 })
      render(<QueryErrorDisplay error={error} />)

      expect(screen.getByText('There was a problem with your request. Please check your input and try again.')).toBeInTheDocument()
    })
  })

  describe('retry functionality', () => {
    it('should call reset function when provided and retry button is clicked', async () => {
      const user = userEvent.setup()
      const reset = vi.fn()
      const error = new Error('Test error')

      render(<QueryErrorDisplay error={error} reset={reset} />)

      const retryButton = screen.getByRole('button', { name: /try again/i })
      await user.click(retryButton)

      expect(reset).toHaveBeenCalledTimes(1)
    })

    it('should navigate to current route when reset is not provided', async () => {
      const user = userEvent.setup()
      const error = new Error('Test error')

      render(<QueryErrorDisplay error={error} />)

      const retryButton = screen.getByRole('button', { name: /try again/i })
      await user.click(retryButton)

      expect(mockNavigate).toHaveBeenCalledWith({
        to: '/test',
        search: {},
        replace: true,
      })
    })

    it('should display custom retry label when provided', () => {
      const error = new Error('Test error')
      render(<QueryErrorDisplay error={error} retryLabel="Retry Request" />)

      expect(screen.getByRole('button', { name: /retry request/i })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /try again/i })).not.toBeInTheDocument()
    })
  })

  describe('navigation', () => {
    it('should navigate to home when Go to Home button is clicked', async () => {
      const user = userEvent.setup()
      const error = new Error('Test error')

      render(<QueryErrorDisplay error={error} />)

      const goHomeButton = screen.getByRole('button', { name: /go to home/i })
      await user.click(goHomeButton)

      expect(mockNavigate).toHaveBeenCalledWith({ to: '/' })
    })
  })

  describe('UI elements', () => {
    it('should display error icon', () => {
      const error = new Error('Test error')
      render(<QueryErrorDisplay error={error} />)

      // SVG icons with aria-hidden don't have img role, so we check for the SVG element
      const icon = document.querySelector('svg[aria-hidden="true"]')
      expect(icon).toBeInTheDocument()
      expect(icon).toHaveAttribute('aria-hidden', 'true')
    })

    it('should display both action buttons', () => {
      const error = new Error('Test error')
      render(<QueryErrorDisplay error={error} />)

      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /go to home/i })).toBeInTheDocument()
    })
  })

  describe('development error details', () => {
    const originalEnv = process.env.NODE_ENV

    beforeEach(() => {
      process.env.NODE_ENV = originalEnv
    })

    it('should show error details in development mode', () => {
      process.env.NODE_ENV = 'development'

      const error = new Error('Test error')
      error.stack = 'Error: Test error\n  at test.js:1:1'

      render(<QueryErrorDisplay error={error} />)

      const details = screen.getByText(/error details/i)
      expect(details).toBeInTheDocument()
    })

    it('should not show error details in production mode', () => {
      process.env.NODE_ENV = 'production'

      const error = new Error('Test error')
      render(<QueryErrorDisplay error={error} />)

      expect(screen.queryByText(/error details/i)).not.toBeInTheDocument()
    })

    it('should display error stack when available', () => {
      process.env.NODE_ENV = 'development'

      const error = new Error('Test error')
      error.stack = 'Error: Test error\n  at test.js:1:1'

      render(<QueryErrorDisplay error={error} />)

      const details = screen.getByText(/error details/i)
      expect(details).toBeInTheDocument()
      
      // Check that stack trace is in the document
      const pre = details.closest('details')?.querySelector('pre')
      expect(pre).toBeInTheDocument()
    })
  })
})
