import { useState, useEffect, useRef } from 'react'
import type { PaginatedData } from '@/components/layout/data-table'

interface UsePaginatedDataOptions<T> {
  fetchFn: (params: { page: number; pageSize: number; sortBy?: string; sortOrder?: 'asc' | 'desc' }) => Promise<PaginatedData<T>>
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  initialPage?: number
}

/**
 * Reusable hook for fetching paginated data with local state management
 */
export default function usePaginatedData<T>({
  fetchFn,
  pageSize = 10,
  sortBy,
  sortOrder,
  initialPage = 1,
}: UsePaginatedDataOptions<T>) {
  const [data, setData] = useState<PaginatedData<T> | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [page, setPage] = useState(initialPage)
  const [isFetching, setIsFetching] = useState(false)

  // Store fetchFn in ref to avoid dependency issues
  const fetchFnRef = useRef(fetchFn)
  useEffect(() => {
    fetchFnRef.current = fetchFn
  }, [fetchFn])

  const fetchData = async () => {
    setIsLoading(true)
    setIsFetching(true)
    setError(null)
    
    try {
      const result = await fetchFnRef.current({ page, pageSize, sortBy, sortOrder })
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch data'))
    } finally {
      setIsLoading(false)
      setIsFetching(false)
    }
  }
  
  useEffect(() => {
    fetchData()
  }, [page, pageSize, sortBy, sortOrder]) // Re-run when page, pageSize, or sort params change

  const goToPage = (newPage: number) => {
    setPage(newPage)
  }

  return { 
    data, 
    isLoading, 
    isFetching,
    error, 
    refetch: fetchData,
    page,
    goToPage,
  }
}
