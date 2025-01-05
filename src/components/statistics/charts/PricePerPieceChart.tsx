import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { Puzzle } from '../../../lib/types'
import { InfoTooltip } from '../../InfoTooltip'

interface PricePerPieceChartProps {
  puzzles: Puzzle[]
}

export function PricePerPieceChart({ puzzles }: PricePerPieceChartProps) {
  const data = Object.entries(
    puzzles
      .filter(p => p.is_own_purchase)
      .reduce((acc, puzzle) => {
        if (!acc[puzzle.manufacturer]) {
          acc[puzzle.manufacturer] = { totalPrice: 0, totalPieces: 0 }
        }
        acc[puzzle.manufacturer].totalPrice += puzzle.price
        acc[puzzle.manufacturer].totalPieces += puzzle.pieces
        return acc
      }, {} as Record<string, { totalPrice: number; totalPieces: number }>)
  )
    .map(([name, { totalPrice, totalPieces }]) => ({
      name,
      value: Math.round((totalPrice / totalPieces) * 100) / 100
    }))
    .filter(item => item.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 10)

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <InfoTooltip text="Graf zobrazuje průměrnou cenu za jeden dílek podle výrobce. Pro každého výrobce je celková cena všech puzzlí vydělena celkovým počtem dílků. Zobrazeno je top 10 výrobců seřazených od nejdražšího po nejlevnější. Započítány jsou pouze vlastní nákupy (ne dárky nebo puzzle ze spolupráce)." />
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
              formatter={(value: number) => [`${value} Kč`, 'Cena za dílek']}
            />
            <Bar dataKey="value" fill="#6366f1" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}