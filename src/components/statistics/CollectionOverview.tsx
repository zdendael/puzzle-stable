import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { InfoTooltip } from '../InfoTooltip'
import { CollectionToggle } from './CollectionToggle'
import { PiecesPieChart } from './charts/PiecesPieChart'
import { TopManufacturersChart } from './charts/TopManufacturersChart'
import { TopCategoriesChart } from './charts/TopCategoriesChart'
import { PuzzlesTimelineChart } from './charts/PuzzlesTimelineChart'
import { RatingDistributionChart } from './charts/RatingDistributionChart'
import { CompletionTimeChart } from './charts/CompletionTimeChart'
import { AcquisitionPieChart } from './charts/AcquisitionPieChart'
import { formatNumber, formatDuration, formatPercent } from '../../utils/format'
import type { Puzzle } from '../../lib/types'

interface CollectionOverviewProps {
  puzzles: Puzzle[]
  categories: any[]
  showAll: boolean
}

export function CollectionOverview({ puzzles, categories, showAll }: CollectionOverviewProps) {
  const navigate = useNavigate()
  
  const stats = useMemo(() => {
    const allPuzzles = puzzles.filter(p => !p.deleted_at)
    const activePuzzles = allPuzzles.filter(p => p.in_collection)
    const displayedPuzzles = showAll ? allPuzzles : activePuzzles
    const totalPieces = displayedPuzzles.reduce((sum, p) => sum + p.pieces, 0)
    const averagePieces = displayedPuzzles.length > 0 ? Math.round(totalPieces / displayedPuzzles.length) : 0

    return [
      { 
        label: 'Celkem puzzlí',
        value: formatNumber(allPuzzles.length),
        tooltip: 'Celkový počet všech puzzlí v databázi (bez smazaných).'
      },
      { 
        label: 'Ve sbírce', 
        value: formatNumber(activePuzzles.length),
        tooltip: 'Počet aktivních puzzlí ve sbírce.'
      },
      { 
        label: 'Vyřazeno', 
        value: formatNumber(allPuzzles.filter(p => !p.in_collection).length),
        tooltip: 'Počet vyřazených puzzlí (prodaných, darovaných apod.).',
        onClick: () => navigate('/', { state: { inCollection: false } })
      },
      { 
        label: 'Celkem dílků', 
        value: formatNumber(totalPieces),
        tooltip: showAll 
          ? 'Celkový součet dílků všech puzzlí (včetně vyřazených).'
          : 'Celkový součet dílků všech aktivních puzzlí ve sbírce.'
      },
      { 
        label: 'Průměrně dílků', 
        value: formatNumber(averagePieces),
        tooltip: showAll
          ? 'Průměrný počet dílků na jedno puzzle (včetně vyřazených).'
          : 'Průměrný počet dílků na jedno aktivní puzzle ve sbírce.'
      }
    ]
  }, [puzzles, navigate, showAll])

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
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
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 lg:col-span-2">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Vývoj sbírky v čase
          </h3>
          <PuzzlesTimelineChart puzzles={puzzles} showAll={showAll} />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Rozdělení podle počtu dílků
          </h3>
          <PiecesPieChart puzzles={puzzles} showAll={showAll} />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Rozdělení podle způsobu získání
          </h3>
          <AcquisitionPieChart puzzles={puzzles} showAll={showAll} />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Rozdělení hodnocení
          </h3>
          <RatingDistributionChart puzzles={puzzles} showAll={showAll} />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Doba skládání
          </h3>
          <CompletionTimeChart puzzles={puzzles} showAll={showAll} />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Top 10 výrobců
          </h3>
          <TopManufacturersChart puzzles={puzzles} showAll={showAll} />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Top 10 motivů
          </h3>
          <TopCategoriesChart puzzles={puzzles} categories={categories} showAll={showAll} />
        </div>
      </div>
    </div>
  )
}