import { format } from 'date-fns'
import { useRef, useEffect } from 'react'
import DataTable, { type ColumnDefinition } from '@/components/layout/data-table'
import type { Activity } from './types'
import { getActivities } from './api'
import usePaginatedData from '@/hooks/usePaginatedData'
import useSortedData from '@/hooks/useSortedData'

// Format timestamp for display
const formatTimestamp = (timestamp: string): string => {
  try {
    const date = new Date(timestamp)
    return format(date, 'MMM d, yyyy h:mm a')
  } catch {
    return timestamp
  }
}

export default function ActivitiesList() {
  const goToPageRef = useRef<((page: number) => void) | null>(null)

  const { currentSortBy, currentSortOrder, handleSort } = useSortedData({
    defaultSortOrder: 'desc',
    onSortChange: () => {
      // Reset to first page when sorting changes
      goToPageRef.current?.(1)
    },
  })

  const { data, isLoading, error, goToPage, isFetching } = usePaginatedData({
    fetchFn: ({ page, pageSize, sortBy, sortOrder }) => getActivities({ 
      page, 
      pageSize, 
      sortBy: sortBy as 'timestamp' | undefined, 
      sortOrder 
    }),
    pageSize: 10,
    sortBy: currentSortBy,
    sortOrder: currentSortOrder,
  })

  useEffect(() => {
    goToPageRef.current = goToPage
  }, [goToPage])

  // Define columns for the activities table
  const columns: ColumnDefinition<Activity>[] = [
    {
      header: 'Action',
      accessor: 'actionType',
    },
    {
      header: 'Description',
      accessor: 'description',
    },
    {
      header: 'Timestamp',
      accessor: (row) => formatTimestamp(row.timestamp),
      sortable: true,
      sortKey: 'timestamp',
    },
    {
      header: 'Patient ID',
      accessor: 'patientId',
    },
  ]

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        isFetching={isFetching}
        error={error}
        itemLabel="activities"
        onPageChange={goToPage}
        emptyMessage="No activities found"
        onSort={handleSort}
        currentSortBy={currentSortBy}
        currentSortOrder={currentSortOrder}
        showShowingText={true}
      />
    </div>
  )
}
