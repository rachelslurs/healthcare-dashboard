import { format } from 'date-fns'
import DataTable, { type ColumnDefinition } from '@/components/layout/data-table'
import type { PatientListItem } from './types'
import { getPatients } from './api'
import usePaginatedData from '@/hooks/usePaginatedData'

// Format date for display
const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return '—'
  try {
    return format(new Date(dateString), 'MMM d, yyyy')
  } catch {
    return dateString
  }
}

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
    accessor: (row) => formatDate(row.lastVisit),
  },
]

export default function PatientsList() {
  const { data, isLoading, error } = usePaginatedData({
    fetchFn: ({ page, pageSize }) => getPatients({ page, pageSize }),
    pageSize: 10,
  })

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
