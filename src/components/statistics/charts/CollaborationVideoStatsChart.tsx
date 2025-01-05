import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import type { Puzzle } from '../../../lib/types'
import { InfoTooltip } from '../../InfoTooltip'
import { formatNumber, formatPercent } from '../../../utils/format'
import { getVideoIdFromUrl, getVideoDetails } from '../../../lib/youtube'
import { useState, useEffect } from 'react'

interface CollaborationVideoStatsChartProps {
  puzzles: Puzzle[]
}

export function CollaborationVideoStatsChart({ puzzles }: CollaborationVideoStatsChartProps) {
  const [videoStats, setVideoStats] = useState<Record<string, {
    viewCount: number
    likeCount: number
    commentCount: number
  }>>({})

  useEffect(() => {
    const loadVideoStats = async () => {
      const stats: Record<string, any> = {}
      
      for (const puzzle of puzzles) {
        if (puzzle.youtube_url) {
          const videoId = getVideoIdFromUrl(puzzle.youtube_url)
          if (videoId) {
            const details = await getVideoDetails(videoId)
            if (details) {
              stats[videoId] = {
                viewCount: details.viewCount,
                likeCount: details.likeCount,
                commentCount: details.commentCount
              }
            }
          }
        }
      }
      
      setVideoStats(stats)
    }

    loadVideoStats()
  }, [puzzles])

  const data = puzzles
    .filter(p => p.youtube_url && p.is_collaboration)
    .map(puzzle => {
      const videoId = getVideoIdFromUrl(puzzle.youtube_url!)
      const stats = videoId ? videoStats[videoId] : null
      
      return {
        name: puzzle.name,
        views: stats?.viewCount || 0,
        likes: stats?.likeCount || 0,
        comments: stats?.commentCount || 0
      }
    })
    .sort((a, b) => b.views - a.views)
    .slice(0, 10)

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <InfoTooltip text="Graf zobrazuje statistiky videí ze spolupráce. Pro každé video je zobrazen počet zhlédnutí, lajků a komentářů. Zobrazeno je top 10 videí podle počtu zhlédnutí." />
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 80, right: 30, top: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              type="number"
              label={{ 
                value: 'Počet interakcí', 
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
              style={{ fill: '#6B7280', fontSize: '12px' }}
              tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 15)}...` : value}
            />
            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{ paddingBottom: '20px', fontSize: '12px' }}
              formatter={(value) => {
                switch(value) {
                  case 'views': return 'Zhlédnutí'
                  case 'likes': return 'Lajky'
                  case 'comments': return 'Komentáře'
                  default: return value
                }
              }}
            />
            <Tooltip
              formatter={(value: number, name: string) => [
                formatNumber(value),
                name === 'views' ? 'Zhlédnutí' :
                name === 'likes' ? 'Lajků' :
                name === 'comments' ? 'Komentářů' : name
              ]}
              labelFormatter={(label: string) => {
                const item = data.find(d => d.name === label)
                if (!item) return label
                return `${item.name}
• Zhlédnutí: ${formatNumber(item.views)}
• Lajků: ${formatNumber(item.likes)}
• Komentářů: ${formatNumber(item.comments)}`
              }}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #ccc',
                borderRadius: '4px',
                padding: '8px 12px',
                whiteSpace: 'pre-wrap'
              }}
            />
            <Bar 
              dataKey="views" 
              name="Zhlédnutí" 
              fill="#6366f1" 
            />
            <Bar 
              dataKey="likes" 
              name="Lajky" 
              fill="#8b5cf6" 
            />
            <Bar 
              dataKey="comments" 
              name="Komentáře" 
              fill="#a855f7" 
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}