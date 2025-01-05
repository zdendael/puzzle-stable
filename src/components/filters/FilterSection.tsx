import { useState, useEffect } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'

interface FilterSectionProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
  onToggle?: (isOpen: boolean) => void
}

export function FilterSection({ title, children, defaultOpen = false, onToggle }: FilterSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  useEffect(() => {
    setIsOpen(defaultOpen)
  }, [defaultOpen])

  const handleToggle = () => {
    const newIsOpen = !isOpen
    setIsOpen(newIsOpen)
    onToggle?.(newIsOpen)
  }

  return (
    <div className="border-b border-indigo-100 dark:border-indigo-900/20 last:border-b-0">
      <button
        onClick={handleToggle}
        className="flex items-center justify-between w-full py-3 text-left"
      >
        <h3 className="font-medium text-gray-900 dark:text-white">{title}</h3>
        {isOpen ? (
          <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        )}
      </button>
      
      {isOpen && <div className="pb-4">{children}</div>}
    </div>
  )
}