import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Puzzle } from '../../lib/types'
import { InfoTooltip } from '../InfoTooltip'
import { formatNumber, formatPercent, formatDuration } from '../../utils/format'
import { CollaborationTimelineChart } from './charts/CollaborationTimelineChart'
import { CollaborationSourcesChart } from './charts/CollaborationSourcesChart'
import { CollaborationTimeToVideoChart } from './charts/CollaborationTimeToVideoChart'
import { CollaborationVideoStatsChart } from './charts/CollaborationVideoStatsChart'
import { CollaborationManufacturerStatsChart } from './charts/CollaborationManufacturerStatsChart'
import { CollaborationMonthlyStatsChart } from './charts/CollaborationMonthlyStatsChart'

interface CollaborationOverviewProps {
  puzzles: Puzzle[]
}

export function CollaborationOverview({ puzzles }: CollaborationOverviewProps) {
  const navigate = useNavigate()
  
  const stats = useMemo(() => {
    // Počet unikátních spoluprací (podle zdrojů)
    const collaborationSources = new Set(
      puzzles
        .filter(p => p.is_collaboration && p.source)
        .map(p => p.source!.id)
    )
    const totalCollaborations = collaborationSources.size

    // Počet puzzlí ze spoluprací
    const collaborationPuzzles = puzzles.filter(p => p.is_collaboration)
    const totalPuzzles = collaborationPuzzles.length
    const publishedVideos = collaborationPuzzles.filter(p => p.youtube_url).length
    const unpublishedVideos = totalPuzzles - publishedVideos
    
    // Průměrná doba od získání po publikaci videa
    const timesToPublication = collaborationPuzzles
      .filter(p => p.youtube_url)
      .map(p => {
        if (!p.acquisition_date) return null
        const acquisitionDate = new Date(p.acquisition_date)
        const publishDate = new Date() // TODO: Získat skutečné datum publikace z YouTube API
        return Math.floor((publishDate.getTime() - acquisitionDate.getTime()) / (1000 * 60 * 60 * 24))
      })
      .filter(Boolean) as number[]
    
    const avgTimeToPublication = timesToPublication.length > 0
      ? Math.round(timesToPublication.reduce((a, b) => a + b, 0) / timesToPublication.length)
      : 0

    return [
      { 
        label: 'Celkem spoluprací', 
        value: formatNumber(collaborationSources.size),
        tooltip: 'Celkový počet aktivních spoluprací s e-shopy a firmami.'
      },
      { 
        label: 'Počet puzzlí', 
        value: formatNumber(totalPuzzles),
        tooltip: 'Celkový počet puzzlí získaných v rámci všech spoluprací.'
      },
      { 
        label: 'Publikovaná videa', 
        value: `${formatNumber(publishedVideos)} (${formatPercent(publishedVideos / totalPuzzles)})`,
        tooltip: 'Počet puzzlí ze spolupráce, ke kterým bylo publikováno video.'
      },
      { 
        label: 'Čekající na video', 
        value: formatNumber(unpublishedVideos),
        tooltip: 'Počet puzzlí ze spolupráce, ke kterým zatím nebylo publikováno video.'
      },
      { 
        label: 'Průměrná doba do publikace', 
        value: `${formatNumber(avgTimeToPublication)} dní`,
        tooltip: 'Průměrná doba od získání puzzle do publikace videa.'
      }
    ]
  }, [puzzles])

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4"
          >
            <div className="flex items-center justify-between mb-1">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {stat.label}
              </div>
              <InfoTooltip text={stat.tooltip} />
            </div>
            <div className="text-2xl font-semibold text-gray-900 dark:text-white">
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Vývoj spoluprací v čase
          </h3>
          <CollaborationTimelineChart puzzles={puzzles} />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Spolupráce podle zdrojů
          </h3>
          <CollaborationSourcesChart puzzles={puzzles} />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Doba od získání po publikaci
          </h3>
          <CollaborationTimeToVideoChart puzzles={puzzles} />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Statistiky videí
          </h3>
          <CollaborationVideoStatsChart puzzles={puzzles} />
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Měsíční statistiky
        </h3>
        <CollaborationMonthlyStatsChart puzzles={puzzles} />
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Statistiky podle výrobců
        </h3>
        <CollaborationManufacturerStatsChart puzzles={puzzles} />
      </div>
    </div>
  )
}