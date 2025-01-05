import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import type { Puzzle } from '../../../lib/types'
import { format, startOfMonth, eachMonthOfInterval, isSameMonth, subMonths } from 'date-fns'
import { cs } from 'date-fns/locale'
import { InfoTooltip } from '../../InfoTooltip'
import { formatNumber } from '../../../utils/format'

interface CollaborationMonthlyStatsChartProps {
  puzzles: Puzzle[]
}

export function CollaborationMonthlyStatsChart({ puzzles }: CollaborationMonthlyStatsChartProps) {
  const collaborationPuzzles = puzzles.filter(p => p.is_collaboration)
  
  // Najít první a poslední datum
  const dates = collaborationPuzzles.map(p => new Date(p.acquisition_date))
  const maxDate = startOfMonth(new Date())
  const minDate = startOfMonth(subMonths(maxDate, 11)) // Posledních 12 měsíců

  // Vytvořit pole všech měsíců v intervalu
  const months = eachMonthOfInterval({ start: minDate, end: maxDate })

  // Spočítat statistiky pro každý měsíc
  const data = months.map(month => {
    const puzzlesInMonth = collaborationPuzzles.filter(p => 
      isSameMonth(new Date(p.acquisition_date), month)
    )
    
    return {
      date: month,
      puzzles: puzzlesInMonth.length,
      videos: puzzlesInMonth.filter(p => p.youtube_url).length
    }
  })

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <InfoTooltip text="Graf zobrazuje měsíční statistiky spoluprací za posledních 12 měsíců. Modrá křivka ukazuje počet získaných puzzlí, fialová počet publikovaných videí." />
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ left: 20, right: 30, top: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={(date) => format(date, 'LLL', { locale: cs })}
              label={{ 
                value: 'Měsíc', 
                position: 'insideBottom',
                offset: -5,
                style: { fill: '#6B7280' }
              }}
            />
            <YAxis 
              label={{ 
                value: 'Počet', 
                angle: -90, 
                position: 'insideLeft',
                offset: 10,
                style: { fill: '#6B7280' }
              }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{ paddingBottom: '20px' }}
            />
            <Tooltip
              formatter={(value: number, name: string) => [
                formatNumber(value),
                name === 'puzzles' ? 'Získaných puzzlí' : 'Publikovaných videí'
              ]}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #ccc',
                borderRadius: '4px',
                padding: '8px'
              }}
              labelFormatter={(date) => format(date, 'LLLL yyyy', { locale: cs })}
            />
            <Line
              type="monotone"
              dataKey="puzzles"
              name="Získaná puzzle"
              stroke="#6366f1"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="videos"
              name="Publikovaná videa"
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