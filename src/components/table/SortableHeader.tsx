import { ChevronUp, ChevronDown } from 'lucide-react'
import type { SortDirection } from '../../hooks/useTableSort'

interface SortableHeaderProps {
  label: string
  sortKey: string
  currentSort: {
    key: string
    direction: SortDirection
  }
  onSort: (key: string) => void
}

export function SortableHeader({ label, sortKey, currentSort, onSort }: SortableHeaderProps) {
  return (
    <th 
      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800/50"
      onClick={() => onSort(sortKey)}
    >
      <div className="flex items-center space-x-1">
        <span>{label}</span>
        <span className="flex flex-col">
          {currentSort.key === sortKey && currentSort.direction === 'asc' && (
            <ChevronUp className="w-4 h-4" />
          )}
          {currentSort.key === sortKey && currentSort.direction === 'desc' && (
            <ChevronDown className="w-4 h-4" />
          )}
          {(currentSort.key !== sortKey || !currentSort.direction) && (
            <span className="w-4" />
          )}
        </span>
      </div>
    </th>
  )
}