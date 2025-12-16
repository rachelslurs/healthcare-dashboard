import { useQuery } from '@tanstack/react-query'
import { useState, useMemo, useCallback } from 'react'

import DataTable, { type ColumnDefinition } from '@/components/layout/data-table'
import { Badge } from '@/components/ui/badge'
import useSortedData from '@/hooks/useSortedData'
import { getActionColor } from '@/lib/badge-utils'
import { formatTimestamp } from '@/lib/date-utils'

import { getActivities } from './api'
import type { Activity } from './types'

// Map backend action types to user-friendly labels
const getActionLabel = (actionType: string): string => {
  switch (actionType.toUpperCase()) {
    case 'CREATE':
      return 'Added'
    case 'UPDATE':
      return 'Edited'
    case 'DELETE':
      return 'Deleted'
    default:
      return actionType
  }
}

// Format action type as a badge
const formatActionType = (actionType: string) => {
  const label = getActionLabel(actionType)
  const color = getActionColor(actionType)
  return <Badge color={color}>{label}</Badge>
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

  const goToPage = useCallback((newPage: number) => {
    setPage(newPage)
  }, [])

  // Define columns for the activities table - memoized to prevent recreation
  const columns: ColumnDefinition<Activity>[] = useMemo(() => [
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
  ], [])

  return (
    <div className='p-2'>
      <div className='flex items-center justify-between mb-6 py-4 min-h-16'>
        <h1 className='text-2xl font-bold leading-tight'>Activities</h1>
        <div></div>
      </div>
      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        isFetching={isFetching}
        error={error}
        itemLabel='activities'
        onPageChange={goToPage}
        emptyMessage='No activities found'
        onSort={handleSort}
        currentSortBy={currentSortBy}
        currentSortOrder={currentSortOrder}
        showShowingText={true}
      />
    </div>
  )
}
