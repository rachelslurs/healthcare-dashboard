import DataTable, { type ColumnDefinition, type PaginatedData } from '@/components/layout/data-table'

// Define the Patient type for the table
type Patient = {
  id: string
  firstName: string
  lastName: string
  status: string
  lastVisit?: string
}

// Define columns for the patients table
const columns: ColumnDefinition<Patient>[] = [
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
    accessor: 'lastVisit',
  },
]

export default function PatientsList() {
  // For now, empty data - will be replaced with API call later
  const data: PaginatedData<Patient> | undefined = undefined
  const isLoading = false
  const error = null

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
