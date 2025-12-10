import { memo } from 'react'

interface LoadingOverlayProps {
  isVisible: boolean
}

export default memo(function LoadingOverlay({ isVisible }: LoadingOverlayProps) {
  if (!isVisible) return null

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-white/50 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-2">
        <div className="size-8 animate-spin rounded-full border-4 border-neutral-300 border-t-neutral-600" />
      </div>
    </div>
  )
})
