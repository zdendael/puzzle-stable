import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import type { Puzzle } from '../../../lib/types'
import { InfoTooltip } from '../../InfoTooltip'
import { useNavigate } from 'react-router-dom'
import { formatNumber, formatPercent } from '../../../utils/format'

interface CollaborationSourcesChartProps {
  puzzles: Puzzle[]
}

export function CollaborationSourcesChart({ puzzles }: CollaborationSourcesChartProps) {
  const navigate = useNavigate()
  
  const data = Object.entries(
    puzzles
      .filter(p => p.is_collaboration && p.source)
      .reduce((acc, puzzle) => {
        const sourceName = puzzle.source!.name
        if (!acc[sourceName]) {
          acc[sourceName] = {
            total: 0,
            published: 0,
            sourceId: puzzle.source!.id
          }
        }
        acc[sourceName].total++
        if (puzzle.youtube_url) {
          acc[sourceName].published++
        }
        return acc
      }, {} as Record<string, { total: number; published: number; sourceId: number }>)
  )
    .map(([name, stats]) => ({
      name,
      total: stats.total,
      published: stats.published,
      sourceId: stats.sourceId
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10)

  const handleClick = (sourceId: number) => {
    navigate('/', { 
      state: { 
        sources: [sourceId],
        isCollaboration: true
      } 
    })
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <InfoTooltip text="Graf zobrazuje počet puzzlí ze spolupráce podle jednotlivých zdrojů. Tmavší část sloupce představuje puzzle s publikovaným videem." />
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 80, right: 30, top: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              type="number"
              label={{ 
                value: 'Počet puzzlí', 
                position: 'insideBottom', 
                offset: -5,
                style: { fill: '#6B7280' }
              }}
            />
            <YAxis
              dataKey="name"
              type="category"
              width={80}
              interval={0}
              onClick={(data) => data && handleClick(data.sourceId)}
              style={{ cursor: 'pointer', fill: '#6B7280', fontSize: '12px' }}
              tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 15)}...` : value}
            />
            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{ paddingBottom: '20px', fontSize: '12px' }}
              formatter={(value) => value === 'total' ? 'Celkem' : 'Publikovaná videa'}
            />
            <Tooltip
              formatter={(value: number, name: string) => [
                formatNumber(value),
                name === 'total' ? 'Celkem puzzlí' : 'S publikovaným videem'
              ]}
              labelFormatter={(label) => {
                const item = data.find(d => d.name === label)
                if (!item) return label
                return `${item.name}\n• Celkem: ${formatNumber(item.total)} puzzlí\n• Publikováno: ${formatNumber(item.published)} videí (${formatPercent(item.published / item.total)})`
              }}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #ccc',
                borderRadius: '4px',
                padding: '8px 12px',
                whiteSpace: 'pre-wrap'
              }}
            />
            <Bar dataKey="total" name="total" fill="#6366f1" stackId="a" />
            <Bar dataKey="published" name="published" fill="#8b5cf6" stackId="a" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}