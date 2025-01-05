import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { Puzzle } from '../../../lib/types'
import { InfoTooltip } from '../../InfoTooltip'
import { useNavigate } from 'react-router-dom'
import { formatNumber } from '../../../utils/format'

interface TopRatedCategoriesChartProps {
  puzzles: Puzzle[]
  categories: any[]
}

export function TopRatedCategoriesChart({ puzzles, categories }: TopRatedCategoriesChartProps) {
  const navigate = useNavigate()
  
  const data = categories
    .map(category => {
      const puzzlesWithCategory = puzzles.filter(p => 
        p.categories.includes(category.name) && p.rating
      )
      
      if (puzzlesWithCategory.length === 0) return null

      const averageRating = Math.round(
        puzzlesWithCategory.reduce((sum, p) => sum + (p.rating || 0), 0) / 
        puzzlesWithCategory.length * 10
      ) / 10

      return {
        name: category.name,
        emoji: category.emoji,
        value: averageRating,
        count: puzzlesWithCategory.length
      }
    })
    .filter(Boolean)
    .sort((a, b) => b.value - a.value)
    .slice(0, 10)

  const handleClick = (name: string) => {
    navigate('/', { state: { category: name, rating: 'any' } })
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <InfoTooltip text="Graf zobrazuje průměrné hodnocení puzzlí podle jejich motivů. Jsou zobrazeny pouze motivy s alespoň jedním hodnoceným puzzle. Hodnocení je na škále 1-5 hvězdiček, kde 5 je nejlepší. Zobrazeno je top 10 motivů seřazených podle průměrného hodnocení. U každého motivu je v závorce uveden počet hodnocených puzzlí." />
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 120 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" domain={[0, 5]} />
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
              formatter={(value: number) => [`${formatNumber(value, 1)} ⭐`, 'Průměrné hodnocení']}
              labelFormatter={(label: string) => {
                const item = data.find(d => d.name === label)
                return item ? `${item.emoji} ${item.name} (${formatNumber(item.count)} puzzlí)` : label
              }}
            />
            <Bar dataKey="value" fill="#6366f1" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}