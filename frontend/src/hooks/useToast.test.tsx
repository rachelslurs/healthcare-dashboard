import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'

import useToast from './useToast'
import type { Toast } from '@/lib/toast'
import * as toastLib from '@/lib/toast'

// Mock the toast library
const mockGetToastState = vi.fn()
const mockSubscribe = vi.fn()
const mockToastFn = vi.fn()
const mockDismissToast = vi.fn()

vi.mock('@/lib/toast', () => ({
  getToastState: () => mockGetToastState(),
  subscribe: (listener: (state: { toasts: Toast[] }) => void) => mockSubscribe(listener),
  toast: (...args: any[]) => mockToastFn(...args),
  dismissToast: (...args: any[]) => mockDismissToast(...args),
}))

describe('useToast', () => {
  let mockUnsubscribe: () => void
  let currentListener: ((state: { toasts: Toast[] }) => void) | null = null

  beforeEach(() => {
    vi.clearAllMocks()
    mockUnsubscribe = vi.fn()
    
    // Setup mock subscribe to capture the listener
    mockSubscribe.mockImplementation((listener: (state: { toasts: Toast[] }) => void) => {
      currentListener = listener
      return mockUnsubscribe
    })

    // Setup default initial state
    mockGetToastState.mockReturnValue({ toasts: [] })
  })

  afterEach(() => {
    currentListener = null
  })

  describe('initial state', () => {
    it('should initialize with current toast state', () => {
      const initialToasts: Toast[] = [
        {
          id: 'toast-1',
          title: 'Initial Toast',
          open: true,
        },
      ]
      mockGetToastState.mockReturnValue({ toasts: initialToasts })

      const { result } = renderHook(() => useToast())

      expect(result.current.toasts).toEqual(initialToasts)
      expect(mockGetToastState).toHaveBeenCalledTimes(1)
    })
  })

  describe('subscription', () => {
    it('should subscribe to toast state changes on mount', () => {
      renderHook(() => useToast())

      expect(mockSubscribe).toHaveBeenCalledTimes(1)
      expect(mockSubscribe).toHaveBeenCalledWith(expect.any(Function))
    })

    it('should unsubscribe on unmount', () => {
      const { unmount } = renderHook(() => useToast())

      expect(mockUnsubscribe).not.toHaveBeenCalled()

      unmount()

      expect(mockUnsubscribe).toHaveBeenCalledTimes(1)
    })

    it('should update state when listener is called', async () => {
      const { result } = renderHook(() => useToast())

      expect(result.current.toasts).toEqual([])

      const newToasts: Toast[] = [
        {
          id: 'toast-1',
          title: 'New Toast',
          open: true,
        },
      ]

      act(() => {
        if (currentListener) {
          currentListener({ toasts: newToasts })
        }
      })

      await waitFor(() => {
        expect(result.current.toasts).toEqual(newToasts)
      })
    })

  })

  describe('return values', () => {
    it('should return toasts array', () => {
      const toasts: Toast[] = [
        { id: 'toast-1', title: 'Test', open: true },
      ]
      mockGetToastState.mockReturnValue({ toasts })

      const { result } = renderHook(() => useToast())

      expect(result.current.toasts).toBeDefined()
      expect(Array.isArray(result.current.toasts)).toBe(true)
      expect(result.current.toasts).toEqual(toasts)
    })

    it('should return toast function', () => {
      const { result } = renderHook(() => useToast())

      expect(result.current.toast).toBeDefined()
      expect(typeof result.current.toast).toBe('function')
    })

    it('should return dismiss function', () => {
      const { result } = renderHook(() => useToast())

      expect(result.current.dismiss).toBeDefined()
      expect(typeof result.current.dismiss).toBe('function')
    })
  })

  describe('toast function', () => {
    it('should call toast library function when toast is called', () => {
      const { result } = renderHook(() => useToast())

      act(() => {
        result.current.toast({
          title: 'Test Toast',
          description: 'Test description',
        })
      })

      expect(mockToastFn).toHaveBeenCalledTimes(1)
      expect(mockToastFn).toHaveBeenCalledWith({
        title: 'Test Toast',
        description: 'Test description',
      })
    })

  })

  describe('dismiss function', () => {
    it('should call dismissToast library function when dismiss is called', () => {
      const { result } = renderHook(() => useToast())

      act(() => {
        result.current.dismiss('toast-123')
      })

      expect(mockDismissToast).toHaveBeenCalledTimes(1)
      expect(mockDismissToast).toHaveBeenCalledWith('toast-123')
    })
  })

})
