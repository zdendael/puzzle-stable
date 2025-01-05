import { useState, useEffect } from 'react'
import { ChevronUp } from 'lucide-react'

export function ScrollToTop() {
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 200)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  if (!showScrollTop) return null

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 p-2 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
      title="Zpět nahoru"
    >
      <ChevronUp className="w-6 h-6" />
    </button>
  )
}