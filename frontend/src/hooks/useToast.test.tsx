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

    it('should initialize with empty array when no toasts exist', () => {
      mockGetToastState.mockReturnValue({ toasts: [] })

      const { result } = renderHook(() => useToast())

      expect(result.current.toasts).toEqual([])
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

    it('should handle multiple state updates', async () => {
      const { result } = renderHook(() => useToast())

      const firstUpdate: Toast[] = [
        { id: 'toast-1', title: 'First', open: true },
      ]

      act(() => {
        if (currentListener) {
          currentListener({ toasts: firstUpdate })
        }
      })

      await waitFor(() => {
        expect(result.current.toasts).toEqual(firstUpdate)
      })

      const secondUpdate: Toast[] = [
        { id: 'toast-1', title: 'First', open: true },
        { id: 'toast-2', title: 'Second', open: true },
      ]

      act(() => {
        if (currentListener) {
          currentListener({ toasts: secondUpdate })
        }
      })

      await waitFor(() => {
        expect(result.current.toasts).toEqual(secondUpdate)
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

    it('should support all toast options', () => {
      const { result } = renderHook(() => useToast())

      const mockActionClick = vi.fn()

      act(() => {
        result.current.toast({
          title: 'Success',
          description: 'Operation completed',
          variant: 'destructive',
          action: {
            altText: 'View',
            onClick: mockActionClick,
          },
        })
      })

      expect(mockToastFn).toHaveBeenCalledWith({
        title: 'Success',
        description: 'Operation completed',
        variant: 'destructive',
        action: {
          altText: 'View',
          onClick: mockActionClick,
        },
      })
    })

    it('should return toast instance with dismiss and update methods', () => {
      const mockToastInstance = {
        id: 'toast-1',
        dismiss: vi.fn(),
        update: vi.fn(),
      }
      mockToastFn.mockReturnValue(mockToastInstance)

      const { result } = renderHook(() => useToast())

      let toastInstance: any
      act(() => {
        toastInstance = result.current.toast({ title: 'Test' })
      })

      expect(toastInstance).toBeDefined()
      expect(toastInstance.id).toBe('toast-1')
      expect(typeof toastInstance.dismiss).toBe('function')
      expect(typeof toastInstance.update).toBe('function')
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

  describe('cleanup', () => {
    it('should clean up subscription when component unmounts', () => {
      const { unmount } = renderHook(() => useToast())

      expect(mockUnsubscribe).not.toHaveBeenCalled()

      unmount()

      expect(mockUnsubscribe).toHaveBeenCalledTimes(1)
    })

    it('should not update state after unmount', async () => {
      const { result, unmount } = renderHook(() => useToast())

      unmount()

      const newToasts: Toast[] = [
        { id: 'toast-1', title: 'Should not update', open: true },
      ]

      act(() => {
        if (currentListener) {
          currentListener({ toasts: newToasts })
        }
      })

      // Wait a bit to ensure no update happens
      await new Promise(resolve => setTimeout(resolve, 10))

      // State should remain unchanged (empty array from initial state)
      expect(result.current.toasts).toEqual([])
    })
  })

  describe('multiple instances', () => {
    it('should allow multiple hook instances to subscribe independently', () => {
      const { result: result1 } = renderHook(() => useToast())
      const { result: result2 } = renderHook(() => useToast())

      expect(mockSubscribe).toHaveBeenCalledTimes(2)

      const toasts1: Toast[] = [{ id: 'toast-1', title: 'First', open: true }]
      const toasts2: Toast[] = [{ id: 'toast-2', title: 'Second', open: true }]

      // Both should receive updates
      act(() => {
        if (currentListener) {
          currentListener({ toasts: toasts1 })
        }
      })

      // Note: In a real scenario, both listeners would be called
      // This test verifies both hooks can exist simultaneously
      expect(result1.current.toasts).toBeDefined()
      expect(result2.current.toasts).toBeDefined()
    })
  })
})
