import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { Puzzle } from '../../../lib/types'
import { format, startOfMonth, eachMonthOfInterval, isSameMonth, subMonths } from 'date-fns'
import { cs } from 'date-fns/locale'
import { useState } from 'react'
import { InfoTooltip } from '../../InfoTooltip'
import { useNavigate } from 'react-router-dom'
import { formatNumber } from '../../../utils/format'

interface MonthlyCompletionsChartProps {
  puzzles: Puzzle[]
}

export function MonthlyCompletionsChart({ puzzles }: MonthlyCompletionsChartProps) {
  const navigate = useNavigate()
  const [showAllMonths, setShowAllMonths] = useState(false)
  
  const sessions = puzzles.flatMap(p => p.sessions || [])
  const dates = sessions.map(s => new Date(s.start_date))
  const maxDate = startOfMonth(new Date(Math.max(...dates.map(d => d.getTime()))))
  
  const monthlyData = sessions.reduce((acc, session) => {
    const date = startOfMonth(new Date(session.start_date))
    const key = date.getTime()
    acc.set(key, (acc.get(key) || 0) + 1)
    return acc
  }, new Map<number, number>())
  
  const data = Array.from(monthlyData.entries())
    .map(([timestamp, count]) => ({
      date: new Date(timestamp),
      count
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime())
  
  const filteredData = showAllMonths 
    ? data
    : data.filter(d => d.date >= startOfMonth(subMonths(maxDate, 11)))

  const handleClick = (date: Date) => {
    navigate('/sessions', { 
      state: { 
        dateFrom: format(date, 'yyyy-MM-dd'),
        dateTo: format(new Date(date.getFullYear(), date.getMonth() + 1, 0), 'yyyy-MM-dd')
      } 
    })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setShowAllMonths(!showAllMonths)}
          className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
        >
          {showAllMonths ? 'Zobrazit posledních 12 měsíců' : 'Zobrazit celou historii'}
        </button>
        <InfoTooltip text="Graf zobrazuje počet složených puzzlí v jednotlivých měsících. Každý sloupec představuje jeden měsíc a jeho výška odpovídá počtu dokončených puzzlí v daném měsíci. Můžete tak sledovat svou aktivitu v čase a identifikovat období s nejvyšší nebo nejnižší aktivitou. Kliknutím na sloupec zobrazíte všechna skládání v daném měsíci." />
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={filteredData}
            margin={{ left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={(date) => format(date, 'MM/yyyy')}
              onClick={(data) => data && handleClick(data.date)}
              style={{ cursor: 'pointer' }}
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
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #ccc',
                borderRadius: '4px',
                padding: '8px'
              }}
              labelFormatter={(date) => format(date, 'LLLL yyyy', { locale: cs })}
              formatter={(value: number) => [formatNumber(value), 'Dokončených puzzlí']}
            />
            <Bar dataKey="count" fill="#6366f1" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}