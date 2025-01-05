import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { Puzzle } from '../../../lib/types'
import { format, startOfMonth, eachMonthOfInterval, isSameMonth } from 'date-fns'
import { cs } from 'date-fns/locale'
import { InfoTooltip } from '../../InfoTooltip'
import { formatNumber } from '../../../utils/format'

interface CollaborationTimelineChartProps {
  puzzles: Puzzle[]
}

export function CollaborationTimelineChart({ puzzles }: CollaborationTimelineChartProps) {
  const collaborationPuzzles = puzzles.filter(p => p.is_collaboration)
  
  // Najít první a poslední datum
  const dates = collaborationPuzzles.map(p => new Date(p.acquisition_date))
  const minDate = startOfMonth(new Date(Math.min(...dates.map(d => d.getTime()))))
  const maxDate = startOfMonth(new Date())

  // Vytvořit pole všech měsíců v intervalu
  const months = eachMonthOfInterval({ start: minDate, end: maxDate })

  // Spočítat počet spoluprací pro každý měsíc
  const data = months.map(month => ({
    date: month,
    total: collaborationPuzzles.filter(p => 
      isSameMonth(new Date(p.acquisition_date), month)
    ).length,
    published: collaborationPuzzles.filter(p => 
      isSameMonth(new Date(p.acquisition_date), month) && p.youtube_url
    ).length
  }))

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <InfoTooltip text="Graf zobrazuje počet puzzlí ze spolupráce v jednotlivých měsících. Modrá křivka ukazuje celkový počet puzzlí, fialová počet puzzlí s publikovaným videem." />
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={(date) => format(date, 'MM/yyyy')}
            />
            <YAxis />
            <Tooltip
              labelFormatter={(date) => format(date, 'LLLL yyyy', { locale: cs })}
              formatter={(value: number, name: string) => [
                formatNumber(value),
                name === 'total' ? 'Celkem puzzlí' : 'S videem'
              ]}
            />
            <Line
              type="monotone"
              dataKey="total"
              name="Celkem"
              stroke="#6366f1"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="published"
              name="S videem"
              stroke="#8b5cf6"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}