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

  })

  describe('close button', () => {
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
