import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { Puzzle } from '../../../lib/types'
import { InfoTooltip } from '../../InfoTooltip'
import { useNavigate } from 'react-router-dom'
import { formatNumber } from '../../../utils/format'

interface TopManufacturersChartProps {
  puzzles: Puzzle[]
  showAll?: boolean
}

export function TopManufacturersChart({ puzzles, showAll = false }: TopManufacturersChartProps) {
  const activePuzzles = showAll ? puzzles : puzzles.filter(p => p.in_collection)
  const navigate = useNavigate()
  
  const data = Object.entries(
    activePuzzles.reduce((acc, puzzle) => {
      acc[puzzle.manufacturer] = (acc[puzzle.manufacturer] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  )
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10)

  const handleClick = (name: string) => {
    navigate('/', { state: { manufacturer: name } })
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <InfoTooltip text="Graf zobrazuje 10 nejčastějších výrobců ve sbírce. Pro každého výrobce je zobrazen celkový počet puzzlí. Výrobci jsou seřazeni podle počtu puzzlí od nejvyššího po nejnižší." />
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
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #ccc',
                borderRadius: '4px',
                padding: '8px'
              }}
              formatter={(value: number) => [formatNumber(value), 'Počet puzzlí']}
            />
            <Bar dataKey="value" fill="#6366f1" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}