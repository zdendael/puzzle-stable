import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { Puzzle } from '../../../lib/types'
import { InfoTooltip } from '../../InfoTooltip'
import { useNavigate } from 'react-router-dom'
import { formatNumber, formatDuration } from '../../../utils/format'

interface AverageTimeByPiecesChartProps {
  puzzles: Puzzle[]
}

export function AverageTimeByPiecesChart({ puzzles }: AverageTimeByPiecesChartProps) {
  const navigate = useNavigate()
  
  const pieceRanges = [
    { min: 0, max: 500, label: 'do 500' },
    { min: 501, max: 1000, label: '501-1000' },
    { min: 1001, max: 2000, label: '1001-2000' },
    { min: 2001, max: 3000, label: '2001-3000' },
    { min: 3001, max: 4000, label: '3001-4000' },
    { min: 4001, max: 5000, label: '4001-5000' },
    { min: 5001, max: Infinity, label: 'nad 5000' }
  ]

  const data = pieceRanges.map(range => {
    const puzzlesInRange = puzzles.filter(p => p.pieces >= range.min && p.pieces <= range.max)
    const completedSessions = puzzlesInRange.flatMap(p => 
      (p.sessions || []).filter(s => s.duration_minutes)
    )
    
    if (completedSessions.length === 0) return null

    const averageTime = Math.round(
      completedSessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) / completedSessions.length
    )

    return {
      name: range.label,
      value: averageTime,
      count: completedSessions.length,
      range
    }
  }).filter(Boolean)

  const handleClick = (range: typeof pieceRanges[0]) => {
    navigate('/sessions', { 
      state: { 
        piecesMin: range.min,
        piecesMax: range.max
      } 
    })
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <InfoTooltip text="Graf zobrazuje průměrnou dobu skládání puzzlí podle počtu dílků. Puzzle jsou rozděleny do kategorií podle velikosti a pro každou kategorii je vypočítán průměrný čas skládání ze všech dokončených sessions. Čas je zobrazen v hodinách a minutách." />
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name"
              onClick={(data) => data && handleClick(data.range)}
              style={{ cursor: 'pointer' }}
            />
            <YAxis />
            <Tooltip
              formatter={(value: number) => [formatDuration(value), 'Průměrná doba']}
              labelFormatter={(label: string) => {
                const item = data.find(d => d.name === label)
                return item ? `${item.name} (${formatNumber(item.count)} skládání)` : label
              }}
            />
            <Bar dataKey="value" fill="#6366f1" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}