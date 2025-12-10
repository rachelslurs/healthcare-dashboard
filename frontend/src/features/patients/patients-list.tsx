import { format } from 'date-fns'
import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid'
import DataTable, { type ColumnDefinition } from '@/components/layout/data-table'
import type { PatientListItem } from './types'
import { getPatients } from './api'
import useSortedData from '@/hooks/useSortedData'
import useDebounce from '@/hooks/useDebounce'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input, InputGroup } from '@/components/ui/input'

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
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebounce(searchTerm, 300)

  const { currentSortBy, currentSortOrder, handleSort } = useSortedData({
    defaultSortOrder: 'asc',
    onSortChange: () => {
      // Reset to first page when sorting changes
      setPage(1)
    },
  })

  // Reset to page 1 when search changes
  useEffect(() => {
    setPage(1)
  }, [debouncedSearch])

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

  // Use TanStack Query for data fetching
  const {
    data,
    isLoading,
    error,
    isFetching,
  } = useQuery({
    queryKey: ['patients', page, 10, currentSortBy, currentSortOrder, debouncedSearch],
    queryFn: () =>
      getPatients({
        page,
        pageSize: 10,
        sortBy: currentSortBy as 'lastName' | 'lastVisit' | 'status' | undefined,
        sortOrder: currentSortOrder,
        search: debouncedSearch || undefined,
      }),
    staleTime: 1000 * 60 * 5, // 5 minutes
    placeholderData: (previousData) => previousData, // Keep previous data visible during transitions
  })

  const goToPage = (newPage: number) => {
    setPage(newPage)
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Patients</h1>
        <Button href="/patients/new">Add New Patient</Button>
      </div>

      {/* Search Input */}
      <div className="mb-6">
        <InputGroup>
          <MagnifyingGlassIcon data-slot="icon" />
          <Input
            type="search"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md"
          />
        </InputGroup>
      </div>

      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        isFetching={isFetching}
        error={error}
        itemLabel="patients"
        onPageChange={goToPage}
        emptyMessage={debouncedSearch ? 'No patients found matching your search' : 'No patients found'}
        onSort={handleSort}
        currentSortBy={currentSortBy}
        currentSortOrder={currentSortOrder}
        showShowingText={true}
      />
    </div>
  )
}
