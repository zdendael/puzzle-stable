import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import type { WishListItem } from '../../lib/types'
import { WishListPriorityChart } from './charts/WishListPriorityChart'
import { WishListManufacturersChart } from './charts/WishListManufacturersChart'
import { WishListCategoriesChart } from './charts/WishListCategoriesChart'
import { WishListPriceDistributionChart } from './charts/WishListPriceDistributionChart'
import { WishListSourcesChart } from './charts/WishListSourcesChart'
import { InfoTooltip } from '../InfoTooltip'
import { formatNumber } from '../../utils/format'

interface WishListOverviewProps {
  items: WishListItem[]
  categories: any[]
}

export function WishListOverview({ items, categories }: WishListOverviewProps) {
  const navigate = useNavigate()
  
  const stats = useMemo(() => {
    const activeItems = items.filter(i => !i.deleted_at)
    const totalItems = activeItems.length
    const inStock = activeItems.filter(i => i.in_stock).length
    const reserved = activeItems.filter(i => i.reservation !== undefined).length
    const totalValue = activeItems.reduce((sum, i) => sum + i.price, 0)
    const avgPrice = totalItems > 0 ? Math.round(totalValue / totalItems) : 0
    const highPriority = activeItems.filter(i => i.priority === 'high').length
    const mediumPriority = activeItems.filter(i => i.priority === 'medium').length
    const lowPriority = activeItems.filter(i => i.priority === 'low').length

    return [
      { 
        label: 'Celkem položek', 
        value: formatNumber(totalItems),
        tooltip: 'Celkový počet položek v nákupním seznamu.'
      },
      { 
        label: 'Skladem', 
        value: `${formatNumber(inStock)} (${totalItems ? Math.round(inStock / totalItems * 100) : 0} %)`,
        tooltip: 'Počet položek, které jsou aktuálně skladem.'
      },
      { 
        label: 'Rezervováno', 
        value: `${formatNumber(reserved)} (${totalItems ? Math.round(reserved / totalItems * 100) : 0} %)`,
        tooltip: 'Počet položek, které jsou rezervované.'
      },
      { 
        label: 'Celková hodnota', 
        value: `${formatNumber(totalValue)} Kč`,
        tooltip: 'Celková hodnota všech položek v nákupním seznamu.'
      },
      { 
        label: 'Průměrná cena', 
        value: `${formatNumber(avgPrice)} Kč`,
        tooltip: 'Průměrná cena jednoho puzzle v nákupním seznamu.'
      },
      { 
        label: 'Vysoká priorita', 
        value: formatNumber(highPriority),
        tooltip: 'Počet položek s vysokou prioritou.'
      },
      { 
        label: 'Střední priorita', 
        value: formatNumber(mediumPriority),
        tooltip: 'Počet položek se střední prioritou.'
      },
      { 
        label: 'Nízká priorita', 
        value: formatNumber(lowPriority),
        tooltip: 'Počet položek s nízkou prioritou.'
      }
    ]
  }, [items])

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
            Rozdělení podle priority
          </h3>
          <WishListPriorityChart items={items} />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Top 10 výrobců
          </h3>
          <WishListManufacturersChart items={items} />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Cenové rozložení
          </h3>
          <WishListPriceDistributionChart items={items} />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Rozdělení podle zdrojů
          </h3>
          <WishListSourcesChart items={items} />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 lg:col-span-2">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Top 10 motivů
          </h3>
          <WishListCategoriesChart items={items} categories={categories} />
        </div>
      </div>
    </div>
  )
}