import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { Puzzle } from '../../../lib/types'
import { InfoTooltip } from '../../InfoTooltip'
import { formatNumber, formatPercent } from '../../../utils/format'

interface CollaborationManufacturerStatsChartProps {
  puzzles: Puzzle[]
}

export function CollaborationManufacturerStatsChart({ puzzles }: CollaborationManufacturerStatsChartProps) {
  const data = Object.entries(
    puzzles
      .filter(p => p.is_collaboration)
      .reduce((acc, puzzle) => {
        if (!acc[puzzle.manufacturer]) {
          acc[puzzle.manufacturer] = {
            total: 0,
            withVideo: 0,
            avgViews: 0,
            totalViews: 0,
            videoCount: 0
          }
        }
        acc[puzzle.manufacturer].total++
        if (puzzle.youtube_url) {
          acc[puzzle.manufacturer].withVideo++
        }
        return acc
      }, {} as Record<string, { 
        total: number
        withVideo: number
        avgViews: number
        totalViews: number
        videoCount: number 
      }>)
  )
    .map(([name, stats]) => ({
      name,
      total: stats.total,
      withVideo: stats.withVideo,
      completionRate: Math.round((stats.withVideo / stats.total) * 100)
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10)

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <InfoTooltip text="Graf zobrazuje statistiky spoluprací podle výrobců. Pro každého výrobce je zobrazen celkový počet puzzlí ze spolupráce a počet puzzlí s publikovaným videem." />
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 120, right: 30, top: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis
              dataKey="name"
              type="category"
              width={120}
              interval={0}
              style={{ fill: '#6B7280', fontSize: '12px' }}
            />
            <Tooltip
              formatter={(value: number, name: string) => [
                formatNumber(value),
                name === 'total' ? 'Celkem puzzlí' : 'Publikovaná videa'
              ]}
              labelFormatter={(label: string) => {
                const item = data.find(d => d.name === label)
                if (!item) return label
                return `${item.name}\n• Celkem: ${formatNumber(item.total)} puzzlí\n• Publikováno: ${formatNumber(item.withVideo)} videí (${formatPercent(item.withVideo / item.total)})`
              }}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #ccc',
                borderRadius: '4px',
                padding: '8px 12px',
                whiteSpace: 'pre-wrap'
              }}
            />
            <Bar dataKey="total" name="Celkem" fill="#6366f1" />
            <Bar dataKey="withVideo" name="S videem" fill="#8b5cf6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}