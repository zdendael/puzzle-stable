import { useState, useEffect, useCallback } from 'react'

type LayoutType = 'grid' | 'list'

export function useLayoutPreference(page: string, defaultLayout: LayoutType = 'grid') {
  const [isGridLayout, setIsGridLayout] = useState(() => {
    const saved = localStorage.getItem(`${page}-layout`)
    return saved ? saved === 'grid' : defaultLayout === 'grid'
  })

  useEffect(() => {
    localStorage.setItem(`${page}-layout`, isGridLayout ? 'grid' : 'list')
  }, [isGridLayout, page])

  const toggleLayout = useCallback(() => {
    setIsGridLayout(prev => !prev)
  }, [])

  return { isGridLayout, setIsGridLayout, toggleLayout }
}