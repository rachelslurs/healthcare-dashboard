import { createRoute } from '@tanstack/react-router'
import { baseRoute } from '../_base'
import { Button } from '@/components/ui/button'

export const notFoundRoute = createRoute({
  getParentRoute: () => baseRoute,
  path: '$',
  component: NotFound,
})

function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-neutral-900">404</h1>
        <h2 className="mt-4 text-2xl font-semibold text-neutral-700">
          Page Not Found
        </h2>
        <p className="mt-2 text-sm text-neutral-500">
          The page you're looking for doesn't exist or has been moved.
        </p>
      </div>
      <div className="flex gap-4">
        <Button href="/" color="dark/zinc">
          Go Home
        </Button>
      </div>
    </div>
  )
}
