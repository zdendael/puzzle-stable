import { useMemo } from 'react'
import { Clock } from 'lucide-react'
import { InfoTooltip } from '../InfoTooltip'
import { formatShortDuration, formatNumber } from '../../utils/format'
import { calculateEstimatedCompletionTime } from '../../utils/estimations'
import type { Puzzle } from '../../lib/types'

interface EstimatedCompletionTimeProps {
  puzzle: Puzzle
  allPuzzles: Puzzle[]
  onFilter: (type: string, value: string) => void
}

export function EstimatedCompletionTime({ puzzle, allPuzzles, onFilter }: EstimatedCompletionTimeProps) {
  const estimate = useMemo(() => 
    calculateEstimatedCompletionTime(puzzle, allPuzzles),
    [puzzle, allPuzzles]
  )

  if (!estimate) {
    return null
  }

  return (
    <tr>
      <td className="py-1 text-gray-600 dark:text-gray-400">
        <Clock className="inline w-4 h-4 mr-1" />
        Předpokládaná doba:
      </td>
      <td className="text-gray-900 dark:text-gray-100 flex items-center gap-2">
        <button
          onClick={() => onFilter('estimatedTime', estimate.minutes.toString())}
          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
        >
          {formatShortDuration(estimate.minutes)}
        </button>
        <InfoTooltip text={`
          Odhad na základě ${estimate.sampleSize} podobných skládání.
          Rozsah: ${formatShortDuration(estimate.minTime)} - ${formatShortDuration(estimate.maxTime)}.
          Průměrná rychlost: ${formatNumber(estimate.piecesPerMinute, 1)} dílků/min.
          Zahrnuta puzzle s počtem dílků ±500 od aktuálního puzzle.
        `} />
      </td>
    </tr>
  )
}