import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { Puzzle } from '../../../lib/types'
import { InfoTooltip } from '../../InfoTooltip'
import { useNavigate } from 'react-router-dom'
import { formatNumber } from '../../../utils/format'

interface TopTagsChartProps {
  puzzles: Puzzle[]
  tags: any[]
}

export function TopTagsChart({ puzzles, tags }: TopTagsChartProps) {
  const navigate = useNavigate()
  
  const data = tags
    .map(tag => {
      const puzzlesWithTag = puzzles.filter(p => p.tags.includes(tag.name))
      
      if (puzzlesWithTag.length === 0) return null

      const averageRating = puzzlesWithTag.filter(p => p.rating).length > 0
        ? Math.round(
            puzzlesWithTag.reduce((sum, p) => sum + (p.rating || 0), 0) / 
            puzzlesWithTag.filter(p => p.rating).length * 10
          ) / 10
        : 0

      return {
        name: tag.name,
        emoji: tag.emoji,
        color: tag.color,
        value: puzzlesWithTag.length,
        rating: averageRating
      }
    })
    .filter(Boolean)
    .sort((a, b) => b.value - a.value)
    .slice(0, 10)

  const handleClick = (name: string) => {
    navigate('/', { state: { tag: name } })
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <InfoTooltip text="Graf zobrazuje 10 nejpoužívanějších štítků ve sbírce. Pro každý štítek je zobrazen počet puzzlí, kterým byl přiřazen, a průměrné hodnocení těchto puzzlí. Štítky jsou seřazeny podle počtu použití od nejvyššího po nejnižší." />
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
              tick={({ x, y, payload }) => {
                const item = data.find(d => d.name === payload.value)
                return (
                  <g transform={`translate(${x},${y})`}>
                    <text
                      x={-10}
                      y={0}
                      dy={4}
                      textAnchor="end"
                      className="text-sm fill-current text-gray-500 dark:text-gray-400"
                    >
                      {item?.emoji} {item?.name}
                    </text>
                  </g>
                )
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #ccc',
                borderRadius: '4px',
                padding: '8px'
              }}
              formatter={(value: number) => [formatNumber(value), 'Počet puzzlí']}
              labelFormatter={(label: string) => {
                const item = data.find(d => d.name === label)
                return item ? `${item.emoji} ${item.name} (${formatNumber(item.rating, 1)} ⭐)` : label
              }}
            />
            <Bar dataKey="value" fill="#6366f1" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}