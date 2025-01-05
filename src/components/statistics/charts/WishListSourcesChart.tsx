import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import type { WishListItem } from '../../../lib/types'
import { InfoTooltip } from '../../InfoTooltip'
import { useNavigate } from 'react-router-dom'
import { formatNumber, formatPercent } from '../../../utils/format'

interface WishListSourcesChartProps {
  items: WishListItem[]
}

const COLORS = ['#6366f1', '#f43f5e', '#22c55e', '#eab308', '#8b5cf6', '#ec4899', '#14b8a6']

export function WishListSourcesChart({ items }: WishListSourcesChartProps) {
  const navigate = useNavigate()
  
  const activeItems = items.filter(i => !i.deleted_at)
  
  const data = Object.entries(
    activeItems.reduce((acc, item) => {
      if (item.source) {
        acc[item.source.name] = (acc[item.source.name] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)
  )
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  const handleClick = (name: string) => {
    const source = items.find(i => i.source?.name === name)?.source
    if (source) {
      navigate('/wishlist', { state: { source: source.id } })
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <InfoTooltip text="Graf zobrazuje rozdělení položek v nákupním seznamu podle zdrojů (e-shopů, obchodů). Pro každý zdroj je zobrazen počet položek a procentuální zastoupení." />
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={({ name, percent }) => `${name} (${formatPercent(percent)})`}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => [formatNumber(value), 'Počet položek']}
              labelFormatter={(name: string) => {
                const item = data.find(d => d.name === name)
                const total = activeItems.length
                return item ? `${item.name} (${formatPercent(total ? item.value / total : 0)})` : name
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}