import { DollarSign } from 'lucide-react'

interface AcquisitionFiltersProps {
  filters: any
  onFilterChange: (filters: any) => void
}

export function AcquisitionFilters({ filters, onFilterChange }: AcquisitionFiltersProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
        {[
          { key: 'isGift', label: 'Dárek', color: 'bg-pink-100 dark:bg-pink-900/50 text-pink-800 dark:text-pink-200' },
          { key: 'isCollaboration', label: 'Spolupráce', color: 'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200' },
          { key: 'isOwnPurchase', label: 'Vlastní nákup', color: 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200' }
        ].map(({ key, label, color }) => (
          <button
            key={key}
            onClick={() => onFilterChange({ ...filters, [key]: !filters[key] })}
            className={`px-2 py-1 text-xs rounded-md ${
              filters[key]
                ? color
                : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {filters.isOwnPurchase && (
        <div>
          <label className="text-sm text-gray-600 dark:text-gray-400">Cenové rozpětí (Kč)</label>
          <div className="mt-1 flex items-center space-x-2">
            <input
              type="number"
              value={filters.priceMin || ''}
              onChange={(e) =>
                onFilterChange({
                  ...filters,
                  priceMin: e.target.value ? Number(e.target.value) : null,
                })
              }
              placeholder="Od"
              className="w-24 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <span className="text-gray-700 dark:text-gray-300">-</span>
            <input
              type="number"
              value={filters.priceMax || ''}
              onChange={(e) =>
                onFilterChange({
                  ...filters,
                  priceMax: e.target.value ? Number(e.target.value) : null,
                })
              }
              placeholder="Do"
              className="w-24 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
      )}
    </div>
  )
}