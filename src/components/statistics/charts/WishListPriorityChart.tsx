import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import type { WishListItem } from '../../../lib/types'
import { InfoTooltip } from '../../InfoTooltip'
import { useNavigate } from 'react-router-dom'
import { formatNumber, formatPercent } from '../../../utils/format'

interface WishListPriorityChartProps {
  items: WishListItem[]
}

const COLORS = {
  high: '#ef4444',
  medium: '#eab308',
  low: '#22c55e'
}

export function WishListPriorityChart({ items }: WishListPriorityChartProps) {
  const navigate = useNavigate()
  
  const activeItems = items.filter(i => !i.deleted_at)
  
  const data = [
    { name: 'Vysoká', value: activeItems.filter(i => i.priority === 'high').length, priority: 'high' },
    { name: 'Střední', value: activeItems.filter(i => i.priority === 'medium').length, priority: 'medium' },
    { name: 'Nízká', value: activeItems.filter(i => i.priority === 'low').length, priority: 'low' }
  ].filter(d => d.value > 0)

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <InfoTooltip text="Graf zobrazuje rozdělení položek v nákupním seznamu podle priority." />
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
              {data.map((entry) => (
                <Cell key={entry.priority} fill={COLORS[entry.priority as keyof typeof COLORS]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => [formatNumber(value), 'Počet položek']}
              labelFormatter={(name: string) => {
                const item = data.find(d => d.name === name)
                return item ? `${item.name} (${formatPercent(item.value / items.length)})` : name
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}