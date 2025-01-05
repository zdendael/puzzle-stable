import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Puzzle } from '../../lib/types'
import { AverageRatingByManufacturerChart } from './charts/AverageRatingByManufacturerChart'
import { TopRatedCategoriesChart } from './charts/TopRatedCategoriesChart'
import { DifficultyRatingCorrelationChart } from './charts/DifficultyRatingCorrelationChart'
import { TopTagsChart } from './charts/TopTagsChart'
import { InfoTooltip } from '../InfoTooltip'
import { formatNumber } from '../../utils/format'

interface RatingsOverviewProps {
  puzzles: Puzzle[]
  categories: any[]
  tags: any[]
}

export function RatingsOverview({ puzzles, categories, tags }: RatingsOverviewProps) {
  const navigate = useNavigate()
  
  const stats = useMemo(() => {
    const ratedPuzzles = puzzles.filter(p => p.rating)
    const totalRating = ratedPuzzles.reduce((sum, p) => sum + (p.rating || 0), 0)
    const averageRating = ratedPuzzles.length > 0 ? totalRating / ratedPuzzles.length : 0
    const fiveStars = ratedPuzzles.filter(p => p.rating === 5).length
    const fourStars = ratedPuzzles.filter(p => p.rating === 4).length
    const threeStars = ratedPuzzles.filter(p => p.rating === 3).length
    const twoStars = ratedPuzzles.filter(p => p.rating === 2).length
    const oneStar = ratedPuzzles.filter(p => p.rating === 1).length

    return [
      { 
        label: 'Hodnocených puzzlí', 
        value: `${ratedPuzzles.length} (${Math.round(ratedPuzzles.length / puzzles.length * 100)}\u00A0%)`,
        tooltip: 'Celkový počet puzzlí, kterým bylo přiděleno hodnocení (1-5 hvězdiček).',
        onClick: () => navigate('/', { state: { rating: 'any' } })
      },
      { 
        label: 'Průměrné hodnocení', 
        value: averageRating ? `${formatNumber(averageRating, 1)} ⭐` : 'N/A',
        tooltip: 'Průměrné hodnocení všech ohodnocených puzzlí. Vypočítáno jako průměr všech přidělených hodnocení.'
      },
      { 
        label: '5 hvězdiček', 
        value: `${fiveStars} (${Math.round(fiveStars / ratedPuzzles.length * 100)}\u00A0%)`,
        tooltip: 'Počet puzzlí s nejvyšším hodnocením (5 hvězdiček) a jejich procentuální podíl ze všech hodnocených puzzlí.',
        onClick: () => navigate('/', { state: { rating: 5 } })
      },
      { 
        label: '4 hvězdičky', 
        value: `${fourStars} (${Math.round(fourStars / ratedPuzzles.length * 100)}\u00A0%)`,
        tooltip: 'Počet puzzlí s hodnocením 4 hvězdičky a jejich procentuální podíl ze všech hodnocených puzzlí.',
        onClick: () => navigate('/', { state: { rating: 4 } })
      },
      { 
        label: '3 hvězdičky', 
        value: `${threeStars} (${Math.round(threeStars / ratedPuzzles.length * 100)}\u00A0%)`,
        tooltip: 'Počet puzzlí s hodnocením 3 hvězdičky a jejich procentuální podíl ze všech hodnocených puzzlí.',
        onClick: () => navigate('/', { state: { rating: 3 } })
      },
      { 
        label: '2 hvězdičky', 
        value: `${twoStars} (${Math.round(twoStars / ratedPuzzles.length * 100)}\u00A0%)`,
        tooltip: 'Počet puzzlí s hodnocením 2 hvězdičky a jejich procentuální podíl ze všech hodnocených puzzlí.',
        onClick: () => navigate('/', { state: { rating: 2 } })
      },
      { 
        label: '1 hvězdička', 
        value: `${oneStar} (${Math.round(oneStar / ratedPuzzles.length * 100)}\u00A0%)`,
        tooltip: 'Počet puzzlí s nejnižším hodnocením (1 hvězdička) a jejich procentuální podíl ze všech hodnocených puzzlí.',
        onClick: () => navigate('/', { state: { rating: 1 } })
      }
    ]
  }, [puzzles, navigate])

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        {/* První řádek - celkové statistiky */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats.slice(0, 2).map((stat) => (
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

        {/* Druhý řádek - hvězdičková hodnocení */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {stats.slice(2).reverse().map((stat) => (
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Průměrné hodnocení podle výrobce
          </h3>
          <AverageRatingByManufacturerChart puzzles={puzzles} />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Nejlépe hodnocené motivy
          </h3>
          <TopRatedCategoriesChart puzzles={puzzles} categories={categories} />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Korelace mezi obtížností a hodnocením
          </h3>
          <DifficultyRatingCorrelationChart puzzles={puzzles} />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Nejpoužívanější štítky
          </h3>
          <TopTagsChart puzzles={puzzles} tags={tags} />
        </div>
      </div>
    </div>
  )
}