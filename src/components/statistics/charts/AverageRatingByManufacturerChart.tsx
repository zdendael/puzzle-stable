import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { Puzzle } from '../../../lib/types'
import { InfoTooltip } from '../../InfoTooltip'
import { useNavigate } from 'react-router-dom'
import { formatNumber } from '../../../utils/format'

interface AverageRatingByManufacturerChartProps {
  puzzles: Puzzle[]
}

export function AverageRatingByManufacturerChart({ puzzles }: AverageRatingByManufacturerChartProps) {
  const navigate = useNavigate()
  
  const data = Object.entries(
    puzzles.reduce((acc, puzzle) => {
      if (!puzzle.rating) return acc
      
      if (!acc[puzzle.manufacturer]) {
        acc[puzzle.manufacturer] = { total: 0, count: 0 }
      }
      acc[puzzle.manufacturer].total += puzzle.rating
      acc[puzzle.manufacturer].count++
      return acc
    }, {} as Record<string, { total: number; count: number }>)
  )
    .map(([name, { total, count }]) => ({
      name,
      value: Math.round((total / count) * 10) / 10,
      count
    }))
    .filter(item => item.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 10)

  const handleClick = (name: string) => {
    navigate('/', { state: { manufacturer: name, rating: 'any' } })
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <InfoTooltip text="Graf zobrazuje průměrné hodnocení puzzlí od jednotlivých výrobců. Jsou zobrazeni pouze výrobci s alespoň jedním hodnoceným puzzle. Hodnocení je na škále 1-5 hvězdiček, kde 5 je nejlepší. Zobrazeno je top 10 výrobců seřazených podle průměrného hodnocení. Kliknutím na sloupec zobrazíte všechna hodnocená puzzle od daného výrobce." />
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 120, right: 30, top: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" domain={[0, 5]} />
            <YAxis 
              dataKey="name" 
              type="category"
              interval={0}
              tick={{ fontSize: 12 }}
              width={120}
              onClick={(data) => data && handleClick(data)}
              style={{ cursor: 'pointer' }}
            />
            <Tooltip
              formatter={(value: number) => [`${formatNumber(value, 1)} ⭐`, 'Průměrné hodnocení']}
              labelFormatter={(label: string) => {
                const item = data.find(d => d.name === label)
                return item ? `${item.name} (${formatNumber(item.count)} puzzlí)` : label
              }}
            />
            <Bar dataKey="value" fill="#6366f1" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}