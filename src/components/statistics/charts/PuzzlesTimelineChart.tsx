import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { Puzzle } from '../../../lib/types'
import { format } from 'date-fns'
import { cs } from 'date-fns/locale'
import { InfoTooltip } from '../../InfoTooltip'

interface PuzzlesTimelineChartProps {
  puzzles: Puzzle[]
  showAll?: boolean
}

export function PuzzlesTimelineChart({ puzzles, showAll = false }: PuzzlesTimelineChartProps) {
  const activePuzzles = showAll ? puzzles : puzzles.filter(p => p.in_collection)
  const sortedPuzzles = [...puzzles].sort(
    (a, b) => new Date(a.acquisition_date).getTime() - new Date(b.acquisition_date).getTime()
  )

  const data = sortedPuzzles.reduce((acc, puzzle, index) => {
    const date = format(new Date(puzzle.acquisition_date), 'MM/yyyy', { locale: cs })
    const lastEntry = acc[acc.length - 1]

    if (lastEntry && lastEntry.date === date) {
      lastEntry.count = index + 1
    } else {
      acc.push({ date, count: index + 1 })
    }

    return acc
  }, [] as { date: string; count: number }[])

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <InfoTooltip text="Graf zobrazuje růst sbírky v čase. Křivka ukazuje celkový počet puzzlí ve sbírce v jednotlivých měsících od začátku sbírky. Můžete tak sledovat, jak rychle se sbírka rozrůstá a identifikovat období s nejvyšším přírůstkem puzzlí." />
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={(value) => {
                const [month, year] = value.split('/')
                return `${month}/${year}`
              }}
            />
            <YAxis />
            <Tooltip
              labelFormatter={(value) => {
                const [month, year] = value.split('/')
                return format(new Date(parseInt(year), parseInt(month) - 1), 'LLLL yyyy', { locale: cs })
              }}
              formatter={(value: number) => [value, 'Počet puzzlí']}
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#6366f1"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}