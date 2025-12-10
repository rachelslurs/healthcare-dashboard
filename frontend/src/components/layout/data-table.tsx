'use client'

import clsx from 'clsx'
import type React from 'react'

import { Button } from '../ui/button'
import { Table, TableBody, TableCell, TableHead, TableRow } from '../ui/table'

import LoadingOverlay from './loading-overlay'
import PaginationControls from './pagination-controls'
import TableHeaderRow from './table-header-row'
import TableSkeleton from './table-skeleton'

// Types
export interface PaginatedData<T> {
  items: T[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export interface ColumnDefinition<T> {
  header: string
  accessor?: keyof T | ((row: T) => React.ReactNode)
  className?: string
  width?: string
  sortable?: boolean
  sortKey?: string
}


interface DataTableProps<T> {
  columns: ColumnDefinition<T>[]
  data: PaginatedData<T> | undefined
  isLoading: boolean
  isFetching?: boolean
  error: Error | null
  refetch?: () => void
  emptyMessage?: string
  itemLabel: string
  onPageChange: (page: number) => void
  renderRow?: (row: T, index: number) => React.ReactNode
  className?: string
  skeletonRows?: number
  onSort?: (sortKey: string) => void
  currentSortBy?: string
  currentSortOrder?: 'asc' | 'desc'
  showShowingText?: boolean
}

export default function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  isLoading,
  isFetching = false,
  error,
  refetch,
  emptyMessage = 'No items found',
  itemLabel,
  onPageChange,
  renderRow,
  className,
  skeletonRows = 5,
  onSort,
  currentSortBy,
  currentSortOrder,
  showShowingText = false,
}: DataTableProps<T>) {
  const hasData = !!(data && data.items.length > 0)
  const showOverlay = isFetching && hasData

  return (
    <div className={clsx('relative rounded-lg border border-neutral-950/10 bg-white shadow-sm', className)}>
      <LoadingOverlay isVisible={showOverlay} />
      
      {error ? (
        <div className='flex flex-col items-center justify-center gap-4 p-12'>
          <p className='text-sm text-neutral-600'>
            {error.message || 'An error occurred while loading data'}
          </p>
          {refetch && (
            <Button onClick={refetch} outline>
              Retry
            </Button>
          )}
        </div>
      ) : isLoading && !hasData ? (
        <div className='overflow-x-auto'>
          <Table striped={true} dense={true}>
            <TableHead>
              <TableHeaderRow
                columns={columns}
                onSort={onSort}
                currentSortBy={currentSortBy}
                currentSortOrder={currentSortOrder}
              />
            </TableHead>
            <TableBody>
              <TableSkeleton rows={skeletonRows} columns={columns.length} />
            </TableBody>
          </Table>
        </div>
      ) : !hasData ? (
        <div className='flex items-center justify-center p-12'>
          <p className='text-sm text-neutral-500'>
            {emptyMessage}
          </p>
        </div>
      ) : (
        <>
          <div className='overflow-x-auto'>
            <Table>
            <TableHead>
              <TableHeaderRow
                columns={columns}
                onSort={onSort}
                currentSortBy={currentSortBy}
                currentSortOrder={currentSortOrder}
              />
            </TableHead>
              <TableBody>
                {renderRow
                  ? data.items.map((row, index) => renderRow(row, index))
                  : data.items.map((row, rowIndex) => (
                      <TableRow key={rowIndex}>
                        {columns.map((column, colIndex) => {
                          let content: React.ReactNode
                          if (column.accessor) {
                            if (typeof column.accessor === 'function') {
                              content = column.accessor(row)
                            } else {
                              // Type assertion: column.accessor is keyof T, so row[column.accessor] should be compatible
                              // Convert to ReactNode - values from Record<string, unknown> need explicit conversion
                              const value = row[column.accessor]
                              content = (value as React.ReactNode) ?? String(value)
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
                    ))}
              </TableBody>
            </Table>
          </div>
          {data && (
            <div className='border-t border-neutral-950/10 px-6 py-4'>
              <PaginationControls
                page={data.page}
                totalPages={data.total_pages}
                pageSize={data.page_size}
                total={data.total}
                itemLabel={itemLabel}
                onPageChange={onPageChange}
                showShowingText={showShowingText}
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}
