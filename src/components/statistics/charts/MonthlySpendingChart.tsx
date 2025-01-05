import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { Puzzle } from '../../../lib/types'
import { format, startOfMonth, eachMonthOfInterval, isWithinInterval } from 'date-fns'
import { cs } from 'date-fns/locale'
import { useState, useMemo } from 'react'
import { InfoTooltip } from '../../InfoTooltip'
import { useNavigate } from 'react-router-dom'
import { formatNumber } from '../../../utils/format'

interface MonthlySpendingChartProps {
  puzzles: Puzzle[]
}

export function MonthlySpendingChart({ puzzles }: MonthlySpendingChartProps) {
  const navigate = useNavigate()
  
  const ownPurchases = puzzles.filter(p => p.is_own_purchase && p.purchase_date)
  const dates = ownPurchases.map(p => new Date(p.purchase_date!))
  const minDate = startOfMonth(new Date(Math.min(...dates.map(d => d.getTime()))))
  const maxDate = startOfMonth(new Date())

  const availablePeriods = useMemo(() => {
    const periods: { year: number; month: number }[] = []
    const months = eachMonthOfInterval({ start: minDate, end: maxDate })
    
    months.forEach(date => {
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      
      const hasExpenses = ownPurchases.some(p => {
        const purchaseDate = new Date(p.purchase_date!)
        return purchaseDate.getFullYear() === year && purchaseDate.getMonth() + 1 === month
      })
      
      if (hasExpenses) {
        periods.push({ year, month })
      }
    })
    
    return periods.reverse()
  }, [ownPurchases, minDate, maxDate])

  const [selectedPeriod, setSelectedPeriod] = useState(() => {
    const latest = availablePeriods[0]
    return latest ? `${latest.year}-${String(latest.month).padStart(2, '0')}` : ''
  })

  const data = useMemo(() => {
    if (!selectedPeriod) return []

    const [year, month] = selectedPeriod.split('-').map(Number)
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0)

    return ownPurchases
      .filter(p => {
        const purchaseDate = new Date(p.purchase_date!)
        return isWithinInterval(purchaseDate, { start: startDate, end: endDate })
      })
      .sort((a, b) => new Date(a.purchase_date!).getTime() - new Date(b.purchase_date!).getTime())
      .map(puzzle => ({
        date: new Date(puzzle.purchase_date!),
        name: puzzle.name,
        value: puzzle.price,
        id: puzzle.id
      }))
  }, [ownPurchases, selectedPeriod])

  const totalSpent = data.reduce((sum, item) => sum + item.value, 0)

  const handleClick = (id: number) => {
    navigate('/', { state: { puzzleId: id } })
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <InfoTooltip text="Graf zobrazuje výdaje na puzzle v jednotlivých dnech vybraného měsíce. Každý sloupec představuje jeden nákup, jeho výška odpovídá ceně puzzle. Můžete přepínat mezi jednotlivými měsíci a vidět detailní přehled nákupů. Zobrazena je i celková částka za vybraný měsíc. Kliknutím na sloupec zobrazíte detail daného puzzle." />
      </div>

      <div className="flex justify-between items-center mb-4">
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          {availablePeriods.map(({ year, month }) => (
            <option 
              key={`${year}-${month}`} 
              value={`${year}-${String(month).padStart(2, '0')}`}
            >
              {format(new Date(year, month - 1), 'LLLL yyyy', { locale: cs })}
            </option>
          ))}
        </select>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Celkem: {formatNumber(totalSpent)} Kč
        </div>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={(date) => format(date, 'd. M.', { locale: cs })}
              onClick={(data) => data && handleClick(data.id)}
              style={{ cursor: 'pointer' }}
            />
            <YAxis />
            <Tooltip
              labelFormatter={(date) => format(date, 'PPP', { locale: cs })}
              formatter={(value: number, name: string) => [
                `${formatNumber(value)} Kč`,
                name
              ]}
            />
            <Bar dataKey="value" fill="#6366f1" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}