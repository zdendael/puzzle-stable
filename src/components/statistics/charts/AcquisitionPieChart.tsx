import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import type { Puzzle } from '../../../lib/types'
import { InfoTooltip } from '../../InfoTooltip'
import { useNavigate } from 'react-router-dom'
import { formatNumber, formatPercent } from '../../../utils/format'

interface AcquisitionPieChartProps {
  puzzles: Puzzle[]
  showAll?: boolean
}

const COLORS = {
  gift: '#ec4899',      // pink-500
  collaboration: '#8b5cf6', // purple-500
  own: '#22c55e'        // green-500
}

export function AcquisitionPieChart({ puzzles, showAll = false }: AcquisitionPieChartProps) {
  const navigate = useNavigate()
  
  const activePuzzles = showAll ? puzzles : puzzles.filter(p => p.in_collection)
  const total = activePuzzles.length

  const data = [
    { 
      name: 'Dárek', 
      value: activePuzzles.filter(p => p.is_gift).length,
      type: 'gift'
    },
    { 
      name: 'Spolupráce', 
      value: activePuzzles.filter(p => p.is_collaboration).length,
      type: 'collaboration'
    },
    { 
      name: 'Vlastní nákup', 
      value: activePuzzles.filter(p => p.is_own_purchase).length,
      type: 'own'
    }
  ].filter(d => d.value > 0)

  const handleClick = (type: string) => {
    switch(type) {
      case 'gift':
        navigate('/', { state: { isGift: true } })
        break
      case 'collaboration':
        navigate('/', { state: { isCollaboration: true } })
        break
      case 'own':
        navigate('/', { state: { isOwnPurchase: true } })
        break
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <InfoTooltip text="Graf zobrazuje rozdělení puzzlí podle způsobu získání. Puzzle jsou rozděleny na dárky, spolupráce a vlastní nákupy. U každé kategorie je zobrazen počet puzzlí a procentuální zastoupení ve sbírce." />
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              key={`acquisition-pie-${activePuzzles.length}`}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              onClick={(data) => data && handleClick(data.type)}
              style={{ cursor: 'pointer' }}
              label={({ name, percent }) => `${name} (${formatPercent(percent)})`}
            >
              {data.map((entry) => (
                <Cell 
                  key={`${entry.type}-${entry.value}`}
                  fill={COLORS[entry.type as keyof typeof COLORS]} 
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => [formatNumber(value), 'Počet puzzlí']}
              labelFormatter={(name: string) => {
                const item = data.find(d => d.name === name)
                return item ? `${item.name} (${formatPercent(item.value / total)})` : name
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}