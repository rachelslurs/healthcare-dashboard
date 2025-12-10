import { format, parseISO } from 'date-fns'
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
    // Parse the ISO timestamp - parseISO handles timezone-aware dates correctly
    // If the timestamp has timezone info, it will be parsed correctly
    // If it's naive (no timezone), parseISO treats it as local time
    // To ensure UTC timestamps are handled correctly, check if it needs timezone info
    let date: Date
    
    // If timestamp doesn't have timezone indicator (Z or +/- offset), 
    // assume it's UTC and append Z
    if (timestamp && !timestamp.includes('Z') && !timestamp.match(/[+-]\d{2}:\d{2}$/)) {
      // Treat naive datetime as UTC
      date = parseISO(timestamp + 'Z')
    } else {
      date = parseISO(timestamp)
    }
    
    // format uses the date's local time representation automatically
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
      width: '12%',
    },
    {
      header: 'Description',
      accessor: 'description',
      width: '40%',
    },
    {
      header: 'Timestamp',
      accessor: (row) => formatTimestamp(row.timestamp),
      sortable: true,
      sortKey: 'timestamp',
      width: '28%',
    },
    {
      header: 'Patient ID',
      accessor: 'patientId',
      width: '20%',
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
