import { useMemo, memo, useCallback } from 'react'
import {
  PaginationGap,
  PaginationList,
  PaginationNext,
  PaginationPage,
  PaginationPrevious,
} from '../ui/pagination'
import { formatShowingText } from './data-table'

interface PaginationControlsProps {
  page: number
  totalPages: number
  pageSize: number
  total: number
  itemLabel: string
  onPageChange: (page: number) => void
  showShowingText?: boolean
}

export default memo(function PaginationControls({
  page,
  totalPages,
  pageSize,
  total,
  itemLabel,
  onPageChange,
  showShowingText = false,
}: PaginationControlsProps) {
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
