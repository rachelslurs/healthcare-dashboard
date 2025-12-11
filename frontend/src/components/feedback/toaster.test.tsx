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

  })

})
