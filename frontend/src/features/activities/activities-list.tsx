import { format } from 'date-fns'
import DataTable, { type ColumnDefinition } from '@/components/layout/data-table'
import type { Activity } from './types'
import { getActivities } from './api'
import usePaginatedData from '@/hooks/usePaginatedData'

// Format timestamp for display
const formatTimestamp = (timestamp: string): string => {
  try {
    const date = new Date(timestamp)
    return format(date, 'MMM d, yyyy h:mm a')
  } catch {
    return timestamp
  }
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
  },
  {
    header: 'Patient ID',
    accessor: 'patientId',
  },
]

export default function ActivitiesList() {
  const { data, isLoading, error } = usePaginatedData({
    fetchFn: ({ page, pageSize }) => getActivities({ page, pageSize }),
    pageSize: 10,
  })

  // Build pagination URL with query parameters
  const buildPageUrl = (page: number) => {
    return `/?page=${page}`
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        error={error}
        itemLabel="activities"
        buildPageUrl={buildPageUrl}
        emptyMessage="No activities found"
      />
    </div>
  )
}
