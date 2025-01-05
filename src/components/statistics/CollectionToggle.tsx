import { ToggleLeft, ToggleRight } from 'lucide-react'

interface CollectionToggleProps {
  showAll: boolean
  onChange: (value: boolean) => void
}

export function CollectionToggle({ showAll, onChange }: CollectionToggleProps) {
  return (
    <button
      onClick={() => onChange(!showAll)}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm"
    >
      {showAll ? (
        <ToggleRight className="w-4 h-4 text-indigo-500" />
      ) : (
        <ToggleLeft className="w-4 h-4 text-gray-400" />
      )}
      <span className="text-gray-700 dark:text-gray-300">
        {showAll ? 'Všechna puzzle' : 'Pouze ve sbírce'}
      </span>
    </button>
  )
}