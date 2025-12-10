'use client'

import clsx from 'clsx'
import type React from 'react'
import { useMemo } from 'react'
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

export interface ColumnDefinition<T> {
  header: string
  accessor?: keyof T | ((row: T) => React.ReactNode)
  className?: string
  width?: string
  sortable?: boolean
}

interface PaginationControlsProps {
  page: number
  totalPages: number
  pageSize: number
  total: number
  itemLabel: string
  buildPageUrl: (page: number) => string
}

function PaginationControls({
  page,
  totalPages,
  pageSize,
  total,
  itemLabel,
  buildPageUrl,
}: PaginationControlsProps) {
  if (totalPages <= 1) {
    return null
  }

  const start = (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, total)

  // Generate page numbers with smart ellipsis
  const pageNumbers = useMemo(() => {
    const pages: (number | 'ellipsis')[] = []
    const alwaysShow = new Set([1, totalPages, page])
    const showRange = 1 // Show pages within ±1 of current

    // Always show first page
    pages.push(1)

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

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-sm text-zinc-500">
        Showing {start} to {end} of {total} {itemLabel}
      </div>
      <Pagination>
        <PaginationPrevious
          href={page > 1 ? buildPageUrl(page - 1) : null}
        />
        <PaginationList>
          {pageNumbers.map((pageNum, index) => {
            if (pageNum === 'ellipsis') {
              return <PaginationGap key={`ellipsis-${index}`} />
            }
            return (
              <PaginationPage
                key={pageNum}
                href={buildPageUrl(pageNum)}
                current={pageNum === page}
              >
                {pageNum}
              </PaginationPage>
            )
          })}
        </PaginationList>
        <PaginationNext
          href={page < totalPages ? buildPageUrl(page + 1) : null}
        />
      </Pagination>
    </div>
  )
}

interface LoadingOverlayProps {
  isVisible: boolean
}

function LoadingOverlay({ isVisible }: LoadingOverlayProps) {
  if (!isVisible) return null

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-white/50 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-2">
        <div className="size-8 animate-spin rounded-full border-4 border-zinc-300 border-t-zinc-600" />
      </div>
    </div>
  )
}

interface TableSkeletonProps {
  rows?: number
  columns: number
}

function TableSkeleton({ rows = 5, columns }: TableSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <TableRow key={rowIndex}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <TableCell key={colIndex}>
              <div className="h-4 w-3/4 animate-pulse rounded bg-zinc-200" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  )
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
  buildPageUrl: (page: number) => string
  renderRow?: (row: T, index: number) => React.ReactNode
  className?: string
  skeletonRows?: number
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
  buildPageUrl,
  renderRow,
  className,
  skeletonRows = 5,
}: DataTableProps<T>) {
  const hasData = data && data.items.length > 0
  const showOverlay = isFetching && hasData

  return (
    <div className={clsx('relative rounded-lg border border-zinc-950/10 bg-white shadow-sm', className)}>
      <LoadingOverlay isVisible={showOverlay} />
      
      {error ? (
        <div className="flex flex-col items-center justify-center gap-4 p-12">
          <p className="text-sm text-zinc-600">
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
          <Table>
            <TableHead>
              <TableRow>
                {columns.map((column, index) => (
                  <TableHeader
                    key={index}
                    className={column.className}
                    style={column.width ? { width: column.width } : undefined}
                  >
                    {column.header}
                  </TableHeader>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              <TableSkeleton rows={skeletonRows} columns={columns.length} />
            </TableBody>
          </Table>
        </div>
      ) : !hasData ? (
        <div className="flex items-center justify-center p-12">
          <p className="text-sm text-zinc-500">
            {emptyMessage}
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <Table>
              <TableHead>
                <TableRow>
                  {columns.map((column, index) => (
                    <TableHeader
                      key={index}
                      className={column.className}
                      style={column.width ? { width: column.width } : undefined}
                    >
                      {column.header}
                    </TableHeader>
                  ))}
                </TableRow>
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
            <div className="border-t border-zinc-950/10 px-6 py-4">
              <PaginationControls
                page={data.page}
                totalPages={data.total_pages}
                pageSize={data.page_size}
                total={data.total}
                itemLabel={itemLabel}
                buildPageUrl={buildPageUrl}
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}
