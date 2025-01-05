import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { WishListItem } from '../../../lib/types'
import { InfoTooltip } from '../../InfoTooltip'
import { useNavigate } from 'react-router-dom'
import { formatNumber } from '../../../utils/format'

interface WishListManufacturersChartProps {
  items: WishListItem[]
}

export function WishListManufacturersChart({ items }: WishListManufacturersChartProps) {
  const navigate = useNavigate()
  
  const activeItems = items.filter(i => !i.deleted_at)
  
  const data = Object.entries(
    activeItems.reduce((acc, item) => {
      acc[item.manufacturer] = (acc[item.manufacturer] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  )
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10)

  const handleClick = (name: string) => {
    navigate('/wishlist', { 
      state: { 
        manufacturers: [name],
        searchTerm: ''
      } 
    })
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <InfoTooltip text="Graf zobrazuje 10 nejčastějších výrobců v nákupním seznamu. Pro každého výrobce je zobrazen počet položek." />
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 100 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis 
              dataKey="name" 
              type="category"
              width={100}
              interval={0}
            />
            <Tooltip
              formatter={(value: number) => [formatNumber(value), 'Počet položek']}
            />
            <Bar dataKey="value" fill="#6366f1" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}