interface DateFilterProps {
  dateRange: { from: string | null; to: string | null }
  onFilterChange: (range: { from: string | null; to: string | null }) => void
}

export function DateFilter({ dateRange, onFilterChange }: DateFilterProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <label className="text-sm text-gray-600 dark:text-gray-400">Od</label>
          <input
            type="date"
            value={dateRange.from || ''}
            onChange={(e) =>
              onFilterChange({ ...dateRange, from: e.target.value || null })
            }
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div className="flex-1">
          <label className="text-sm text-gray-600 dark:text-gray-400">Do</label>
          <input
            type="date"
            value={dateRange.to || ''}
            onChange={(e) =>
              onFilterChange({ ...dateRange, to: e.target.value || null })
            }
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {(dateRange.from || dateRange.to) && (
        <button
          onClick={() => onFilterChange({ from: null, to: null })}
          className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
        >
          Vymazat datum
        </button>
      )}
    </div>
  )
}