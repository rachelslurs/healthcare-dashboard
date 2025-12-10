import useToast from '@/hooks/use-toast'
import { Toast } from '@/components/ui/toast'
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
      className="pointer-events-none fixed inset-0 z-50 flex flex-col items-end gap-4 p-4 sm:items-end sm:p-6 lg:left-64 lg:top-20"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          toast={toast}
          onOpenChange={(open) => {
            if (!open) {
              dismissToast(toast.id)
            }
          }}
        />
      ))}
    </div>
  )
}
