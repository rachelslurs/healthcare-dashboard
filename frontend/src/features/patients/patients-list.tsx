import { format } from 'date-fns'
import { useRef, useEffect } from 'react'
import DataTable, { type ColumnDefinition } from '@/components/layout/data-table'
import type { PatientListItem } from './types'
import { getPatients } from './api'
import usePaginatedData from '@/hooks/usePaginatedData'
import useSortedData from '@/hooks/useSortedData'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

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

// Get badge color based on status
const getStatusColor = (status: 'active' | 'inactive' | 'archived'): 'green' | 'orange' | 'zinc' => {
  switch (status) {
    case 'active':
      return 'green'
    case 'inactive':
      return 'orange'
    case 'archived':
      return 'zinc'
    default:
      return 'zinc'
  }
}

// Format status as a badge
const formatStatus = (status: 'active' | 'inactive' | 'archived') => {
  const color = getStatusColor(status)
  const capitalizedStatus = status.charAt(0).toUpperCase() + status.slice(1)
  return <Badge color={color}>{capitalizedStatus}</Badge>
}

export default function PatientsList() {
  const goToPageRef = useRef<((page: number) => void) | null>(null)

  const { currentSortBy, currentSortOrder, handleSort } = useSortedData({
    defaultSortOrder: 'asc',
    onSortChange: () => {
      // Reset to first page when sorting changes
      goToPageRef.current?.(1)
    },
  })

  // Define columns for the patients table
  const columns: ColumnDefinition<PatientListItem>[] = [
    {
      header: 'Name',
      accessor: (row) => `${row.firstName || ''} ${row.lastName || ''}`.trim() || '—',
      sortable: false,
    },
    {
      header: 'Age',
      accessor: (row) => formatAge(row.age),
      sortable: false,
    },
    {
      header: 'Status',
      accessor: (row) => formatStatus(row.status),
      sortable: true,
      sortKey: 'status',
    },
    {
      header: 'Last Visit',
      accessor: (row) => formatDate(row.lastVisit),
      sortable: true,
      sortKey: 'lastVisit',
    },
  ]

  const { data, isLoading, error, goToPage, isFetching } = usePaginatedData({
    fetchFn: ({ page, pageSize, sortBy, sortOrder }) => {
      return getPatients({ 
        page, 
        pageSize, 
        sortBy: sortBy as 'lastName' | 'lastVisit' | 'status' | undefined, 
        sortOrder 
      })
    },
    pageSize: 10,
    sortBy: currentSortBy,
    sortOrder: currentSortOrder,
  })

  useEffect(() => {
    goToPageRef.current = goToPage
  }, [goToPage])

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Patients</h1>
        <Button href="/patients/new">Add New Patient</Button>
      </div>
      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        isFetching={isFetching}
        error={error}
        itemLabel="patients"
        onPageChange={goToPage}
        emptyMessage="No patients found"
        onSort={handleSort}
        currentSortBy={currentSortBy}
        currentSortOrder={currentSortOrder}
        showShowingText={true}
      />
    </div>
  )
}
