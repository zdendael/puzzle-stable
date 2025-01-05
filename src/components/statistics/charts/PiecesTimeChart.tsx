import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { Puzzle } from '../../../lib/types'
import { InfoTooltip } from '../../InfoTooltip'
import { useNavigate } from 'react-router-dom'
import { formatNumber } from '../../../utils/format'

interface PiecesTimeChartProps {
  puzzles: Puzzle[]
}

export function PiecesTimeChart({ puzzles }: PiecesTimeChartProps) {
  const navigate = useNavigate()
  
  const puzzlesWithSessions = puzzles.filter(puzzle => 
    puzzle.sessions?.some(session => session.duration_minutes)
  )

  const groupedByPieces = puzzlesWithSessions.reduce((acc, puzzle) => {
    const pieces = puzzle.pieces
    if (!acc[pieces]) {
      acc[pieces] = {
        sessions: [],
        manufacturers: new Map()
      }
    }
    
    // Přidáme všechny dokončené sessions včetně informací o výrobci
    puzzle.sessions?.forEach(session => {
      if (session.duration_minutes) {
        acc[pieces].sessions.push({
          duration: session.duration_minutes,
          manufacturer: puzzle.manufacturer
        })
        
        const currentCount = acc[pieces].manufacturers.get(puzzle.manufacturer) || 0
        acc[pieces].manufacturers.set(puzzle.manufacturer, currentCount + 1)
      }
    })
    
    return acc
  }, {} as Record<number, { 
    sessions: Array<{ duration: number; manufacturer: string }>,
    manufacturers: Map<string, number>
  }>)

  const data = Object.entries(groupedByPieces)
    .filter(([_, stats]) => stats.sessions.length > 0)
    .map(([pieces, stats]) => {
      const totalTime = stats.sessions.reduce((sum, s) => sum + s.duration, 0)
      const totalPieces = parseInt(pieces) * stats.sessions.length
      const timePerPiece = totalTime / totalPieces

      // Získáme top 3 výrobce podle počtu skládání
      const topManufacturers = Array.from(stats.manufacturers.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([name, count]) => ({ name, count }))

      return {
        pieces: parseInt(pieces),
        value: Math.round(timePerPiece * 1000) / 1000,
        sessionCount: stats.sessions.length,
        topManufacturers
      }
    })
    .sort((a, b) => a.pieces - b.pieces)

  const handleClick = (pieces: number) => {
    navigate('/sessions', { 
      state: { 
        pieces: [pieces]
      } 
    })
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <InfoTooltip text="Graf zobrazuje průměrnou dobu potřebnou k poskládání jednoho dílku pro různé velikosti puzzlí. Pro každou velikost je spočítán průměr ze všech dokončených skládání. Čím nižší hodnota, tím rychlejší tempo skládání. Po najetí myší na sloupec uvidíte detailní statistiky včetně počtu skládání a nejčastějších výrobců pro danou velikost." />
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ left: 20, right: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="pieces"
              tickFormatter={(value) => `${formatNumber(value)}`}
              label={{ 
                value: 'Počet dílků', 
                position: 'insideBottom',
                offset: -5,
                style: { fill: '#6B7280' }
              }}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={60}
              onClick={(data) => data && handleClick(data.pieces)}
              style={{ cursor: 'pointer' }}
            />
            <YAxis 
              tickFormatter={(value) => formatNumber(value, 2)}
              label={{ 
                value: 'Minut na dílek', 
                angle: -90, 
                position: 'insideLeft',
                offset: -5,
                dy: 50,
                style: { fill: '#6B7280' }
              }}
            />
            <Tooltip
              formatter={(value: number) => [
                `${formatNumber(value, 3)} min/dílek (${formatNumber(value * 60, 1)} s/dílek)`,
                'Průměrný čas'
              ]}
              labelFormatter={(label: string) => {
                const item = data.find(d => d.pieces.toString() === label)
                if (!item) return label
                
                const minutesPerPiece = formatNumber(item.value, 3)
                const secondsPerPiece = formatNumber(item.value * 60, 1)
                
                const timeText = `${minutesPerPiece} min/dílek (${secondsPerPiece} s/dílek)`
                
                const manufacturersText = item.topManufacturers.length > 0
                  ? '\n\nTOP 3 výrobci:\n' + item.topManufacturers
                      .map(m => `• ${m.name} (${m.count} ${m.count === 1 ? 'skládání' : m.count >= 2 && m.count <= 4 ? 'skládání' : 'skládání'})`)
                      .join('\n')
                  : '\n\nŽádní výrobci'
                
                return `${formatNumber(item.pieces)} dílků\nPrůměrný čas: ${timeText}\nPočet skládání: ${formatNumber(item.sessionCount)}${manufacturersText}`
              }}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #ccc',
                borderRadius: '4px',
                padding: '12px',
                whiteSpace: 'pre-wrap'
              }}
            />
            <Bar dataKey="value" fill="#6366f1" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}