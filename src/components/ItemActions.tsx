import { useState, useRef, useEffect } from 'react'
import { MoreVertical, Pencil, Trash2 } from 'lucide-react'

interface ItemActionsProps {
  onEdit?: () => void
  onDelete: () => void
  hideEdit?: boolean
}

export function ItemActions({ onEdit, onDelete, hideEdit }: ItemActionsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <MoreVertical className="w-5 h-5 text-gray-500 dark:text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute z-[100] right-0 mt-1 w-36 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 py-1">
          {onEdit && !hideEdit && (
            <button
              onClick={() => {
                onEdit()
                setIsOpen(false)
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center group"
            >
              <Pencil className="w-4 h-4 mr-2 text-yellow-500 group-hover:text-yellow-600 dark:text-yellow-400 dark:group-hover:text-yellow-300" />
              Upravit
            </button>
          )}
          <button
            onClick={() => {
              onDelete()
              setIsOpen(false)
            }}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center group"
          >
            <Trash2 className="w-4 h-4 mr-2 text-red-500 group-hover:text-red-600 dark:text-red-400 dark:group-hover:text-red-300" />
            Smazat
          </button>
        </div>
      )}
    </div>
  )
}