import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import type { Puzzle } from '../../../lib/types'
import { format, startOfMonth, eachMonthOfInterval, isSameMonth, subMonths } from 'date-fns'
import { cs } from 'date-fns/locale'
import { InfoTooltip } from '../../InfoTooltip'

interface DifficultyTrendsChartProps {
  puzzles: Puzzle[]
}

export function DifficultyTrendsChart({ puzzles }: DifficultyTrendsChartProps) {
  const sessions = puzzles.flatMap(p => p.sessions || [])
  const maxDate = startOfMonth(new Date())
  const minDate = startOfMonth(subMonths(maxDate, 5))
  const months = eachMonthOfInterval({ start: minDate, end: maxDate })

  const data = months.map(month => {
    const monthSessions = sessions.filter(s => isSameMonth(new Date(s.start_date), month))
    const monthPuzzles = monthSessions.map(s => 
      puzzles.find(p => p.sessions?.some(ps => ps.id === s.id))
    ).filter(Boolean) as Puzzle[]

    return {
      date: month,
      easy: monthPuzzles.filter(p => p.difficulty === 'easy').length,
      medium: monthPuzzles.filter(p => p.difficulty === 'medium').length,
      hard: monthPuzzles.filter(p => p.difficulty === 'hard').length
    }
  })

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <InfoTooltip text="Graf zobrazuje počet složených puzzlí v jednotlivých měsících rozdělených podle obtížnosti. Data jsou zobrazena za posledních 6 měsíců. Zelená křivka představuje snadná puzzle, žlutá střední obtížnost a červená těžká puzzle. Můžete tak sledovat, jak se mění vaše preference obtížnosti v čase." />
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
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #ccc',
                borderRadius: '4px',
                padding: '8px'
              }}
              labelFormatter={(date) => format(date, 'LLLL yyyy', { locale: cs })}
              formatter={(value: number, name: string) => [
                value,
                name === 'easy' ? 'Snadné' :
                name === 'medium' ? 'Střední' : 'Těžké'
              ]}
            />
            <Legend
              formatter={(value) =>
                value === 'easy' ? 'Snadné' :
                value === 'medium' ? 'Střední' : 'Těžké'
              }
            />
            <Line type="monotone" dataKey="easy" stroke="#22c55e" strokeWidth={2} />
            <Line type="monotone" dataKey="medium" stroke="#eab308" strokeWidth={2} />
            <Line type="monotone" dataKey="hard" stroke="#ef4444" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}