import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { WishListItem } from '../../../lib/types'
import { InfoTooltip } from '../../InfoTooltip'
import { useNavigate } from 'react-router-dom'
import { formatNumber } from '../../../utils/format'

interface WishListPriceDistributionChartProps {
  items: WishListItem[]
}

export function WishListPriceDistributionChart({ items }: WishListPriceDistributionChartProps) {
  const navigate = useNavigate()
  
  const priceRanges = [
    { min: 0, max: 200, label: 'do 200 Kč' },
    { min: 200, max: 400, label: '200-400 Kč' },
    { min: 400, max: 600, label: '400-600 Kč' },
    { min: 600, max: 800, label: '600-800 Kč' },
    { min: 800, max: 1000, label: '800-1000 Kč' },
    { min: 1000, max: 1500, label: '1000-1500 Kč' },
    { min: 1500, max: 2000, label: '1500-2000 Kč' },
    { min: 2000, max: Infinity, label: 'nad 2000 Kč' }
  ]

  const activeItems = items.filter(i => !i.deleted_at)
  
  const data = priceRanges.map(range => {
    const itemsInRange = activeItems.filter(i => 
      i.price >= range.min && i.price < range.max
    )
    
    return {
      name: range.label,
      value: itemsInRange.length,
      range
    }
  }).filter(d => d.value > 0)

  const handleClick = (range: typeof priceRanges[0]) => {
    navigate('/wishlist', { 
      state: { 
        priceMin: range.min,
        priceMax: range.max === Infinity ? null : range.max,
        searchTerm: ''
      } 
    })
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <InfoTooltip text="Graf zobrazuje rozdělení položek v nákupním seznamu podle ceny. Položky jsou rozděleny do cenových kategorií a pro každou kategorii je zobrazen počet položek." />
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name"
            />
            <YAxis />
            <Tooltip
              formatter={(value: number) => [formatNumber(value), 'Počet položek']}
              labelFormatter={(label: string) => {
                const item = data.find(d => d.name === label)
                return item ? `${item.name} (${formatNumber(item.value)} položek)` : label
              }}
            />
            <Bar dataKey="value" fill="#6366f1" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}