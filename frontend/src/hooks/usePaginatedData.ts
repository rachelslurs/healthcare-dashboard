import { useState, useEffect, useRef } from 'react'
import type { PaginatedData } from '@/components/layout/data-table'

interface UsePaginatedDataOptions<T> {
  fetchFn: (params: { page: number; pageSize: number }) => Promise<PaginatedData<T>>
  pageSize?: number
  getPageFromUrl?: () => number
}

/**
 * Reusable hook for fetching paginated data with URL-based pagination
 */
export default function usePaginatedData<T>({
  fetchFn,
  pageSize = 10,
  getPageFromUrl,
}: UsePaginatedDataOptions<T>) {
  const [data, setData] = useState<PaginatedData<T> | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Store fetchFn in ref to avoid dependency issues
  const fetchFnRef = useRef(fetchFn)
  useEffect(() => {
    fetchFnRef.current = fetchFn
  }, [fetchFn])

  // Store getPageFromUrl in ref
  const getPageFromUrlRef = useRef(getPageFromUrl)
  useEffect(() => {
    getPageFromUrlRef.current = getPageFromUrl
  }, [getPageFromUrl])

  // Default function to get page from URL search params
  const defaultGetPageFromUrl = () => {
    if (typeof window === 'undefined') return 1
    const params = new URLSearchParams(window.location.search)
    const page = parseInt(params.get('page') || '1', 10)
    return isNaN(page) || page < 1 ? 1 : page
  }

  const getPage = () => {
    return getPageFromUrlRef.current ? getPageFromUrlRef.current() : defaultGetPageFromUrl()
  }

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        const page = getPage()
        const result = await fetchFnRef.current({ page, pageSize })
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch data'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()

    // Re-fetch when URL search params change (for pagination)
    const handleLocationChange = () => {
      fetchData()
    }

    // Listen for popstate (back/forward navigation)
    window.addEventListener('popstate', handleLocationChange)
    
    // Also listen for pushstate/replacestate (TanStack Router navigation)
    const originalPushState = history.pushState
    const originalReplaceState = history.replaceState
    
    history.pushState = function(...args) {
      originalPushState.apply(history, args)
      setTimeout(handleLocationChange, 0)
    }
    
    history.replaceState = function(...args) {
      originalReplaceState.apply(history, args)
      setTimeout(handleLocationChange, 0)
    }

    return () => {
      window.removeEventListener('popstate', handleLocationChange)
      history.pushState = originalPushState
      history.replaceState = originalReplaceState
    }
  }, [pageSize]) // Only pageSize as dependency, fetchFn is in ref

  return { data, isLoading, error }
}
