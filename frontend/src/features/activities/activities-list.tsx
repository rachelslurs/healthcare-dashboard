import DataTable, { type ColumnDefinition, type PaginatedData } from '@/components/layout/data-table'
import type { Activity } from './types'

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
    accessor: 'timestamp',
  },
  {
    header: 'Patient ID',
    accessor: 'patientId',
  },
]

export default function ActivitiesList() {
  // For now, empty data - will be replaced with API call later
  const data: PaginatedData<Activity> | undefined = undefined
  const isLoading = false
  const error = null

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
