import { Clock } from 'lucide-react'
import { InfoTooltip } from '../InfoTooltip'
import { formatShortDuration, formatNumber } from '../../utils/format'
import { calculateEstimatedTime } from '../../utils/puzzle/estimations'
import type { Puzzle } from '../../lib/types'

interface Props {
  puzzle: Puzzle
  allPuzzles: Puzzle[]
  onFilter?: (type: string, value: string) => void
}

export function EstimatedTime({ puzzle, allPuzzles, onFilter }: Props) {
  const estimate = calculateEstimatedTime(puzzle, allPuzzles)
  if (!estimate) return null

  return (
    <tr>
      <td className="py-1 text-gray-600 dark:text-gray-400">
        <Clock className="inline w-4 h-4 mr-1" />
        Předpokládaná doba:
      </td>
      <td className="text-gray-900 dark:text-gray-100 flex items-center gap-2">
        {onFilter ? (
          <button
            onClick={() => onFilter('estimatedTime', estimate.minutes.toString())}
            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
          >
            {formatShortDuration(estimate.minutes)}
          </button>
        ) : (
          <span>{formatShortDuration(estimate.minutes)}</span>
        )}
      </td>
    </tr>
  )
}