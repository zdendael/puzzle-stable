import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { Puzzle } from '../../../lib/types'
import { InfoTooltip } from '../../InfoTooltip'
import { useNavigate } from 'react-router-dom'
import { formatNumber } from '../../../utils/format'

interface CompletionTimeDistributionChartProps {
  puzzles: Puzzle[]
}

export function CompletionTimeDistributionChart({ puzzles }: CompletionTimeDistributionChartProps) {
  const navigate = useNavigate()
  
  const timeRanges = [
    { min: 0, max: 60, label: 'do 1h' },
    { min: 60, max: 120, label: '1-2h' },
    { min: 120, max: 180, label: '2-3h' },
    { min: 180, max: 240, label: '3-4h' },
    { min: 240, max: 300, label: '4-5h' },
    { min: 300, max: 360, label: '5-6h' },
    { min: 360, max: 480, label: '6-8h' },
    { min: 480, max: 600, label: '8-10h' },
    { min: 600, max: 720, label: '10-12h' },
    { min: 720, max: Infinity, label: 'nad 12h' }
  ]

  const data = timeRanges.map(range => {
    const sessions = puzzles.flatMap(p => p.sessions || [])
      .filter(s => {
        const duration = s.duration_minutes || 0
        return duration >= range.min && duration < range.max
      })
    
    return {
      name: range.label,
      value: sessions.length,
      range
    }
  }).filter(d => d.value > 0)

  const handleClick = (range: typeof timeRanges[0]) => {
    navigate('/sessions', { 
      state: { 
        durationMin: range.min,
        durationMax: range.max === Infinity ? null : range.max
      } 
    })
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <InfoTooltip text="Graf zobrazuje rozdělení dokončených skládání podle doby trvání. Skládání jsou rozdělena do časových intervalů a pro každý interval je zobrazen počet skládání. Můžete tak vidět, jak dlouho vám typicky trvá složit puzzle." />
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name"
              onClick={(data) => data && handleClick(data.range)}
              style={{ cursor: 'pointer' }}
              tick={{ 
                angle: -45,
                textAnchor: 'end',
                dominantBaseline: 'auto',
                fontSize: 11
              }}
              height={60}
              interval={0}
            />
            <YAxis />
            <Tooltip
              formatter={(value: number) => [formatNumber(value), 'Počet skládání']}
              labelFormatter={(label: string) => {
                const item = data.find(d => d.name === label)
                return item ? `${item.name} (${formatNumber(item.value)} skládání)` : label
              }}
            />
            <Bar dataKey="value" fill="#6366f1" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}