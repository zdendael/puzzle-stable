import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Puzzle } from '../../lib/types'
import { ManufacturersWorldMap } from './charts/ManufacturersWorldMap'
import { InfoTooltip } from '../InfoTooltip'
import { formatNumber, formatPercent } from '../../utils/format'
import { COUNTRIES } from '../../lib/countries'

interface ManufacturersMapOverviewProps {
  puzzles: Puzzle[]
}

export function ManufacturersMapOverview({ puzzles }: ManufacturersMapOverviewProps) {
  const navigate = useNavigate()
  
  const stats = useMemo(() => {
    // Spočítáme statistiky podle zemí
    const countryStats = puzzles.reduce((acc, puzzle) => {
      const manufacturer = puzzle.manufacturer
      const country = COUNTRIES.find(c => 
        c.code === puzzle.manufacturerCountryCode
      )
      
      if (country) {
        if (!acc[country.code]) {
          acc[country.code] = {
            name: country.name,
            flag: country.flag,
            count: 0,
            manufacturers: new Set()
          }
        }
        acc[country.code].count++
        acc[country.code].manufacturers.add(manufacturer)
      }
      return acc
    }, {} as Record<string, { 
      name: string
      flag: string
      count: number
      manufacturers: Set<string>
    }>)

    // Seřadíme země podle počtu puzzlí
    const sortedCountries = Object.entries(countryStats)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5)
      .map(([code, stats]) => ({
        code,
        name: stats.name,
        flag: stats.flag,
        count: stats.count,
        manufacturerCount: stats.manufacturers.size,
        percentage: stats.count / puzzles.length
      }))

    return sortedCountries
  }, [puzzles])

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.code}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
            onClick={() => navigate('/', { state: { countryCode: stat.code } })}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <span className="text-xl">{stat.flag}</span>
                {stat.name}
              </div>
              <InfoTooltip text={`${stat.manufacturerCount} výrobců z ${stat.name}`} />
            </div>
            <div className="text-2xl font-semibold text-gray-900 dark:text-white">
              {formatNumber(stat.count)} ({formatPercent(stat.percentage)})
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Interaktivní mapa zemí výrobců
          </h3>
          <InfoTooltip text="Mapa zobrazuje země původu výrobců vašich puzzlí. Čím tmavší barva, tím více puzzlí od výrobců z dané země máte ve sbírce. Po najetí myší na zemi se zobrazí detailní informace o počtu puzzlí a výrobcích z této země." />
        </div>
        <ManufacturersWorldMap puzzles={puzzles} />
      </div>
      <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
        Tip: Mapu můžete přiblížit kolečkem myši a posouvat tažením. Kliknutím na zemi zobrazíte všechna puzzle od výrobců z dané země.
      </div>
    </div>
  )
}