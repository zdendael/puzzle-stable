import { useState, useEffect, useCallback } from 'react'

export type SortDirection = 'asc' | 'desc' | null
export type SortConfig = {
  key: string
  direction: SortDirection
}

export function useTableSort(page: string) {
  const [sort, setSort] = useState<SortConfig>(() => {
    const saved = localStorage.getItem(`${page}-sort`)
    return saved ? JSON.parse(saved) : { key: '', direction: null }
  })

  useEffect(() => {
    localStorage.setItem(`${page}-sort`, JSON.stringify(sort))
  }, [sort, page])

  const handleSort = useCallback((key: string) => {
    setSort(prev => ({
      key,
      direction: 
        prev.key === key
          ? prev.direction === 'asc'
            ? 'desc'
            : prev.direction === 'desc'
              ? null
              : 'asc'
          : 'asc'
    }))
  }, [])

  return { sort, handleSort }
}