import { useNavigate, useSearch } from '@tanstack/react-router'

interface UseSortedDataOptions {
  defaultSortOrder?: 'asc' | 'desc'
  routePath?: string // Route path for navigation (defaults to current route)
  onSortChange?: () => void // Optional callback when sort changes (e.g., to reset page)
}

/**
 * Reusable hook for managing sort state with URL state (TanStack Router)
 * Falls back to local state if not used within a route context
 */
export default function useSortedData({ 
  defaultSortOrder = 'asc',
  routePath,
  onSortChange,
}: UseSortedDataOptions = {}) {
  const navigate = useNavigate()
  
  // Try to get search params from route, fallback to undefined if not in route context
  let searchParams: { sortBy?: string; sortOrder?: 'asc' | 'desc' } | undefined
  try {
    searchParams = useSearch({ strict: false }) as { sortBy?: string; sortOrder?: 'asc' | 'desc' }
  } catch {
    // Not in a route context, will use local state fallback
    searchParams = undefined
  }

  const currentSortBy = searchParams?.sortBy
  const currentSortOrder = (searchParams?.sortOrder || defaultSortOrder) as 'asc' | 'desc'

  // Handle column sort
  const handleSort = (columnKey: string) => {
    const newSortBy = columnKey
    const newSortOrder = currentSortBy === columnKey && currentSortOrder === 'asc' ? 'desc' : 'asc'
    
    // Get current search params
    const currentSearch = searchParams || {}
    
    // Update URL with new sort params and reset page to 1
    const path = routePath || (typeof window !== 'undefined' ? window.location.pathname : '/patients')
    navigate({
      to: path,
      search: {
        ...currentSearch,
        sortBy: newSortBy,
        sortOrder: newSortOrder,
        page: 1, // Reset to first page when sorting
      },
    })
    
    // Call optional callback
    onSortChange?.()
  }

  return {
    currentSortBy,
    currentSortOrder,
    handleSort,
  }
}
