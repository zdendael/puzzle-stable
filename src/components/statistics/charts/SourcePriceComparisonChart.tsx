import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { Puzzle } from '../../../lib/types'
import { InfoTooltip } from '../../InfoTooltip'
import { useNavigate } from 'react-router-dom'
import { formatNumber } from '../../../utils/format'

interface SourcePriceComparisonChartProps {
  puzzles: Puzzle[]
}

export function SourcePriceComparisonChart({ puzzles }: SourcePriceComparisonChartProps) {
  const navigate = useNavigate()
  
  const ownPurchases = puzzles.filter(p => p.is_own_purchase && p.source)

  const data = Object.entries(
    ownPurchases.reduce((acc, puzzle) => {
      if (!puzzle.source) return acc
      
      if (!acc[puzzle.source.name]) {
        acc[puzzle.source.name] = {
          prices: [],
          totalPieces: 0,
          totalPrice: 0,
          sourceId: puzzle.source.id
        }
      }
      acc[puzzle.source.name].prices.push(puzzle.price)
      acc[puzzle.source.name].totalPieces += puzzle.pieces
      acc[puzzle.source.name].totalPrice += puzzle.price
      return acc
    }, {} as Record<string, { prices: number[]; totalPieces: number; totalPrice: number; sourceId: number }>)
  )
    .map(([name, { prices, totalPieces, totalPrice, sourceId }]) => {
      const sortedPrices = [...prices].sort((a, b) => a - b)
      return {
        name,
        min: sortedPrices[0],
        max: sortedPrices[sortedPrices.length - 1],
        avg: Math.round(totalPrice / prices.length),
        pricePerPiece: Math.round((totalPrice / totalPieces) * 100) / 100,
        count: prices.length,
        sourceId
      }
    })
    .sort((a, b) => b.avg - a.avg)

  const handleClick = (sourceId: number) => {
    navigate('/', { state: { source: sourceId, isOwnPurchase: true } })
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <InfoTooltip text="Graf porovnává průměrné ceny puzzlí mezi různými zdroji (e-shopy, obchody). Pro každý zdroj je zobrazena průměrná cena puzzle, minimální a maximální cena, průměrná cena za dílek a celkový počet zakoupených puzzlí. Zdroje jsou seřazeny podle průměrné ceny od nejvyšší po nejnižší. Kliknutím na sloupec zobrazíte všechna puzzle zakoupená z daného zdroje." />
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 120 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis
              dataKey="name"
              type="category"
              interval={0}
              width={120}
              tick={({ x, y, payload }) => (
                <g transform={`translate(${x},${y})`}>
                  <text
                    x={-10}
                    y={0}
                    dy={4}
                    textAnchor="end"
                    className="text-sm fill-current text-gray-500 dark:text-gray-400"
                  >
                    {payload.value}
                  </text>
                </g>
              )}
              onClick={(data) => data && handleClick(data.sourceId)}
              style={{ cursor: 'pointer' }}
            />
            <Tooltip
              formatter={(value: number) => [`${formatNumber(value)}\u00A0Kč`, 'Průměrná cena']}
              labelFormatter={(name: string) => {
                const item = data.find(d => d.name === name)
                if (!item) return name
                return `${name}
Min: ${formatNumber(item.min)}\u00A0Kč
Max: ${formatNumber(item.max)}\u00A0Kč
Za dílek: ${formatNumber(item.pricePerPiece, 2)}\u00A0Kč
Počet: ${formatNumber(item.count)} puzzlí`
              }}
            />
            <Bar dataKey="avg" fill="#6366f1" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}