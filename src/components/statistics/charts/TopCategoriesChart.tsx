import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { Puzzle } from '../../../lib/types'
import { InfoTooltip } from '../../InfoTooltip'
import { useNavigate } from 'react-router-dom'
import { formatNumber } from '../../../utils/format'

interface TopCategoriesChartProps {
  puzzles: Puzzle[]
  categories: any[]
  showAll?: boolean
}

export function TopCategoriesChart({ puzzles, categories, showAll = false }: TopCategoriesChartProps) {
  const activePuzzles = showAll ? puzzles : puzzles.filter(p => p.in_collection)
  const navigate = useNavigate()
  
  const data = categories
    .map(category => ({
      name: category.name,
      emoji: category.emoji,
      value: activePuzzles.filter(p => p.categories.includes(category.name)).length
    }))
    .filter(d => d.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 10)

  const handleClick = (name: string) => {
    navigate('/', { state: { category: name } })
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <InfoTooltip text="Graf zobrazuje 10 nejčastějších motivů ve sbírce. Pro každý motiv je zobrazen celkový počet puzzlí s tímto motivem. Motivy jsou seřazeny podle počtu puzzlí od nejvyššího po nejnižší. Jeden puzzle může mít více motivů současně." />
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
                return item ? `${item.emoji} ${item.name}` : label
              }}
            />
            <Bar dataKey="value" fill="#6366f1" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}