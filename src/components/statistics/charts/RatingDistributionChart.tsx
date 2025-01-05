import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { Puzzle } from '../../../lib/types'
import { InfoTooltip } from '../../InfoTooltip'
import { formatNumber, formatPercent } from '../../../utils/format'

interface RatingDistributionChartProps {
  puzzles: Puzzle[]
  showAll?: boolean
}

export function RatingDistributionChart({ puzzles, showAll = false }: RatingDistributionChartProps) {
  const activePuzzles = showAll ? puzzles : puzzles.filter(p => p.in_collection)
  const ratedPuzzles = activePuzzles.filter(p => p.rating)
  
  const data = Array.from({ length: 5 }, (_, i) => {
    const count = activePuzzles.filter(p => p.rating === i + 1).length
    return {
      rating: i + 1,
      label: `${i + 1} ⭐`,
      count,
      percentage: ratedPuzzles.length > 0 ? count / ratedPuzzles.length : 0
    }
  }).filter(d => d.count > 0)

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <InfoTooltip text="Graf zobrazuje rozdělení hodnocení ve sbírce. Na vodorovné ose je počet hvězdiček (1-5), na svislé ose počet puzzlí s daným hodnocením. Můžete tak vidět, kolik puzzlí má jaké hodnocení a identifikovat nejčastější hodnocení ve vaší sbírce." />
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip
              formatter={(value: number) => [formatNumber(value), 'Počet puzzlí']}
              labelFormatter={(label: string) => {
                const item = data.find(d => d.label === label)
                return `${label} (${formatPercent(item?.percentage || 0)})`
              }}
            />
            <Bar dataKey="count" fill="#6366f1" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}