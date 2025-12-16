'use client'

import clsx from 'clsx'
import type React from 'react'

import QueryErrorDisplay from '../errors/query-error-display'
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

export default function DataTable<T extends object>({
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
        <div className='p-2'>
          <QueryErrorDisplay
            error={error}
            reset={refetch}
            title='Failed to load data'
            retryLabel='Try again'
          />
        </div>
      ) : (
        <>
          <div className='overflow-x-auto'>
            <Table striped={!isLoading || hasData} dense={true}>
              <TableHead>
                <TableHeaderRow
                  columns={columns}
                  onSort={onSort}
                  currentSortBy={currentSortBy}
                  currentSortOrder={currentSortOrder}
                />
              </TableHead>
              <TableBody>
                {isLoading && !hasData ? (
                  <TableSkeleton rows={skeletonRows} columns={columns.length} />
                ) : !hasData ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className='text-center py-12'>
                      <p className='text-sm text-neutral-500'>
                        {emptyMessage}
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (() => {
                  const pageSize = data.page_size || skeletonRows
                  const items = data.items || []
                  const emptyRowsCount = Math.max(0, pageSize - items.length)
                  
                  return (
                    <>
                      {renderRow ? (
                        items.map((row, index) => renderRow(row, index))
                      ) : (
                        items.map((row, rowIndex) => (
                          <TableRow key={rowIndex}>
                            {columns.map((column, colIndex) => {
                              let content: React.ReactNode
                              if (column.accessor) {
                                if (typeof column.accessor === 'function') {
                                  content = column.accessor(row)
                                } else {
                                  // Type assertion: column.accessor is keyof T, so row[column.accessor] should be compatible
                                  // Convert to ReactNode - handle null/undefined properly to avoid displaying "null"/"undefined"
                                  const value = row[column.accessor]
                                  if (value == null) {
                                    content = null
                                  } else {
                                    // For non-null values, try ReactNode first, then convert to string if needed
                                    content = (value as React.ReactNode) ?? String(value)
                                  }
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
                        ))
                      )}
                      {/* Render empty rows to maintain consistent table height */}
                      {Array.from({ length: emptyRowsCount }).map((_, emptyIndex) => (
                        <TableRow key={`empty-${emptyIndex}`} className='opacity-0 pointer-events-none'>
                          {columns.map((_, colIndex) => (
                            <TableCell key={colIndex} className={columns[colIndex]?.className}>
                              &nbsp;
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </>
                  )
                })()}
              </TableBody>
            </Table>
          </div>
          {/* Always render pagination container to prevent layout shift */}
          <div className='border-t border-neutral-950/10 px-6 py-4 min-h-[72px] flex items-center justify-center'>
            {data && data.total_pages > 0 ? (
              <PaginationControls
                page={data.page}
                totalPages={data.total_pages}
                pageSize={data.page_size}
                total={data.total}
                itemLabel={itemLabel}
                onPageChange={onPageChange}
                showShowingText={showShowingText}
              />
            ) : (
              <div className='h-10' /> // Reserve space when no pagination
            )}
          </div>
        </>
      )}
    </div>
  )
}
