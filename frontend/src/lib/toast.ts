import type { ReactNode } from 'react'

// Toast configuration constants
const TOAST_LIMIT = 1
const TOAST_REMOVAL_DELAY = 100
const TOAST_DURATION = 5000

// Toast variant types
export type ToastVariant = 'default' | 'destructive'

// Toast action type
export type ToastAction = {
  altText: string
  onClick: () => void
}

// Toast data structure
export type Toast = {
  id: string
  title?: ReactNode
  description?: ReactNode
  variant?: ToastVariant
  action?: ToastAction
  open?: boolean
}

// Toast state
type ToastState = {
  toasts: Toast[]
}

// Toast actions
type ToastActionType =
  | { type: 'ADD_TOAST'; toast: Toast }
  | { type: 'UPDATE_TOAST'; toast: Partial<Toast> & { id: string } }
  | { type: 'DISMISS_TOAST'; toastId: string }
  | { type: 'REMOVE_TOAST'; toastId: string }

// Initial state
const initialState: ToastState = {
  toasts: [],
}

// In-memory state (outside React)
let memoryState: ToastState = initialState

// Listeners array for notifying subscribed components
type Listener = (state: ToastState) => void
const listeners: Listener[] = []

// Timeout map for tracking removal delays
const timeouts = new Map<string, ReturnType<typeof setTimeout>>()

// ID generator (simple counter that wraps)
let toastIdCounter = 0
const generateId = (): string => {
  toastIdCounter = (toastIdCounter + 1) % Number.MAX_SAFE_INTEGER
  return `toast-${toastIdCounter}`
}

// Reducer function
function toastReducer(state: ToastState, action: ToastActionType): ToastState {
  switch (action.type) {
    case 'ADD_TOAST':
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case 'UPDATE_TOAST':
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case 'DISMISS_TOAST': {
      const { toastId } = action
      // Clear any existing timeout for this toast
      const existingTimeout = timeouts.get(toastId)
      if (existingTimeout) {
        clearTimeout(existingTimeout)
      }

      // Set the toast to closed
      const updatedToasts = state.toasts.map((t) =>
        t.id === toastId ? { ...t, open: false } : t
      )

      // Set a timeout to remove the toast after delay
      const timeout = setTimeout(() => {
        dispatch({ type: 'REMOVE_TOAST', toastId })
      }, TOAST_REMOVAL_DELAY)

      timeouts.set(toastId, timeout)

      return {
        ...state,
        toasts: updatedToasts,
      }
    }

    case 'REMOVE_TOAST':
      // Clear timeout if it exists
      const timeout = timeouts.get(action.toastId)
      if (timeout) {
        clearTimeout(timeout)
        timeouts.delete(action.toastId)
      }

      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }

    default:
      return state
  }
}

// Dispatch function that updates memory state and notifies listeners
function dispatch(action: ToastActionType) {
  memoryState = toastReducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

// Toast function (standalone, not a hook)
export function toast(props: {
  title?: ReactNode
  description?: ReactNode
  variant?: ToastVariant
  action?: ToastAction
}) {
  const id = generateId()

  const toast: Toast = {
    id,
    title: props.title,
    description: props.description,
    variant: props.variant || 'default',
    action: props.action,
    open: true,
  }

  dispatch({
    type: 'ADD_TOAST',
    toast,
  })

  // Auto-dismiss after duration (unless it's already been dismissed)
  const timeout = setTimeout(() => {
    dispatch({ type: 'DISMISS_TOAST', toastId: id })
  }, TOAST_DURATION)

  // Store timeout for potential cleanup
  timeouts.set(id, timeout)

  return {
    id,
    dismiss: () => {
      dispatch({ type: 'DISMISS_TOAST', toastId: id })
    },
    update: (props: Partial<Omit<Toast, 'id'>>) => {
      dispatch({
        type: 'UPDATE_TOAST',
        toast: { ...props, id },
      })
    },
  }
}

// Get current state (for initial hook state)
export function getToastState(): ToastState {
  return memoryState
}

// Subscribe to state changes
export function subscribe(listener: Listener) {
  listeners.push(listener)
  return () => {
    const index = listeners.indexOf(listener)
    if (index > -1) {
      listeners.splice(index, 1)
    }
  }
}

// Dismiss a toast by ID
export function dismissToast(toastId: string) {
  dispatch({ type: 'DISMISS_TOAST', toastId })
}
