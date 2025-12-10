import { format } from 'date-fns'
import DataTable, { type ColumnDefinition } from '@/components/layout/data-table'
import type { PatientListItem } from './types'
import { getPatients } from './api'
import usePaginatedData from '@/hooks/usePaginatedData'
import useSortedData from '@/hooks/useSortedData'

// Format date for display
const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return '—'
  try {
    return format(new Date(dateString), 'MMM d, yyyy')
  } catch {
    return dateString
  }
}

// Format age for display
const formatAge = (age: number | undefined): string => {
  if (age === undefined || age === null) return '—'
  return `${age}`
}

export default function PatientsList() {
  const { currentSortBy, currentSortOrder, handleSort } = useSortedData({
    defaultSortOrder: 'asc',
    to: '/patients',
  })

  // Define columns for the patients table
  const columns: ColumnDefinition<PatientListItem>[] = [
    {
      header: 'First Name',
      accessor: 'firstName',
      sortable: false,
    },
    {
      header: 'Last Name',
      accessor: 'lastName',
      sortable: true,
      sortKey: 'lastName',
    },
    {
      header: 'Age',
      accessor: (row) => formatAge(row.age),
      sortable: false,
    },
    {
      header: 'Status',
      accessor: 'status',
      sortable: false,
    },
    {
      header: 'Last Visit',
      accessor: (row) => formatDate(row.lastVisit),
      sortable: true,
      sortKey: 'lastVisit',
    },
  ]

  const { data, isLoading, error } = usePaginatedData({
    fetchFn: ({ page, pageSize, sortBy, sortOrder }) => {
      return getPatients({ 
        page, 
        pageSize, 
        sortBy: sortBy as 'lastName' | 'lastVisit' | undefined, 
        sortOrder 
      })
    },
    pageSize: 10,
  })

  // Build pagination URL with query parameters
  const buildPageUrl = (page: number) => {
    const params = new URLSearchParams(window.location.search)
    params.set('page', page.toString())
    return `/patients?${params.toString()}`
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
        onSort={handleSort}
        currentSortBy={currentSortBy}
        currentSortOrder={currentSortOrder}
      />
    </div>
  )
}
