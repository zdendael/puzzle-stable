import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { Puzzle } from '../../../lib/types'
import { InfoTooltip } from '../../InfoTooltip'
import { useNavigate } from 'react-router-dom'
import { formatNumber } from '../../../utils/format'

interface CompletionsByDayChartProps {
  puzzles: Puzzle[]
}

export function CompletionsByDayChart({ puzzles }: CompletionsByDayChartProps) {
  const navigate = useNavigate()
  
  const dayNames = ['pondělí', 'úterý', 'středa', 'čtvrtek', 'pátek', 'sobota', 'neděle']
  
  // Získáme všechny sessions ze všech puzzlí
  const allSessions = puzzles
    .filter(p => p.sessions && p.sessions.length > 0)
    .flatMap(p => p.sessions!)
    .filter(s => s.duration_minutes) // Pouze dokončená skládání
  
  const data = dayNames.map((name, index) => {
    // Pro každý den spočítáme počet dokončených skládání
    const sessions = allSessions.filter(s => 
      // Převedeme index dne (0 = pondělí) na JavaScript getDay() (0 = neděle)
      // Převedeme JavaScript getDay() (0 = neděle) na index pole (0 = pondělí)
      (new Date(s.start_date).getDay() + 6) % 7 === index
    )
    
    return {
      name,
      value: sessions.length,
      dayIndex: (index + 1) % 7 // Převedeme index na JavaScript getDay()
    }
  })

  const handleClick = (dayIndex: number) => {
    navigate('/sessions', { 
      state: { 
        dayOfWeek: dayIndex
      } 
    })
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <InfoTooltip text="Graf zobrazuje počet dokončených puzzlí podle dnů v týdnu za celou dobu existence sbírky. Můžete tak vidět, ve které dny nejčastěji dokončujete puzzle. Data zahrnují všechna dokončená skládání od prvního až po poslední." />
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name"
              onClick={(data) => data && handleClick(data.dayIndex)}
              style={{ cursor: 'pointer' }}
            />
            <YAxis />
            <Tooltip
              formatter={(value: number) => [formatNumber(value), 'Dokončených puzzlí']}
              labelFormatter={(label: string) => {
                const item = data.find(d => d.name === label)
                return item ? `${item.name} (${formatNumber(item.value)} dokončení)` : label
              }}
            />
            <Bar dataKey="value" fill="#6366f1" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}