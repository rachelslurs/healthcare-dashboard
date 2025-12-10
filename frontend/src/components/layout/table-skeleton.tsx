import { memo } from 'react'
import { TableRow, TableCell } from '../ui/table'

interface TableSkeletonProps {
  rows?: number
  columns: number
}

export default memo(function TableSkeleton({ rows = 5, columns }: TableSkeletonProps) {
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
