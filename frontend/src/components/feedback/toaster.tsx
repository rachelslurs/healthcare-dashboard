import * as Headless from '@headlessui/react'

import { Toast } from '@/components/ui/toast'
import useToast from '@/hooks/useToast'
import { dismissToast } from '@/lib/toast'

/**
 * Toaster component that renders all active toasts
 * 
 * This component should be rendered once at the root of the application.
 * It subscribes to the global toast state and renders each toast.
 * 
 * @example
 * ```tsx
 * // In your root component
 * <Toaster />
 * ```
 */
export default function Toaster() {
  const { toasts } = useToast()

  return (
    <div
      className='pointer-events-none fixed inset-0 z-50 flex flex-col items-end gap-4 p-2 sm:items-end sm:p-6 lg:left-64 lg:top-20'
      aria-live='polite'
      aria-label='Notifications'
    >
      {toasts.map((toast) => (
        <Headless.Transition
          key={toast.id}
          show={toast.open !== false}
          enter='transition-all duration-300 ease-out'
          enterFrom='opacity-0 translate-x-full scale-95'
          enterTo='opacity-100 translate-x-0 scale-100'
          leave='transition-all duration-200 ease-in'
          leaveFrom='opacity-100 translate-x-0 scale-100'
          leaveTo='opacity-0 translate-x-full scale-95'
        >
          <div className='pointer-events-auto'>
            <Toast
              toast={toast}
              onOpenChange={(open) => {
                if (!open) {
                  dismissToast(toast.id)
                }
              }}
            />
          </div>
        </Headless.Transition>
      ))}
    </div>
  )
}
