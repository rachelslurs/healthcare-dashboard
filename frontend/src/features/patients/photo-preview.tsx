import { memo, useMemo } from 'react'

interface PhotoPreviewProps {
  photoPreview: string | null
  currentPhotoUrl: string | undefined
  apiBaseUrl: string
}

// Memoized photo preview component to avoid recalculating URL on every render
export default memo(function PhotoPreview({ photoPreview, currentPhotoUrl, apiBaseUrl }: PhotoPreviewProps) {
  const photoUrl = useMemo(() => {
    if (photoPreview) return photoPreview
    if (currentPhotoUrl) {
      return `${apiBaseUrl}${currentPhotoUrl.startsWith('/') ? currentPhotoUrl : `/${currentPhotoUrl}`}`
    }
    return ''
  }, [photoPreview, currentPhotoUrl, apiBaseUrl])

  return (
    <img
      src={photoUrl}
      alt="Patient photo preview"
      className="w-32 h-32 rounded-full object-cover border-2 border-neutral-200"
    />
  )
})
