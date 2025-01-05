import { Clock } from 'lucide-react'
import { InfoTooltip } from '../InfoTooltip'
import { formatShortDuration } from '../../utils/format'

interface Props {
  value: { min: number | null; max: number | null }
  onChange: (value: { min: number | null; max: number | null }) => void
}

export function EstimatedTimeFilter({ value, onChange }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
          <Clock className="w-4 h-4" />
          Předpokládaná doba
        </label>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="number"
          value={value.min || ""}
          onChange={(e) => onChange({
            ...value,
            min: e.target.value ? Number(e.target.value) : null
          })}
          placeholder="Od (min)"
          className="w-24 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          min="0"
        />
        <span className="text-gray-700 dark:text-gray-300">-</span>
        <input
          type="number"
          value={value.max || ""}
          onChange={(e) => onChange({
            ...value,
            max: e.target.value ? Number(e.target.value) : null
          })}
          placeholder="Do (min)"
          className="w-24 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          min="0"
        />
      </div>

      {(value.min !== null || value.max !== null) && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">
            {value.min !== null && value.max !== null
              ? `${formatShortDuration(value.min)} - ${formatShortDuration(value.max)}`
              : value.min !== null
              ? `Od ${formatShortDuration(value.min)}`
              : value.max !== null
              ? `Do ${formatShortDuration(value.max)}`
              : ""}
          </span>
          <button
            onClick={() => onChange({ min: null, max: null })}
            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
          >
            Zrušit
          </button>
        </div>
      )}
    </div>
  )
}