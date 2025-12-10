import { format } from 'date-fns'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import DataTable, { type ColumnDefinition } from '@/components/layout/data-table'
import type { Activity } from './types'
import { getActivities } from './api'
import useSortedData from '@/hooks/useSortedData'
import { Badge } from '@/components/ui/badge'

// Format timestamp for display (localized to user's timezone)
const formatTimestamp = (timestamp: string): string => {
  try {
    const date = new Date(timestamp)
    // date-fns format automatically uses local timezone
    return format(date, 'MMM d, yyyy h:mm a')
  } catch {
    return timestamp
  }
}

// Get badge color based on action type
const getActionColor = (actionType: string): 'green' | 'blue' | 'red' | 'orange' | 'purple' | 'zinc' => {
  const upperAction = actionType.toUpperCase()
  switch (upperAction) {
    case 'CREATE':
      return 'green'
    case 'UPDATE':
      return 'blue'
    case 'DELETE':
      return 'red'
    default:
      return 'zinc'
  }
}

// Format action type as a badge
const formatActionType = (actionType: string) => {
  const color = getActionColor(actionType)
  return <Badge color={color}>{actionType}</Badge>
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
      accessor: (row) => formatActionType(row.actionType),
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
