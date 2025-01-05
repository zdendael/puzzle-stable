import { useEffect, useRef, useCallback } from 'react'

export function useInfiniteScroll(
  onLoadMore: () => void,
  hasMore: boolean,
  isLoading: boolean,
  threshold = 0.8
) {
  const observer = useRef<IntersectionObserver | null>(null)
  const lastElementRef = useCallback(
    (node: HTMLElement | null) => {
      if (isLoading) return
      if (observer.current) observer.current.disconnect()

      observer.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && hasMore) {
          onLoadMore()
        }
      }, {
        root: null,
        rootMargin: '100px',
        threshold
      })

      if (node) observer.current.observe(node)
    },
    [isLoading, hasMore, onLoadMore, threshold]
  )

  useEffect(() => {
    return () => {
      if (observer.current) {
        observer.current.disconnect()
      }
    }
  }, [])

  return lastElementRef
}