import { useState } from 'react'

interface UseSortedDataOptions {
  defaultSortOrder?: 'asc' | 'desc'
  onSortChange?: () => void // Optional callback when sort changes (e.g., to reset page)
}

/**
 * Reusable hook for managing sort state with local state
 */
export default function useSortedData({ 
  defaultSortOrder = 'asc',
  onSortChange,
}: UseSortedDataOptions = {}) {
  const [sortBy, setSortBy] = useState<string | undefined>(undefined)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(defaultSortOrder)

  // Handle column sort
  const handleSort = (columnKey: string) => {
    const newSortBy = columnKey
    const newSortOrder = sortBy === columnKey && sortOrder === 'asc' ? 'desc' : 'asc'
    
    setSortBy(newSortBy)
    setSortOrder(newSortOrder)
    
    // Call optional callback
    onSortChange?.()
  }

  return {
    currentSortBy: sortBy,
    currentSortOrder: sortOrder,
    handleSort,
  }
}
