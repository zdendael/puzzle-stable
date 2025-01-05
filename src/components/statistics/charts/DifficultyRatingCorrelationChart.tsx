import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { Puzzle } from '../../../lib/types'
import { InfoTooltip } from '../../InfoTooltip'
import { useNavigate } from 'react-router-dom'
import { formatNumber } from '../../../utils/format'

interface DifficultyRatingCorrelationChartProps {
  puzzles: Puzzle[]
}

export function DifficultyRatingCorrelationChart({ puzzles }: DifficultyRatingCorrelationChartProps) {
  const navigate = useNavigate()
  
  const data = ['easy', 'medium', 'hard'].map(difficulty => {
    const puzzlesWithDifficulty = puzzles.filter(p => 
      p.difficulty === difficulty && p.rating
    )
    
    if (puzzlesWithDifficulty.length === 0) return null

    const averageRating = Math.round(
      puzzlesWithDifficulty.reduce((sum, p) => sum + (p.rating || 0), 0) / 
      puzzlesWithDifficulty.length * 10
    ) / 10

    return {
      name: difficulty === 'easy' ? 'Snadné' :
            difficulty === 'medium' ? 'Střední' : 'Těžké',
      value: averageRating,
      count: puzzlesWithDifficulty.length,
      difficulty
    }
  }).filter(Boolean)

  const handleClick = (difficulty: string) => {
    navigate('/', { state: { difficulty, rating: 'any' } })
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <InfoTooltip text="Graf ukazuje vztah mezi obtížností puzzle a průměrným hodnocením. Pro každou úroveň obtížnosti (snadná, střední, těžká) je zobrazeno průměrné hodnocení puzzlí v této kategorii. Můžete tak vidět, zda máte tendenci lépe hodnotit jednodušší nebo složitější puzzle." />
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name"
              onClick={(data) => data && handleClick(data.difficulty)}
              style={{ cursor: 'pointer' }}
            />
            <YAxis domain={[0, 5]} />
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