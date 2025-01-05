import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { WishListItem } from '../../../lib/types'
import { InfoTooltip } from '../../InfoTooltip'
import { useNavigate } from 'react-router-dom'
import { formatNumber } from '../../../utils/format'

interface WishListCategoriesChartProps {
  items: WishListItem[]
  categories: any[]
}

export function WishListCategoriesChart({ items, categories }: WishListCategoriesChartProps) {
  const navigate = useNavigate()
  
  const activeItems = items.filter(i => !i.deleted_at)
  
  const data = categories
    .map(category => ({
      name: category.name,
      emoji: category.emoji,
      value: activeItems.filter(i => i.categories.includes(category.name)).length
    }))
    .filter(d => d.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 10)

  const handleClick = (name: string) => {
    navigate('/wishlist', { 
      state: { 
        categories: [name],
        searchTerm: ''
      } 
    })
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <InfoTooltip text="Graf zobrazuje 10 nejčastějších motivů v nákupním seznamu. Pro každý motiv je zobrazen celkový počet položek s tímto motivem. Motivy jsou seřazeny podle počtu položek od nejvyššího po nejnižší. Jedna položka může mít více motivů současně." />
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
              formatter={(value: number) => [formatNumber(value), 'Počet položek']}
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