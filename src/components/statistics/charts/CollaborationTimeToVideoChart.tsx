import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { Puzzle } from '../../../lib/types'
import { InfoTooltip } from '../../InfoTooltip'
import { formatNumber } from '../../../utils/format'
import { getVideoIdFromUrl, getVideoDetails } from '../../../lib/youtube'
import { useState, useEffect } from 'react'

interface CollaborationTimeToVideoChartProps {
  puzzles: Puzzle[]
}

export function CollaborationTimeToVideoChart({ puzzles }: CollaborationTimeToVideoChartProps) {
  const [videoStats, setVideoStats] = useState<Record<string, { publishedAt: Date }>>({})

  useEffect(() => {
    const loadVideoStats = async () => {
      const stats: Record<string, { publishedAt: Date }> = {}
      
      for (const puzzle of puzzles) {
        if (puzzle.youtube_url) {
          const videoId = getVideoIdFromUrl(puzzle.youtube_url)
          if (videoId) {
            const details = await getVideoDetails(videoId)
            if (details) {
              stats[videoId] = { publishedAt: details.publishedAt }
            }
          }
        }
      }
      
      setVideoStats(stats)
    }

    loadVideoStats()
  }, [puzzles])

  const timeRanges = [
    { min: 0, max: 7, label: 'Do týdne' },
    { min: 7, max: 14, label: '1-2 týdny' },
    { min: 14, max: 30, label: '2-4 týdny' },
    { min: 30, max: 60, label: '1-2 měsíce' },
    { min: 60, max: 90, label: '2-3 měsíce' },
    { min: 90, max: Infinity, label: 'Nad 3 měsíce' }
  ]

  const data = timeRanges.map(range => {
    const puzzlesInRange = puzzles.filter(puzzle => {
      if (!puzzle.is_collaboration || !puzzle.youtube_url || !puzzle.acquisition_date) return false
      
      const videoId = getVideoIdFromUrl(puzzle.youtube_url)
      if (!videoId || !videoStats[videoId]) return false
      
      const acquisitionDate = new Date(puzzle.acquisition_date)
      const publishDate = videoStats[videoId].publishedAt
      const days = Math.floor((publishDate.getTime() - acquisitionDate.getTime()) / (1000 * 60 * 60 * 24))
      
      return days >= range.min && days < range.max
    })

    return {
      name: range.label,
      value: puzzlesInRange.length
    }
  }).filter(d => d.value > 0)

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <InfoTooltip text="Graf zobrazuje, jak dlouho trvá od získání puzzle do publikace videa. Puzzle jsou rozděleny do kategorií podle doby čekání na video." />
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip
              formatter={(value: number) => [formatNumber(value), 'Počet puzzlí']}
            />
            <Bar dataKey="value" fill="#6366f1" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}