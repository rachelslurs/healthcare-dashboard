import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import Toaster from './toaster'
import type { Toast } from '@/lib/toast'
import * as toastLib from '@/lib/toast'

// Mock the toast library
vi.mock('@/lib/toast', () => ({
  dismissToast: vi.fn(),
}))

// Mock the useToast hook
const mockToasts: Toast[] = []
const mockUseToast = vi.fn(() => ({
  toasts: mockToasts,
}))

vi.mock('@/hooks/useToast', () => ({
  default: () => mockUseToast(),
}))

describe('Toaster', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockToasts.length = 0
  })

  describe('rendering', () => {
    it('should render nothing when there are no toasts', () => {
      mockUseToast.mockReturnValue({ toasts: [] })

      const { container } = render(<Toaster />)

      expect(container.firstChild).toBeInTheDocument()
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })

    it('should render a single toast', () => {
      const toast: Toast = {
        id: 'toast-1',
        title: 'Test Toast',
        open: true,
      }
      mockUseToast.mockReturnValue({ toasts: [toast] })

      render(<Toaster />)

      expect(screen.getByText('Test Toast')).toBeInTheDocument()
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })

    it('should render multiple toasts', () => {
      const toast1: Toast = {
        id: 'toast-1',
        title: 'First Toast',
        open: true,
      }
      const toast2: Toast = {
        id: 'toast-2',
        title: 'Second Toast',
        open: true,
      }
      mockUseToast.mockReturnValue({ toasts: [toast1, toast2] })

      render(<Toaster />)

      expect(screen.getByText('First Toast')).toBeInTheDocument()
      expect(screen.getByText('Second Toast')).toBeInTheDocument()
      expect(screen.getAllByRole('alert')).toHaveLength(2)
    })

    it('should render toast with title and description', () => {
      const toast: Toast = {
        id: 'toast-1',
        title: 'Success',
        description: 'Patient created successfully',
        open: true,
      }
      mockUseToast.mockReturnValue({ toasts: [toast] })

      render(<Toaster />)

      expect(screen.getByText('Success')).toBeInTheDocument()
      expect(screen.getByText('Patient created successfully')).toBeInTheDocument()
    })

    it('should render toast with action', () => {
      const mockActionClick = vi.fn()
      const toast: Toast = {
        id: 'toast-1',
        title: 'Patient Created',
        action: {
          altText: 'View',
          onClick: mockActionClick,
        },
        open: true,
      }
      mockUseToast.mockReturnValue({ toasts: [toast] })

      render(<Toaster />)

      expect(screen.getByRole('button', { name: /view/i })).toBeInTheDocument()
    })
  })

  describe('toast dismissal', () => {
    it('should call dismissToast when toast is closed', async () => {
      const user = userEvent.setup()
      const toast: Toast = {
        id: 'toast-1',
        title: 'Test Toast',
        open: true,
      }
      mockUseToast.mockReturnValue({ toasts: [toast] })

      render(<Toaster />)

      const closeButton = screen.getByRole('button', { name: /close/i })
      await user.click(closeButton)

      expect(toastLib.dismissToast).toHaveBeenCalledTimes(1)
      expect(toastLib.dismissToast).toHaveBeenCalledWith('toast-1')
    })

    it('should call dismissToast for correct toast when multiple toasts exist', async () => {
      const user = userEvent.setup()
      const toast1: Toast = {
        id: 'toast-1',
        title: 'First Toast',
        open: true,
      }
      const toast2: Toast = {
        id: 'toast-2',
        title: 'Second Toast',
        open: true,
      }
      mockUseToast.mockReturnValue({ toasts: [toast1, toast2] })

      render(<Toaster />)

      const closeButtons = screen.getAllByRole('button', { name: /close/i })
      await user.click(closeButtons[1]) // Close second toast

      expect(toastLib.dismissToast).toHaveBeenCalledTimes(1)
      expect(toastLib.dismissToast).toHaveBeenCalledWith('toast-2')
    })
  })

  describe('accessibility', () => {
    it('should have aria-live="polite"', () => {
      mockUseToast.mockReturnValue({ toasts: [] })

      render(<Toaster />)

      const toaster = screen.getByLabelText('Notifications')
      expect(toaster).toHaveAttribute('aria-live', 'polite')
    })

    it('should have aria-label="Notifications"', () => {
      mockUseToast.mockReturnValue({ toasts: [] })

      render(<Toaster />)

      const toaster = screen.getByLabelText('Notifications')
      expect(toaster).toBeInTheDocument()
    })

    it('should maintain accessibility when toasts are present', () => {
      const toast: Toast = {
        id: 'toast-1',
        title: 'Test Toast',
        open: true,
      }
      mockUseToast.mockReturnValue({ toasts: [toast] })

      render(<Toaster />)

      const toaster = screen.getByLabelText('Notifications')
      expect(toaster).toHaveAttribute('aria-live', 'polite')
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
  })

  describe('layout and styling', () => {
    it('should have correct container classes', () => {
      mockUseToast.mockReturnValue({ toasts: [] })

      const { container } = render(<Toaster />)

      const toaster = container.firstChild as HTMLElement
      expect(toaster).toHaveClass(
        'pointer-events-none',
        'fixed',
        'inset-0',
        'z-50',
        'flex',
        'flex-col',
        'items-end'
      )
    })
  })

  describe('toast updates', () => {
    it('should update when toasts change', () => {
      const { rerender } = render(<Toaster />)

      // Initially no toasts
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()

      // Add a toast
      const toast: Toast = {
        id: 'toast-1',
        title: 'New Toast',
        open: true,
      }
      mockUseToast.mockReturnValue({ toasts: [toast] })
      rerender(<Toaster />)

      expect(screen.getByText('New Toast')).toBeInTheDocument()
    })

    it('should remove toast when it is dismissed', () => {
      const toast: Toast = {
        id: 'toast-1',
        title: 'Toast to Remove',
        open: true,
      }
      mockUseToast.mockReturnValue({ toasts: [toast] })

      const { rerender } = render(<Toaster />)
      expect(screen.getByText('Toast to Remove')).toBeInTheDocument()

      // Toast is removed
      mockUseToast.mockReturnValue({ toasts: [] })
      rerender(<Toaster />)

      expect(screen.queryByText('Toast to Remove')).not.toBeInTheDocument()
    })
  })
})
