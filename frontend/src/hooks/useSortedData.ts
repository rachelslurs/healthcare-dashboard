import { useNavigate } from '@tanstack/react-router'
import { getSearchParams } from '@/lib/ssr'

interface UseSortedDataOptions {
  defaultSortOrder?: 'asc' | 'desc'
  to?: string // Optional route path, defaults to current pathname
  onSortChange?: () => void // Optional callback when sort changes (e.g., to reset page)
}

/**
 * Reusable hook for managing sort state via URL parameters
 */
export default function useSortedData({ 
  defaultSortOrder = 'asc',
  to,
  onSortChange,
}: UseSortedDataOptions = {}) {
  const navigate = useNavigate()

  // Get current sort params from URL
  const getSortParams = () => {
    const params = getSearchParams()
    const sortBy = params.get('sortBy') || undefined
    const sortOrder = (params.get('sortOrder') || defaultSortOrder) as 'asc' | 'desc'
    return { sortBy, sortOrder }
  }

  const { sortBy: currentSortBy, sortOrder: currentSortOrder } = getSortParams()

  // Handle column sort
  const handleSort = (columnKey: string) => {
    const params = getSearchParams()
    const newSortBy = columnKey
    const newSortOrder = currentSortBy === columnKey && currentSortOrder === 'asc' ? 'desc' : 'asc'
    
    params.set('sortBy', newSortBy)
    params.set('sortOrder', newSortOrder)
    params.set('page', '1') // Reset to first page when sorting
    
    // Use provided route path or default to current pathname
    const routePath = to || (typeof window !== 'undefined' ? window.location.pathname : '/')
    navigate({ to: routePath, search: Object.fromEntries(params) })
    
    // Call optional callback
    onSortChange?.()
  }

  return {
    currentSortBy,
    currentSortOrder,
    handleSort,
  }
}
