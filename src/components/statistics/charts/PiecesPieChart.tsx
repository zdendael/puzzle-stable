import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import type { Puzzle } from '../../../lib/types'
import { InfoTooltip } from '../../InfoTooltip'
import { useNavigate } from 'react-router-dom'
import { formatNumber, formatPercent } from '../../../utils/format'

interface PiecesPieChartProps {
  puzzles: Puzzle[]
  showAll?: boolean
}

const COLORS = ['#6366f1', '#f43f5e', '#22c55e', '#eab308', '#8b5cf6', '#ec4899', '#14b8a6']

export function PiecesPieChart({ puzzles, showAll = false }: PiecesPieChartProps) {
  const navigate = useNavigate()
  const activePuzzles = showAll ? puzzles : puzzles.filter(p => p.in_collection)
  
  const pieceRanges = [
    { min: 0, max: 500, label: 'do 500' },
    { min: 501, max: 1000, label: '501-1000' },
    { min: 1001, max: 2000, label: '1001-2000' },
    { min: 2001, max: 3000, label: '2001-3000' },
    { min: 3001, max: 4000, label: '3001-4000' },
    { min: 4001, max: 5000, label: '4001-5000' },
    { min: 5001, max: Infinity, label: 'nad 5000' }
  ]

  const data = pieceRanges.map(range => ({
    name: range.label,
    value: activePuzzles.filter(p => p.pieces >= range.min && p.pieces <= range.max).length,
    range
  })).filter(d => d.value > 0)

  const handleClick = (range: typeof pieceRanges[0]) => {
    navigate('/', { state: { piecesMin: range.min, piecesMax: range.max } })
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <InfoTooltip text="Graf zobrazuje rozdělení puzzlí podle počtu dílků. Puzzle jsou rozděleny do kategorií podle velikosti, od nejmenších (do 500 dílků) až po největší (nad 5000 dílků). U každé kategorie je zobrazen počet puzzlí a procentuální zastoupení ve sbírce. Kliknutím na výseč zobrazíte všechna puzzle v dané kategorii." />
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              key={`pieces-pie-${activePuzzles.length}`}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              onClick={(data) => data && handleClick(data.range)}
              style={{ cursor: 'pointer' }}
              label={({ name, percent }) => `${name} (${formatPercent(percent)})`}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}-${data[index].value}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => [formatNumber(value), 'Počet puzzlí']}
              labelFormatter={(name: string) => {
                const item = data.find(d => d.name === name)
                return item ? `${item.name} (${formatPercent(item.value / activePuzzles.length)})` : name
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}