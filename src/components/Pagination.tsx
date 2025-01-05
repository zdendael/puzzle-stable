import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  pageSize: number
  pageSizes: readonly number[]
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  totalItems: number
  currentItems: [number, number]
}

export function Pagination({
  currentPage,
  totalPages,
  pageSize,
  pageSizes,
  onPageChange,
  onPageSizeChange,
  totalItems,
  currentItems
}: PaginationProps) {
  // Bezpečné vytvoření pole stránek
  const getVisiblePages = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }
    
    let pages = []
    
    // Vždy zobrazit první stránku
    pages.push(1)
    
    if (currentPage <= 4) {
      // Jsme blízko začátku
      pages.push(2, 3, 4, 5)
      pages.push('...')
      pages.push(totalPages)
    } else if (currentPage >= totalPages - 3) {
      // Jsme blízko konce
      pages.push('...')
      pages.push(totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
    } else {
      // Jsme někde uprostřed
      pages.push('...')
      pages.push(currentPage - 1, currentPage, currentPage + 1)
      pages.push('...')
      pages.push(totalPages)
    }
    
    return pages
  }

  const visiblePages = getVisiblePages()

  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-gray-800 px-4 py-3 border-t border-gray-200 dark:border-gray-700">
      <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="mr-2 rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
        >
          {pageSizes.map(size => (
            <option key={size} value={size}>
              {size === Infinity ? 'Vše' : `${size} na stránku`}
            </option>
          ))}
        </select>
        <span>
          {currentItems[0]}-{currentItems[1]} z {totalItems}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-md border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex gap-1">
          {visiblePages.map((page, index) => (
            page === '...' ? (
              <span key={`ellipsis-${index}`} className="px-2 py-1 text-gray-700 dark:text-gray-200">
                ...
              </span>
            ) : (
              <button
                key={page}
                onClick={() => onPageChange(page as number)}
                className={`min-w-[2.5rem] px-3 py-1 rounded-md border ${
                  currentPage === page
                    ? 'bg-indigo-100 dark:bg-indigo-900/50 border-indigo-500 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400'
                    : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'
                } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              >
                {page}
              </button>
            )
          ))}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-md border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}