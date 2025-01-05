import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps'
import * as Tooltip from '@radix-ui/react-tooltip'
import type { Puzzle } from '../../../lib/types'
import { COUNTRIES } from '../../../lib/countries'
import { formatNumber } from '../../../utils/format'

interface ManufacturersWorldMapProps {
  puzzles: Puzzle[]
}

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"

export function ManufacturersWorldMap({ puzzles }: ManufacturersWorldMapProps) {
  const navigate = useNavigate()
  const [position, setPosition] = useState({ coordinates: [20, 40], zoom: 1.3 })
  const [tooltipContent, setTooltipContent] = useState<{
    name: string
    flag: string
    count: number
    manufacturers: string[]
  } | null>(null)

  const countryData = useMemo(() => {
    const stats = puzzles.reduce((acc, puzzle) => {
      const manufacturer = puzzle.manufacturer
      const countryCode = COUNTRIES.find(c => 
        c.code === puzzle.manufacturerCountryCode
      )?.code
      
      if (!countryCode || !manufacturer) return acc
      
      if (!acc[countryCode]) {
        acc[countryCode] = {
          count: 0,
          manufacturers: new Set<string>()
        }
      }
      acc[countryCode].count++
      acc[countryCode].manufacturers.add(manufacturer)
      return acc
    }, {} as Record<string, { count: number; manufacturers: Set<string> }>)

    const maxCount = Math.max(...Object.values(stats).map(s => s.count))

    return Object.entries(stats).map(([code, data]) => {
      const country = COUNTRIES.find(c => c.code === code)
      if (!country) return null

      const intensity = data.count / maxCount
      const color = `rgba(99, 102, 241, ${Math.max(0.1, Math.min(0.9, 0.2 + intensity * 0.8))})`

      return {
        code,
        name: country.name,
        flag: country.flag,
        count: data.count,
        manufacturers: Array.from(data.manufacturers).sort((a, b) => a.localeCompare(b, 'cs')),
        color
      }
    }).filter(Boolean)
  }, [puzzles])

  const handleCountryClick = (code: string) => {
    navigate('/', { state: { countryCode: code } })
  }

  const handleMoveEnd = (position: { coordinates: [number, number]; zoom: number }) => {
    setPosition(position)
  }

  return (
    <div className="space-y-8">
      <Tooltip.Provider>
        <div className="h-[500px] bg-gray-50 dark:bg-gray-900/50 rounded-lg overflow-hidden">
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{
              scale: 100,
              center: [0, 40]
            }}
          >
            <ZoomableGroup
              zoom={position.zoom}
              center={position.coordinates as [number, number]}
              onMoveEnd={handleMoveEnd}
              minZoom={1}
              maxZoom={12}
            >
              <Geographies geography={geoUrl}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    const countryCode = COUNTRIES.find(c => 
                      c.code.toLowerCase() === geo.properties.iso_a2?.toLowerCase()
                    )?.code

                    const countryInfo = countryData.find(c => c?.code === countryCode)
                      
                    return (
                      <Tooltip.Root key={geo.rsmKey}>
                        <Tooltip.Trigger asChild>
                          <Geography
                            geography={geo}
                            onClick={() => countryInfo && handleCountryClick(countryInfo.code)}
                            onMouseEnter={() => countryInfo && setTooltipContent({
                              name: countryInfo.name,
                              flag: countryInfo.flag,
                              count: countryInfo.count,
                              manufacturers: countryInfo.manufacturers
                            })}
                            onMouseLeave={() => setTooltipContent(null)}
                            style={{
                              default: {
                                fill: countryInfo?.color || '#E5E7EB',
                                outline: 'none',
                                stroke: '#1F2937',
                                strokeWidth: 0.5
                              },
                              hover: {
                                fill: countryInfo ? '#4F46E5' : '#D1D5DB',
                                stroke: '#111827',
                                strokeWidth: 1,
                                cursor: countryInfo ? 'pointer' : 'default'
                              },
                              pressed: {
                                fill: countryInfo ? '#4338CA' : '#9CA3AF'
                              }
                            }}
                          />
                        </Tooltip.Trigger>
                        {tooltipContent && (
                          <Tooltip.Portal>
                            <Tooltip.Content
                              className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-w-xs z-[9999]"
                              sideOffset={5}
                            >
                              <div className="text-center">
                                <div className="text-lg mb-1">
                                  {tooltipContent.flag} {tooltipContent.name}
                                </div>
                                <div className="font-medium">
                                  {formatNumber(tooltipContent.count)} puzzlí
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {tooltipContent.manufacturers.length} výrobců
                                </div>
                                {tooltipContent.manufacturers.length > 0 && (
                                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                    {tooltipContent.manufacturers.join(', ')}
                                  </div>
                                )}
                              </div>
                              <Tooltip.Arrow className="fill-white dark:fill-gray-800" />
                            </Tooltip.Content>
                          </Tooltip.Portal>
                        )}
                      </Tooltip.Root>
                    )
                  })
                }
              </Geographies>
            </ZoomableGroup>
          </ComposableMap>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {countryData
            .sort((a, b) => b.count - a.count)
            .map(country => (
              <button
                key={country.code}
                onClick={() => handleCountryClick(country.code)}
                className="p-4 rounded-lg hover:opacity-90 transition-colors border border-gray-200 dark:border-gray-700"
                style={{ backgroundColor: country.color }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{country.flag}</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {country.name}
                  </span>
                </div>
                <div className="text-sm text-gray-900 dark:text-white opacity-90">
                  {formatNumber(country.count)} puzzlí
                </div>
                <div className="text-xs text-gray-900 dark:text-white opacity-75 mt-1">
                  {country.manufacturers.length} výrobců
                </div>
              </button>
            ))}
        </div>
      </Tooltip.Provider>
    </div>
  )
}