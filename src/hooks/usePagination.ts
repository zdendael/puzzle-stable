import { useState, useEffect } from 'react'

const PAGE_SIZE = 20

export function usePagination<T>(items: T[], loadMore: () => void, hasMore: boolean) {
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setPage(1)
  }, [items.length])

  const handleLoadMore = async () => {
    if (!isLoading && hasMore) {
      setIsLoading(true)
      await loadMore()
      setPage(prev => prev + 1)
      setIsLoading(false)
    }
  }

  return {
    currentPage: page,
    isLoading,
    handleLoadMore
  }
}