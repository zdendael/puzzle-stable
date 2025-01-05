import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Puzzle } from '../../lib/types'
import { MonthlyCompletionsChart } from './charts/MonthlyCompletionsChart'
import { DifficultyTrendsChart } from './charts/DifficultyTrendsChart'
import { PiecesTimeChart } from './charts/PiecesTimeChart'
import { CompletionsByDayChart } from './charts/CompletionsByDayChart'
import { CompletionTimeByManufacturerChart } from './charts/CompletionTimeByManufacturerChart'
import { CompletionTimeDistributionChart } from './charts/CompletionTimeDistributionChart'
import { SeasonalAnalysisChart } from './charts/SeasonalAnalysisChart'
import { FastestSessionsTable } from './tables/FastestSessionsTable'
import { SessionsHeatmap } from './charts/SessionsHeatmap'
import { InfoTooltip } from '../InfoTooltip'
import { formatNumber, formatDuration } from '../../utils/format'

interface SessionsOverviewProps {
  puzzles: Puzzle[]
}

export function SessionsOverview({ puzzles }: SessionsOverviewProps) {
  const navigate = useNavigate()
  
  const stats = useMemo(() => {
    const allSessions = puzzles.flatMap(p => p.sessions || [])
    const totalTime = allSessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0)
    const averageTime = allSessions.length > 0 ? Math.round(totalTime / allSessions.length) : 0
    const maxTime = Math.max(...allSessions.map(s => s.duration_minutes || 0))
    const minTime = Math.min(...allSessions.filter(s => s.duration_minutes).map(s => s.duration_minutes || 0))

    return [
      { 
        label: 'Počet skládání', 
        value: formatNumber(allSessions.length),
        tooltip: 'Celkový počet dokončených skládání. Zahrnuje i opakovaná skládání stejného puzzle.',
        onClick: () => navigate('/sessions')
      },
      { 
        label: 'Průměrná doba', 
        value: formatDuration(averageTime),
        tooltip: 'Průměrná doba jednoho skládání. Vypočítáno jako celkový čas děleno počtem dokončených skládání.'
      },
      { 
        label: 'Celkový čas', 
        value: formatDuration(totalTime),
        tooltip: 'Celkový čas strávený skládáním všech puzzlí. Součet trvání všech dokončených skládání.'
      },
      { 
        label: 'Nejdelší skládání', 
        value: formatDuration(maxTime),
        tooltip: 'Doba nejdelšího dokončeného skládání. Zobrazuje nejdelší čas strávený skládáním jednoho puzzle.'
      },
      { 
        label: 'Nejkratší skládání', 
        value: formatDuration(minTime),
        tooltip: 'Doba nejkratšího dokončeného skládání. Zobrazuje nejrychlejší čas složení jednoho puzzle.'
      }
    ]
  }, [puzzles, navigate])

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 ${
              stat.onClick ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700' : ''
            }`}
            onClick={stat.onClick}
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
            Doba skládání podle počtu dílků
          </h3>
          <PiecesTimeChart puzzles={puzzles} />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Dokončená puzzle podle dnů v týdnu
          </h3>
          <CompletionsByDayChart puzzles={puzzles} />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Průměrná doba podle výrobce
          </h3>
          <CompletionTimeByManufacturerChart puzzles={puzzles} />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Rozdělení podle doby skládání
          </h3>
          <CompletionTimeDistributionChart puzzles={puzzles} />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Počet složených puzzlí za měsíc
          </h3>
          <MonthlyCompletionsChart puzzles={puzzles} />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Trendy v obtížnosti
          </h3>
          <DifficultyTrendsChart puzzles={puzzles} />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Sezónní analýza skládání
          </h3>
          <SeasonalAnalysisChart puzzles={puzzles} />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Nejrychlejší skládání
          </h3>
          <FastestSessionsTable puzzles={puzzles} />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 lg:col-span-2">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Heatmapa skládání
          </h3>
          <SessionsHeatmap puzzles={puzzles} />
        </div>

      </div>
    </div>
  )
}