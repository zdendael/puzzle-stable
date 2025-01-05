import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Puzzle } from '../../lib/types'
import { SpendingTimelineChart } from './charts/SpendingTimelineChart'
import { PricePerPieceChart } from './charts/PricePerPieceChart'
import { MonthlySpendingChart } from './charts/MonthlySpendingChart'
import { SourcePriceComparisonChart } from './charts/SourcePriceComparisonChart'
import { InfoTooltip } from '../InfoTooltip'
import { formatNumber } from '../../utils/format'

interface FinancialOverviewProps {
  puzzles: Puzzle[]
}

export function FinancialOverview({ puzzles }: FinancialOverviewProps) {
  const navigate = useNavigate()
  
  const stats = useMemo(() => {
    const ownPurchases = puzzles.filter(p => p.is_own_purchase)
    const totalSpent = ownPurchases.reduce((sum, p) => sum + p.price, 0)
    const totalPieces = ownPurchases.reduce((sum, p) => sum + p.pieces, 0)
    const averagePrice = Math.round(totalSpent / ownPurchases.length)
    const averagePricePerPiece = Math.round((totalSpent / totalPieces) * 100) / 100

    const mostExpensive = ownPurchases.reduce((max, p) => p.price > max.price ? p : max, ownPurchases[0])
    const cheapest = ownPurchases.reduce((min, p) => p.price < min.price ? p : min, ownPurchases[0])

    return [
      { 
        label: 'Celkové výdaje', 
        value: `${formatNumber(totalSpent)} Kč`,
        tooltip: 'Celková částka vynaložená na nákup puzzlí. Zahrnuje pouze vlastní nákupy, ne dárky nebo puzzle ze spolupráce.',
        onClick: () => navigate('/', { state: { isOwnPurchase: true } })
      },
      { 
        label: 'Průměrná cena', 
        value: `${formatNumber(averagePrice)} Kč`,
        tooltip: 'Průměrná cena jednoho puzzle. Vypočítáno jako celkové výdaje děleno počtem zakoupených puzzlí.'
      },
      { 
        label: 'Cena za dílek', 
        value: `${formatNumber(averagePricePerPiece, 2)} Kč`,
        tooltip: 'Průměrná cena za jeden dílek. Vypočítáno jako celkové výdaje děleno celkovým počtem dílků ze všech zakoupených puzzlí.'
      },
      { 
        label: 'Nejdražší puzzle', 
        value: `${formatNumber(mostExpensive?.price)} Kč`,
        onClick: () => navigate('/', { state: { searchTerm: mostExpensive?.name } }),
        title: mostExpensive?.name,
        tooltip: 'Puzzle s nejvyšší pořizovací cenou. Kliknutím zobrazíte detail puzzle.'
      },
      { 
        label: 'Nejlevnější puzzle', 
        value: `${formatNumber(cheapest?.price)} Kč`,
        onClick: () => navigate('/', { state: { searchTerm: cheapest?.name } }),
        title: cheapest?.name,
        tooltip: 'Puzzle s nejnižší pořizovací cenou. Kliknutím zobrazíte detail puzzle.'
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
            title={stat.title}
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
            Celkové výdaje v čase
          </h3>
          <SpendingTimelineChart puzzles={puzzles} />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Průměrná cena za dílek podle výrobce
          </h3>
          <PricePerPieceChart puzzles={puzzles} />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Měsíční výdaje
          </h3>
          <MonthlySpendingChart puzzles={puzzles} />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 lg:col-span-2">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Porovnání cen mezi zdroji
          </h3>
          <SourcePriceComparisonChart puzzles={puzzles} />
        </div>
      </div>
    </div>
  )
}