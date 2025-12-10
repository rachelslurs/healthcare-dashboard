'use client'

import clsx from 'clsx'
import type React from 'react'
import { useMemo, memo, useCallback } from 'react'
import { Button } from '../ui/button'
import {
  Pagination,
  PaginationGap,
  PaginationList,
  PaginationNext,
  PaginationPage,
  PaginationPrevious,
} from '../ui/pagination'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'

// Types
export interface PaginatedData<T> {
  items: T[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

// Helper function to format the "Showing" text
export function formatShowingText(
  page: number,
  pageSize: number,
  total: number,
  itemLabel: string
): string {
  const start = (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, total)
  return `Showing ${start} to ${end} of ${total} ${itemLabel}`
}

export interface ColumnDefinition<T> {
  header: string
  accessor?: keyof T | ((row: T) => React.ReactNode)
  className?: string
  width?: string
  sortable?: boolean
  sortKey?: string
}

interface PaginationControlsProps {
  page: number
  totalPages: number
  pageSize: number
  total: number
  itemLabel: string
  onPageChange: (page: number) => void
  showShowingText?: boolean
}

const PaginationControls = memo(function PaginationControls({
  page,
  totalPages,
  pageSize,
  total,
  itemLabel,
  onPageChange,
  showShowingText = false,
}: PaginationControlsProps) {
  const start = (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, total)

  const handlePrevious = useCallback(() => {
    if (page > 1) onPageChange(page - 1)
  }, [page, onPageChange])

  const handleNext = useCallback(() => {
    if (page < totalPages) onPageChange(page + 1)
  }, [page, totalPages, onPageChange])

  const handlePageClick = useCallback((pageNum: number) => {
    onPageChange(pageNum)
  }, [onPageChange])

  if (totalPages <= 1 && !showShowingText) {
    return null
  }

  // Generate page numbers with smart ellipsis
  const pageNumbers = useMemo(() => {
    const pages: (number | 'ellipsis')[] = []
    const alwaysShow = new Set([1, totalPages, page])
    const showRange = 1 // Show pages within ±1 of current

    // Determine which pages to show
    const pagesToShow = new Set<number>()
    for (let i = 1; i <= totalPages; i++) {
      if (
        alwaysShow.has(i) ||
        (i >= page - showRange && i <= page + showRange)
      ) {
        pagesToShow.add(i)
      }
    }

    // Build the page list with ellipsis
    let lastAdded = 0
    for (let i = 1; i <= totalPages; i++) {
      if (pagesToShow.has(i)) {
        if (i - lastAdded > 1 && lastAdded > 0) {
          pages.push('ellipsis')
        }
        pages.push(i)
        lastAdded = i
      }
    }

    return pages
  }, [page, totalPages])

  const showingText = useMemo(() => {
    return showShowingText ? formatShowingText(page, pageSize, total, itemLabel) : null
  }, [showShowingText, page, pageSize, total, itemLabel])

  return (
    <div className="flex flex-col gap-2">
      {totalPages > 1 && (
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-x-2 w-full max-w-md">
            <PaginationPrevious
              onClick={page > 1 ? handlePrevious : undefined}
              disabled={page <= 1}
            />
            <div className="flex-1 flex justify-center">
              <PaginationList>
                {pageNumbers.map((pageNum, index) => {
                  if (pageNum === 'ellipsis') {
                    return <PaginationGap key={`ellipsis-${index}`} />
                  }
                  return (
                    <PaginationPage
                      key={pageNum}
                      onClick={() => handlePageClick(pageNum)}
                      current={pageNum === page}
                    >
                      {pageNum}
                    </PaginationPage>
                  )
                })}
              </PaginationList>
            </div>
            <PaginationNext
              onClick={page < totalPages ? handleNext : undefined}
              disabled={page >= totalPages}
            />
          </div>
        </div>
      )}
      {showingText && (
        <div className="flex justify-center text-sm text-neutral-500">
          {showingText}
        </div>
      )}
    </div>
  )
})

interface LoadingOverlayProps {
  isVisible: boolean
}

const LoadingOverlay = memo(function LoadingOverlay({ isVisible }: LoadingOverlayProps) {
  if (!isVisible) return null

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-white/50 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-2">
        <div className="size-8 animate-spin rounded-full border-4 border-neutral-300 border-t-neutral-600" />
      </div>
    </div>
  )
})

interface TableSkeletonProps {
  rows?: number
  columns: number
}

const TableSkeleton = memo(function TableSkeleton({ rows = 5, columns }: TableSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <TableRow key={rowIndex}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <TableCell key={colIndex}>
              <div className="h-4 w-3/4 animate-pulse rounded bg-neutral-200" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  )
})

interface TableHeaderRowProps<T> {
  columns: ColumnDefinition<T>[]
  onSort?: (sortKey: string) => void
  currentSortBy?: string
  currentSortOrder?: 'asc' | 'desc'
}

const TableHeaderRow = memo(function TableHeaderRow<T>({
  columns,
  onSort,
  currentSortBy,
  currentSortOrder,
}: TableHeaderRowProps<T>) {
  const handleSortClick = useCallback((sortKey: string) => {
    onSort?.(sortKey)
  }, [onSort])

  return (
    <TableRow>
      {columns.map((column, index) => {
        const isSorted = column.sortable && column.sortKey === currentSortBy
        const sortIcon = isSorted 
          ? currentSortOrder === 'asc' ? '↑' : '↓'
          : column.sortable ? '⇅' : ''
        
        return (
          <TableHeader
            key={index}
            className={clsx(
              column.className,
              column.sortable && 'cursor-pointer hover:bg-neutral-50 select-none'
            )}
            style={column.width ? { width: column.width } : undefined}
            onClick={() => column.sortable && column.sortKey && handleSortClick(column.sortKey)}
          >
            <div className="flex items-center gap-2">
              <span>{column.header}</span>
              {column.sortable && (
                <span className="text-neutral-400 text-xs">{sortIcon}</span>
              )}
            </div>
          </TableHeader>
        )
      })}
    </TableRow>
  )
}) as <T>(props: TableHeaderRowProps<T>) => React.ReactElement

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

export default function DataTable<T extends Record<string, any>>({
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
        <div className="flex flex-col items-center justify-center gap-4 p-12">
          <p className="text-sm text-neutral-600">
            {error.message || 'An error occurred while loading data'}
          </p>
          {refetch && (
            <Button onClick={refetch} outline>
              Retry
            </Button>
          )}
        </div>
      ) : isLoading && !hasData ? (
        <div className="overflow-x-auto">
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
        <div className="flex items-center justify-center p-12">
          <p className="text-sm text-neutral-500">
            {emptyMessage}
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
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
                    ))}
              </TableBody>
            </Table>
          </div>
          {data && (
            <div className="border-t border-neutral-950/10 px-6 py-4">
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
