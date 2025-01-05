import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { Puzzle } from '../../../lib/types'
import { format } from 'date-fns'
import { cs } from 'date-fns/locale'
import { InfoTooltip } from '../../InfoTooltip'
import { useNavigate } from 'react-router-dom'
import { formatNumber } from '../../../utils/format'

interface SpendingTimelineChartProps {
  puzzles: Puzzle[]
}

export function SpendingTimelineChart({ puzzles }: SpendingTimelineChartProps) {
  const navigate = useNavigate()
  
  const sortedPuzzles = [...puzzles]
    .filter(p => p.is_own_purchase && p.purchase_date)
    .sort((a, b) => new Date(a.purchase_date!).getTime() - new Date(b.purchase_date!).getTime())

  const data = sortedPuzzles.reduce((acc, puzzle) => {
    const date = format(new Date(puzzle.purchase_date!), 'MM/yyyy', { locale: cs })
    const lastEntry = acc[acc.length - 1]
    const totalSpent = puzzle.price + (lastEntry?.totalSpent || 0)

    if (lastEntry && lastEntry.date === date) {
      lastEntry.spent += puzzle.price
      lastEntry.totalSpent = totalSpent
    } else {
      acc.push({
        date,
        spent: puzzle.price,
        totalSpent,
        month: new Date(puzzle.purchase_date!)
      })
    }

    return acc
  }, [] as { date: string; spent: number; totalSpent: number; month: Date }[])

  const handleClick = (month: Date) => {
    navigate('/', { 
      state: { 
        purchaseDateFrom: format(month, 'yyyy-MM-dd'),
        purchaseDateTo: format(new Date(month.getFullYear(), month.getMonth() + 1, 0), 'yyyy-MM-dd'),
        isOwnPurchase: true
      } 
    })
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <InfoTooltip text="Graf zobrazuje kumulativní výdaje na puzzle v čase. Křivka ukazuje celkovou částku vynaloženou na nákup puzzlí od začátku sbírky. Započítány jsou pouze vlastní nákupy (ne dárky nebo puzzle ze spolupráce). Částky jsou v Kč. Kliknutím na bod v grafu zobrazíte všechna puzzle zakoupená v daném měsíci." />
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={(value) => {
                const [month, year] = value.split('/')
                return `${month}/${year}`
              }}
              onClick={(data) => data && handleClick(data.month)}
              style={{ cursor: 'pointer' }}
            />
            <YAxis />
            <Tooltip
              labelFormatter={(value) => {
                const [month, year] = value.split('/')
                return format(new Date(parseInt(year), parseInt(month) - 1), 'LLLL yyyy', { locale: cs })
              }}
              formatter={(value: number) => [`${formatNumber(value)}\u00A0Kč`, 'Celkové výdaje']}
            />
            <Line
              type="monotone"
              dataKey="totalSpent"
              stroke="#6366f1"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}