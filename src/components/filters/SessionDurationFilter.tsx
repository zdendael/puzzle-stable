import { Clock } from 'lucide-react'

interface SessionDurationFilterProps {
  durationRange: { min: number | null; max: number | null }
  onFilterChange: (range: { min: number | null; max: number | null }) => void
}

export function SessionDurationFilter({ durationRange, onFilterChange }: SessionDurationFilterProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
          <Clock className="w-4 h-4 mr-1" />
          Doba skládání (minuty)
        </label>
        <div className="mt-1 flex items-center space-x-2">
          <input
            type="number"
            value={durationRange.min || ''}
            onChange={(e) =>
              onFilterChange({
                ...durationRange,
                min: e.target.value ? Number(e.target.value) : null,
              })
            }
            placeholder="Od"
            min="0"
            className="w-24 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <span className="text-gray-700 dark:text-gray-300">-</span>
          <input
            type="number"
            value={durationRange.max || ''}
            onChange={(e) =>
              onFilterChange({
                ...durationRange,
                max: e.target.value ? Number(e.target.value) : null,
              })
            }
            placeholder="Do"
            min="0"
            className="w-24 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {(durationRange.min || durationRange.max) && (
        <button
          onClick={() => onFilterChange({ min: null, max: null })}
          className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
        >
          Vymazat filtr
        </button>
      )}
    </div>
  )
}