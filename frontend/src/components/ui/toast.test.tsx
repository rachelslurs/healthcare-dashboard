import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { Toast } from './toast'
import type { Toast as ToastType } from '@/lib/toast'

describe('Toast', () => {
  const mockOnOpenChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('should render title when provided', () => {
      const toast: ToastType = {
        id: 'test-1',
        title: 'Test Title',
        open: true,
      }

      render(<Toast toast={toast} onOpenChange={mockOnOpenChange} />)

      expect(screen.getByText('Test Title')).toBeInTheDocument()
    })

    it('should render description when provided', () => {
      const toast: ToastType = {
        id: 'test-1',
        title: 'Test Title',
        description: 'Test description text',
        open: true,
      }

      render(<Toast toast={toast} onOpenChange={mockOnOpenChange} />)

      expect(screen.getByText('Test description text')).toBeInTheDocument()
    })

    it('should render with only title', () => {
      const toast: ToastType = {
        id: 'test-1',
        title: 'Title Only',
        open: true,
      }

      render(<Toast toast={toast} onOpenChange={mockOnOpenChange} />)

      expect(screen.getByText('Title Only')).toBeInTheDocument()
      expect(screen.queryByText(/description/i)).not.toBeInTheDocument()
    })

    it('should render with only description', () => {
      const toast: ToastType = {
        id: 'test-1',
        description: 'Description Only',
        open: true,
      }

      render(<Toast toast={toast} onOpenChange={mockOnOpenChange} />)

      expect(screen.getByText('Description Only')).toBeInTheDocument()
    })

    it('should render action button when action is provided', () => {
      const mockActionClick = vi.fn()
      const toast: ToastType = {
        id: 'test-1',
        title: 'Test Title',
        action: {
          altText: 'View Details',
          onClick: mockActionClick,
        },
        open: true,
      }

      render(<Toast toast={toast} onOpenChange={mockOnOpenChange} />)

      const actionButton = screen.getByRole('button', { name: /view details/i })
      expect(actionButton).toBeInTheDocument()
    })
  })

  describe('variants', () => {
    it('should apply default variant styling', () => {
      const toast: ToastType = {
        id: 'test-1',
        title: 'Default Toast',
        variant: 'default',
        open: true,
      }

      const { container } = render(<Toast toast={toast} onOpenChange={mockOnOpenChange} />)

      const toastElement = container.firstChild as HTMLElement
      expect(toastElement).toHaveClass('border-neutral-800/10', 'bg-ascertain-white')
      expect(toastElement).not.toHaveClass('border-red-200/50', 'bg-red-50/50')
    })

    it('should apply destructive variant styling', () => {
      const toast: ToastType = {
        id: 'test-1',
        title: 'Error Toast',
        variant: 'destructive',
        open: true,
      }

      const { container } = render(<Toast toast={toast} onOpenChange={mockOnOpenChange} />)

      const toastElement = container.firstChild as HTMLElement
      expect(toastElement).toHaveClass('border-red-200/50', 'bg-red-50/50')
    })

    it('should apply default variant when variant is not specified', () => {
      const toast: ToastType = {
        id: 'test-1',
        title: 'No Variant Toast',
        open: true,
      }

      const { container } = render(<Toast toast={toast} onOpenChange={mockOnOpenChange} />)

      const toastElement = container.firstChild as HTMLElement
      expect(toastElement).toHaveClass('border-neutral-800/10', 'bg-ascertain-white')
    })

    it('should apply destructive text colors for destructive variant', () => {
      const toast: ToastType = {
        id: 'test-1',
        title: 'Error Title',
        description: 'Error description',
        variant: 'destructive',
        open: true,
      }

      render(<Toast toast={toast} onOpenChange={mockOnOpenChange} />)

      const title = screen.getByText('Error Title')
      const description = screen.getByText('Error description')

      expect(title).toHaveClass('text-red-900')
      expect(description).toHaveClass('text-red-800')
    })
  })

  describe('close button', () => {
    it('should render close button', () => {
      const toast: ToastType = {
        id: 'test-1',
        title: 'Test Toast',
        open: true,
      }

      render(<Toast toast={toast} onOpenChange={mockOnOpenChange} />)

      const closeButton = screen.getByRole('button', { name: /close/i })
      expect(closeButton).toBeInTheDocument()
    })

    it('should call onOpenChange(false) when close button is clicked', async () => {
      const user = userEvent.setup()
      const toast: ToastType = {
        id: 'test-1',
        title: 'Test Toast',
        open: true,
      }

      render(<Toast toast={toast} onOpenChange={mockOnOpenChange} />)

      const closeButton = screen.getByRole('button', { name: /close/i })
      await user.click(closeButton)

      expect(mockOnOpenChange).toHaveBeenCalledTimes(1)
      expect(mockOnOpenChange).toHaveBeenCalledWith(false)
    })
  })

  describe('action button', () => {
    it('should call action onClick when action button is clicked', async () => {
      const user = userEvent.setup()
      const mockActionClick = vi.fn()
      const toast: ToastType = {
        id: 'test-1',
        title: 'Test Toast',
        action: {
          altText: 'View',
          onClick: mockActionClick,
        },
        open: true,
      }

      render(<Toast toast={toast} onOpenChange={mockOnOpenChange} />)

      const actionButton = screen.getByRole('button', { name: /view/i })
      await user.click(actionButton)

      expect(mockActionClick).toHaveBeenCalledTimes(1)
    })

    it('should dismiss toast after action is clicked', async () => {
      const user = userEvent.setup()
      const mockActionClick = vi.fn()
      const toast: ToastType = {
        id: 'test-1',
        title: 'Test Toast',
        action: {
          altText: 'View',
          onClick: mockActionClick,
        },
        open: true,
      }

      render(<Toast toast={toast} onOpenChange={mockOnOpenChange} />)

      const actionButton = screen.getByRole('button', { name: /view/i })
      await user.click(actionButton)

      expect(mockOnOpenChange).toHaveBeenCalledWith(false)
    })

    it('should apply destructive styling to action button for destructive variant', () => {
      const mockActionClick = vi.fn()
      const toast: ToastType = {
        id: 'test-1',
        title: 'Error Toast',
        variant: 'destructive',
        action: {
          altText: 'Retry',
          onClick: mockActionClick,
        },
        open: true,
      }

      render(<Toast toast={toast} onOpenChange={mockOnOpenChange} />)

      const actionButton = screen.getByRole('button', { name: /retry/i })
      expect(actionButton).toHaveClass('border-red-300', 'text-red-700')
    })
  })

  describe('open/closed state', () => {
    it('should show toast when open is true', () => {
      const toast: ToastType = {
        id: 'test-1',
        title: 'Open Toast',
        open: true,
      }

      const { container } = render(<Toast toast={toast} onOpenChange={mockOnOpenChange} />)

      const toastElement = container.firstChild as HTMLElement
      expect(toastElement).toHaveClass('opacity-100', 'translate-x-0')
      expect(toastElement).not.toHaveClass('opacity-0', 'translate-x-full', 'pointer-events-none')
    })

    it('should hide toast when open is false', () => {
      const toast: ToastType = {
        id: 'test-1',
        title: 'Closed Toast',
        open: false,
      }

      const { container } = render(<Toast toast={toast} onOpenChange={mockOnOpenChange} />)

      const toastElement = container.firstChild as HTMLElement
      expect(toastElement).toHaveClass('opacity-0', 'translate-x-full', 'pointer-events-none')
    })

    it('should default to open when open is not specified', () => {
      const toast: ToastType = {
        id: 'test-1',
        title: 'Default Open Toast',
      }

      const { container } = render(<Toast toast={toast} onOpenChange={mockOnOpenChange} />)

      const toastElement = container.firstChild as HTMLElement
      expect(toastElement).toHaveClass('opacity-100', 'translate-x-0')
    })
  })

  describe('accessibility', () => {
    it('should have role="alert"', () => {
      const toast: ToastType = {
        id: 'test-1',
        title: 'Accessible Toast',
        open: true,
      }

      render(<Toast toast={toast} onOpenChange={mockOnOpenChange} />)

      const toastElement = screen.getByRole('alert')
      expect(toastElement).toBeInTheDocument()
    })

    it('should have aria-live="assertive"', () => {
      const toast: ToastType = {
        id: 'test-1',
        title: 'Accessible Toast',
        open: true,
      }

      render(<Toast toast={toast} onOpenChange={mockOnOpenChange} />)

      const toastElement = screen.getByRole('alert')
      expect(toastElement).toHaveAttribute('aria-live', 'assertive')
    })

    it('should have aria-atomic="true"', () => {
      const toast: ToastType = {
        id: 'test-1',
        title: 'Accessible Toast',
        open: true,
      }

      render(<Toast toast={toast} onOpenChange={mockOnOpenChange} />)

      const toastElement = screen.getByRole('alert')
      expect(toastElement).toHaveAttribute('aria-atomic', 'true')
    })

    it('should have accessible close button with aria-label', () => {
      const toast: ToastType = {
        id: 'test-1',
        title: 'Accessible Toast',
        open: true,
      }

      render(<Toast toast={toast} onOpenChange={mockOnOpenChange} />)

      const closeButton = screen.getByRole('button', { name: /close/i })
      expect(closeButton).toHaveAttribute('aria-label', 'Close')
    })
  })
})
