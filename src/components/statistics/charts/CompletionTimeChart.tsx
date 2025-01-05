import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { Puzzle } from '../../../lib/types'
import { InfoTooltip } from '../../InfoTooltip'

interface CompletionTimeChartProps {
  puzzles: Puzzle[]
  showAll?: boolean
}

export function CompletionTimeChart({ puzzles, showAll = false }: CompletionTimeChartProps) {
  const activePuzzles = showAll ? puzzles : puzzles.filter(p => p.in_collection)
  const timeRanges = [
    { min: 0, max: 60, label: 'do 1h' },
    { min: 60, max: 120, label: '1-2h' },
    { min: 120, max: 180, label: '2-3h' },
    { min: 180, max: 300, label: '3-5h' },
    { min: 300, max: 480, label: '5-8h' },
    { min: 480, max: 720, label: '8-12h' },
    { min: 720, max: Infinity, label: 'nad 12h' }
  ]

  const data = timeRanges.map(range => ({
    name: range.label,
    count: activePuzzles.reduce((acc, puzzle) => {
      const sessions = puzzle.sessions?.filter(s => s.duration_minutes) || []
      return acc + sessions.filter(s => 
        s.duration_minutes >= range.min && s.duration_minutes < range.max
      ).length
    }, 0)
  })).filter(d => d.count > 0)

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <InfoTooltip text="Graf zobrazuje rozdělení dokončených skládání podle doby trvání. Skládání jsou rozdělena do časových intervalů (např. 1-2h, 2-3h, atd.) a pro každý interval je zobrazen počet skládání, která trvala danou dobu. Můžete tak vidět, jak dlouho vám typicky trvá složit puzzle." />
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip
              formatter={(value: number) => [value, 'Počet skládání']}
            />
            <Bar dataKey="count" fill="#6366f1" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}