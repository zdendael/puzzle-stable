import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { Puzzle } from '../../../lib/types'
import { format, getYear } from 'date-fns'
import { cs } from 'date-fns/locale'
import { InfoTooltip } from '../../InfoTooltip'
import { formatNumber } from '../../../utils/format'

interface SeasonalAnalysisChartProps {
  puzzles: Puzzle[]
}

export function SeasonalAnalysisChart({ puzzles }: SeasonalAnalysisChartProps) {
  const sessions = puzzles.flatMap(p => p.sessions || [])
  
  // Vytvoříme mapu pro počítání skládání podle měsíců a let
  const monthlyData = sessions.reduce((acc, session) => {
    const date = new Date(session.start_date)
    const month = date.getMonth()
    const year = getYear(date)
    
    if (!acc[month]) {
      acc[month] = { years: new Set(), count: 0 }
    }
    
    acc[month].years.add(year)
    acc[month].count++
    
    return acc
  }, {} as Record<number, { years: Set<number>; count: number }>)

  // Vypočítáme průměr na rok pro každý měsíc
  const data = Array.from({ length: 12 }, (_, month) => {
    const monthStats = monthlyData[month] || { years: new Set(), count: 0 }
    const yearsCount = monthStats.years.size || 1 // Předejít dělení nulou
    
    return {
      name: format(new Date(2024, month, 1), 'LLLL', { locale: cs }),
      average: Math.round((monthStats.count / yearsCount) * 10) / 10,
      totalCount: monthStats.count,
      yearsCount
    }
  })

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <InfoTooltip text="Graf zobrazuje průměrný počet složených puzzlí v jednotlivých měsících roku. Pro každý měsíc je zobrazen průměrný počet složených puzzlí za rok. Například pokud bylo v lednu složeno celkem 12 puzzlí během 3 let, průměr je 4 puzzle za leden. Tento graf pomáhá identifikovat, ve kterých měsících roku se typicky skládá nejvíce puzzlí." />
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name"
              tick={{ 
                angle: -45,
                textAnchor: 'end',
                dominantBaseline: 'auto',
                fontSize: 12
              }}
              height={60}
              interval={0}
            />
            <YAxis />
            <Tooltip
              formatter={(value: number) => [formatNumber(value, 1), 'Průměrně puzzlí za měsíc']}
              labelFormatter={(label: string) => {
                const item = data.find(d => d.name === label)
                return `${label}
Celkem: ${formatNumber(item?.totalCount || 0)} puzzlí
Počet let: ${item?.yearsCount || 0}`
              }}
            />
            <Bar dataKey="average" fill="#6366f1" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}