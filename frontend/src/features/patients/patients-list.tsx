import { MagnifyingGlassIcon } from '@heroicons/react/20/solid'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { useMemo, useCallback, memo } from 'react'
import type React from 'react'

import DataTable, { type ColumnDefinition } from '@/components/layout/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input, InputGroup } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { TableRow, TableCell } from '@/components/ui/table'
import useDebounce from '@/hooks/useDebounce'
import useSortedData from '@/hooks/useSortedData'
import { getStatusColor } from '@/lib/badge-utils'
import { formatDate } from '@/lib/date-utils'

import { getPatients } from './api'
import type { PatientListItem } from './types'

// Format age for display - moved outside component for performance
const formatAge = (age: number | undefined): string => {
  if (age === undefined || age === null) return '—'
  return `${age}`
}

// Format status as a badge - memoized component for performance
const StatusBadge = memo(({ status }: { status: 'active' | 'inactive' | 'archived' }) => {
  const color = getStatusColor(status)
  const capitalizedStatus = status.charAt(0).toUpperCase() + status.slice(1)
  return <Badge color={color}>{capitalizedStatus}</Badge>
})
StatusBadge.displayName = 'StatusBadge'

// Format status as a badge - wrapper function
const formatStatus = (status: 'active' | 'inactive' | 'archived') => {
  return <StatusBadge status={status} />
}

export default function PatientsList() {
  const navigate = useNavigate()
  // Get search params from current route
  const rawSearch = useSearch({ strict: false })
  // Memoize search object to prevent unnecessary re-renders in useCallback dependencies
  const search = useMemo(() => {
    return (rawSearch || {}) as {
      page?: number
      search?: string
      status?: 'active' | 'inactive' | 'archived'
      sortBy?: string
      sortOrder?: 'asc' | 'desc'
    }
  }, [rawSearch])

  const page = search.page || 1
  const searchTerm = search.search ?? ''
  const statusFilter = search.status
  const debouncedSearch = useDebounce(searchTerm, 300)

  const { currentSortBy, currentSortOrder, handleSort } = useSortedData({
    defaultSortOrder: 'asc',
    routePath: '/patients',
  })

  // Update URL when search changes (URL updates immediately, API call is debounced via query key)
  const handleSearchChange = useCallback((value: string) => {
    navigate({
      to: '/patients',
      search: {
        ...search,
        search: value || undefined,
        page: 1, // Reset to first page when search changes
      },
    })
  }, [navigate, search])

  // Update URL when status filter changes
  const handleStatusChange = useCallback((value: string) => {
    navigate({
      to: '/patients',
      search: {
        ...search,
        status: (value === 'all' ? undefined : value) as 'active' | 'inactive' | 'archived' | undefined,
        page: 1, // Reset to first page when filter changes
      },
    })
  }, [navigate, search])

  // Define columns for the patients table - memoized to prevent recreation on every render
  const columns: ColumnDefinition<PatientListItem>[] = useMemo(() => [
    {
      header: 'Name',
      accessor: (row) => `${row.firstName || ''} ${row.lastName || ''}`.trim() || '—',
      sortable: false,
      width: '20%',
    },
    {
      header: 'Age',
      accessor: (row) => formatAge(row.age),
      sortable: false,
      width: '15%',
    },
    {
      header: 'Status',
      accessor: (row) => formatStatus(row.status),
      sortable: true,
      sortKey: 'status',
      width: '15%',
    },
    {
      header: 'Last Visit',
      accessor: (row) => formatDate(row.lastVisit),
      sortable: true,
      sortKey: 'lastVisit',
      width: '20%',
    },
  ], [])

  // Use TanStack Query for data fetching
  const {
    data,
    isLoading,
    error,
    isFetching,
  } = useQuery({
    queryKey: ['patients', page, 10, currentSortBy, currentSortOrder, debouncedSearch, statusFilter],
    queryFn: () =>
      getPatients({
        page,
        pageSize: 10,
        sortBy: currentSortBy as 'lastName' | 'lastVisit' | 'status' | undefined,
        sortOrder: currentSortOrder,
        search: debouncedSearch || undefined,
        status: statusFilter,
      }),
    staleTime: 1000 * 60 * 5, // 5 minutes
    placeholderData: (previousData) => previousData, // Keep previous data visible during transitions
  })

  const goToPage = useCallback((newPage: number) => {
    navigate({
      to: '/patients',
      search: {
        ...search,
        page: newPage,
      },
    })
  }, [navigate, search])

  // Render clickable rows that navigate to patient detail
  // Memoized with useCallback to prevent unnecessary re-renders of table rows
  const renderRow = useCallback((row: PatientListItem, _index: number) => {
    const patientName = `${row.firstName || ''} ${row.lastName || ''}`.trim() || 'Patient'
    return (
      <TableRow
        key={row.id}
        href={`/patients/${row.id}`}
        title={`View ${patientName}`}
        className='cursor-pointer'
      >
        {columns.map((column, colIndex) => {
          let content: React.ReactNode
          if (column.accessor) {
            if (typeof column.accessor === 'function') {
              content = column.accessor(row)
            } else {
              content = row[column.accessor]
            }
          } else {
            content = null
          }
          return (
            <TableCell
              key={colIndex}
              className={column.className}
              style={column.width ? { width: column.width } : undefined}
            >
              {content}
            </TableCell>
          )
        })}
      </TableRow>
    )
  }, [columns])

  return (
    <div className='p-2'>
      <div className='flex items-center justify-between mb-4 self-center'>
        <h1 className='text-2xl font-bold'>Patients</h1>
        <Button href='/patients/new'>Add New Patient</Button>
      </div>

      {/* Search Input and Status Filter */}
      <div className='mb-6 flex items-center justify-between gap-4'>
        <InputGroup className='flex-1 max-w-md self-center'>
          <MagnifyingGlassIcon data-slot='icon' />
          <Input
            type='search'
            placeholder='Search by name...'
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className='w-full'
          />
        </InputGroup>
        <Select
          value={statusFilter || 'all'}
          onChange={(e) => handleStatusChange(e.target.value)}
          className='w-full max-w-xs self-center'
          aria-label='Filter by status'
        >
          <option value='all'>All Statuses</option>
          <option value='active'>Active</option>
          <option value='inactive'>Inactive</option>
          <option value='archived'>Archived</option>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        isFetching={isFetching}
        error={error}
        itemLabel='patients'
        onPageChange={goToPage}
        emptyMessage={debouncedSearch ? 'No patients found matching your search' : 'No patients found'}
        onSort={handleSort}
        currentSortBy={currentSortBy}
        currentSortOrder={currentSortOrder}
        showShowingText={true}
        renderRow={renderRow}
      />
    </div>
  )
}
