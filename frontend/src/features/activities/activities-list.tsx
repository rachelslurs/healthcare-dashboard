import { format } from 'date-fns'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import DataTable, { type ColumnDefinition } from '@/components/layout/data-table'
import type { Activity } from './types'
import { getActivities } from './api'
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
  const [page, setPage] = useState(1)

  const { currentSortBy, currentSortOrder, handleSort } = useSortedData({
    defaultSortOrder: 'desc',
    onSortChange: () => {
      // Reset to first page when sorting changes
      setPage(1)
    },
  })

  // Use TanStack Query for data fetching
  const {
    data,
    isLoading,
    error,
    isFetching,
  } = useQuery({
    queryKey: ['activities', page, 10, currentSortBy, currentSortOrder],
    queryFn: () =>
      getActivities({
        page,
        pageSize: 10,
        sortBy: currentSortBy as 'timestamp' | undefined,
        sortOrder: currentSortOrder,
      }),
    staleTime: 1000 * 60 * 5, // 5 minutes
    placeholderData: (previousData) => previousData, // Keep previous data visible during transitions
  })

  const goToPage = (newPage: number) => {
    setPage(newPage)
  }

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
