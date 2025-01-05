import { Star } from 'lucide-react'

interface RatingRangeFilterProps {
  ratingRange: { min: number | null; max: number | null }
  onFilterChange: (range: { min: number | null; max: number | null }) => void
}

export function RatingRangeFilter({ ratingRange, onFilterChange }: RatingRangeFilterProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
          <Star className="w-4 h-4 mr-1" />
          Počet hvězdiček
        </label>
        <div className="mt-1 flex items-center space-x-2">
          <select
            value={ratingRange.min || ''}
            onChange={(e) =>
              onFilterChange({
                ...ratingRange,
                min: e.target.value ? Number(e.target.value) : null,
              })
            }
            className="w-24 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Od</option>
            {[1, 2, 3, 4, 5].map((rating) => (
              <option key={rating} value={rating}>
                {rating} ⭐
              </option>
            ))}
          </select>
          <span className="text-gray-700 dark:text-gray-300">-</span>
          <select
            value={ratingRange.max || ''}
            onChange={(e) =>
              onFilterChange({
                ...ratingRange,
                max: e.target.value ? Number(e.target.value) : null,
              })
            }
            className="w-24 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Do</option>
            {[1, 2, 3, 4, 5].map((rating) => (
              <option key={rating} value={rating}>
                {rating} ⭐
              </option>
            ))}
          </select>
        </div>
      </div>

      {(ratingRange.min !== null || ratingRange.max !== null) && (
        <button
          onClick={() => onFilterChange({ min: null, max: null })}
          className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
        >
          Zrušit filtr
        </button>
      )}
    </div>
  )
}