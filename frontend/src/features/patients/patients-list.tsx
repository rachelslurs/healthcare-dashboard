import { useState, useEffect } from 'react'
import DataTable, { type ColumnDefinition, type PaginatedData } from '@/components/layout/data-table'
import type { PatientListItem } from './types'
import { getPatients } from './api'

// Define columns for the patients table
const columns: ColumnDefinition<PatientListItem>[] = [
  {
    header: 'First Name',
    accessor: 'firstName',
  },
  {
    header: 'Last Name',
    accessor: 'lastName',
  },
  {
    header: 'Status',
    accessor: 'status',
  },
  {
    header: 'Last Visit',
    accessor: 'lastVisit',
  },
]

export default function PatientsList() {
  const [data, setData] = useState<PaginatedData<PatientListItem> | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Get page number from URL search params
  const getPageFromUrl = () => {
    if (typeof window === 'undefined') return 1
    const params = new URLSearchParams(window.location.search)
    const page = parseInt(params.get('page') || '1', 10)
    return isNaN(page) || page < 1 ? 1 : page
  }

  // Fetch patients data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        const page = getPageFromUrl()
        const result = await getPatients({ page, pageSize: 10 })
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch patients'))
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
  }, []) // Only run on mount

  // Build pagination URL with query parameters
  const buildPageUrl = (page: number) => {
    return `/patients?page=${page}`
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Patients</h1>
      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        error={error}
        itemLabel="patients"
        buildPageUrl={buildPageUrl}
        emptyMessage="No patients found"
      />
    </div>
  )
}
