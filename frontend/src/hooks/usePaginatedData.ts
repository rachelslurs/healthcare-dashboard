import { useState, useEffect, useRef } from 'react'
import { useLocation } from '@tanstack/react-router'
import type { PaginatedData } from '@/components/layout/data-table'
import { getSearchParams, getSearchString } from '@/lib/ssr'

interface UsePaginatedDataOptions<T> {
  fetchFn: (params: { page: number; pageSize: number; sortBy?: string; sortOrder?: 'asc' | 'desc' }) => Promise<PaginatedData<T>>
  pageSize?: number
  getPageFromUrl?: () => number
}

/**
 * Reusable hook for fetching paginated data with URL-based pagination
 * Uses TanStack Router's useLocation to reactively respond to URL changes
 */
export default function usePaginatedData<T>({
  fetchFn,
  pageSize = 10,
  getPageFromUrl,
}: UsePaginatedDataOptions<T>) {
  const [data, setData] = useState<PaginatedData<T> | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  
  // useLocation automatically triggers re-renders when the location changes
  // This includes changes via TanStack Router navigation and browser back/forward

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
    const params = getSearchParams()
    const page = parseInt(params.get('page') || '1', 10)
    return isNaN(page) || page < 1 ? 1 : page
  }

  const getPage = () => {
    return getPageFromUrlRef.current ? getPageFromUrlRef.current() : defaultGetPageFromUrl()
  }

  // Get sort parameters from URL
  const getSortParams = () => {
    const params = getSearchParams()
    const sortBy = params.get('sortBy') || undefined
    const sortOrder = (params.get('sortOrder') || 'asc') as 'asc' | 'desc'
    return { sortBy, sortOrder }
  }

  // Fetch data whenever location changes
  // useLocation triggers re-renders when:
  // - TanStack Router navigates (pushState/replaceState)
  // - Browser back/forward navigation (popstate)
  // - Any other URL change
  // Extract search string for dependency tracking
  const searchString = getSearchString()
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        const page = getPage()
        const { sortBy, sortOrder } = getSortParams()
        const result = await fetchFnRef.current({ page, pageSize, sortBy, sortOrder })
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch data'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [pageSize, searchString]) // Re-run when pageSize or search params change

  return { data, isLoading, error }
}
