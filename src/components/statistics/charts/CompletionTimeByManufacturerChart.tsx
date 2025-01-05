import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { Puzzle } from '../../../lib/types'
import { InfoTooltip } from '../../InfoTooltip'
import { useNavigate } from 'react-router-dom'
import { formatDuration, formatNumber } from '../../../utils/format'

interface CompletionTimeByManufacturerChartProps {
  puzzles: Puzzle[]
}

export function CompletionTimeByManufacturerChart({ puzzles }: CompletionTimeByManufacturerChartProps) {
  const navigate = useNavigate()
  
  const data = Object.entries(
    puzzles.reduce((acc, puzzle) => {
      const sessions = puzzle.sessions?.filter(s => s.duration_minutes) || []
      if (sessions.length === 0) return acc
      
      if (!acc[puzzle.manufacturer]) {
        acc[puzzle.manufacturer] = {
          totalTime: 0,
          sessionCount: 0,
          pieceCount: 0
        }
      }
      
      acc[puzzle.manufacturer].totalTime += sessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0)
      acc[puzzle.manufacturer].sessionCount += sessions.length
      acc[puzzle.manufacturer].pieceCount += puzzle.pieces * sessions.length
      
      return acc
    }, {} as Record<string, { totalTime: number; sessionCount: number; pieceCount: number }>)
  )
    .map(([name, stats]) => ({
      name,
      value: Math.round(stats.totalTime / stats.sessionCount),
      minutesPerPiece: Math.round((stats.totalTime / stats.pieceCount) * 100) / 100,
      sessionCount: stats.sessionCount
    }))
    .filter(item => item.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 10)

  const handleClick = (name: string) => {
    navigate('/sessions', { state: { manufacturer: name } })
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <InfoTooltip text="Graf zobrazuje průměrnou dobu skládání puzzlí podle výrobce. Pro každého výrobce je zobrazen průměrný čas potřebný k dokončení jednoho puzzle. V tooltipu najdete také průměrný čas na jeden dílek. Zobrazeno je top 10 výrobců seřazených podle průměrné doby skládání." />
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 120 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis
              dataKey="name"
              type="category"
              width={120}
              interval={0}
              onClick={(data) => data && handleClick(data)}
              style={{ cursor: 'pointer' }}
            />
            <Tooltip
              formatter={(value: number) => [formatDuration(value), 'Průměrná doba']}
              labelFormatter={(label: string) => {
                const item = data.find(d => d.name === label)
                return item ? `${item.name}
Počet skládání: ${formatNumber(item.sessionCount)}
Čas na dílek: ${formatNumber(item.minutesPerPiece, 2)} min` : label
              }}
            />
            <Bar dataKey="value" fill="#6366f1" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}