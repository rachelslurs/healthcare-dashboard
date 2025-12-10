import type React from 'react'
import { memo, useCallback } from 'react'
import clsx from 'clsx'
import { TableRow, TableHeader } from '../ui/table'
import type { ColumnDefinition } from './data-table'

interface TableHeaderRowProps<T> {
  columns: ColumnDefinition<T>[]
  onSort?: (sortKey: string) => void
  currentSortBy?: string
  currentSortOrder?: 'asc' | 'desc'
}

export default memo(function TableHeaderRow<T>({
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
