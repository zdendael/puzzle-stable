import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getPuzzles } from '../lib/api/puzzles'
import { getTags } from '../lib/api/tags'
import { getCategories } from '../lib/api/categories'
import { getManufacturers } from '../lib/api/manufacturers'
import { getSources } from '../lib/api/sources'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { ErrorMessage } from '../components/ErrorMessage'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { cs } from 'date-fns/locale'
import { DateFilter } from '../components/filters/DateFilter'
import { ManufacturerFilter } from '../components/filters/ManufacturerFilter'
import { FilterSection } from '../components/filters/FilterSection'
import { BasicFilters } from '../components/filters/BasicFilters'
import { SearchBar } from '../components/filters/SearchBar'
import { Zap } from 'lucide-react'
import { formatDate, formatShortDuration } from '../utils/format'
import { LoadingIndicator } from '../components/LoadingIndicator'

const ITEMS_PER_PAGE = 20

const initialFilters = {
  dateRange: { from: null as string | null, to: null as string | null },
  manufacturers: [] as string[],
  pieces: [] as number[]
}

export function SessionsPage() {
  const [filters, setFilters] = useState(initialFilters)
  const [searchTerm, setSearchTerm] = useState('')
  const [visibleItems, setVisibleItems] = useState(ITEMS_PER_PAGE)
  const navigate = useNavigate()

  const { data: puzzles = [], isLoading: isPuzzlesLoading, error: puzzlesError } = useQuery({
    queryKey: ['puzzles'],
    queryFn: getPuzzles
  })

  const { data: manufacturers = [] } = useQuery({
    queryKey: ['manufacturers'],
    queryFn: getManufacturers
  })

  // Získat všechny sessions ze všech puzzlí
  const allSessions = puzzles.flatMap(p => 
    (p.sessions || []).map(session => ({
      ...session,
      puzzle: {
        id: p.id,
        name: p.name,
        manufacturer: p.manufacturer,
        pieces: p.pieces
      },
      isFastest: session.duration_minutes === Math.min(...(p.sessions || [])
        .filter(s => s.duration_minutes)
        .map(s => s.duration_minutes))
    }))
  ).sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime())

  const handlePuzzleClick = (puzzleName: string) => {
    navigate('/', { state: { searchTerm: puzzleName } })
  }

  const handleResetFilters = () => {
    setFilters(initialFilters)
    setSearchTerm('')
  }

  const filteredSessions = allSessions.filter(session => {
    if (searchTerm && !session.puzzle.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }

    if (filters.dateRange.from && new Date(session.start_date) < new Date(filters.dateRange.from)) {
      return false
    }
    if (filters.dateRange.to && new Date(session.start_date) > new Date(filters.dateRange.to)) {
      return false
    }

    if (filters.manufacturers.length > 0 && !filters.manufacturers.includes(session.puzzle.manufacturer)) {
      return false
    }

    if (filters.pieces.length > 0 && !filters.pieces.includes(session.puzzle.pieces)) {
      return false
    }

    return true
  })

  const handleLoadMore = () => {
    setVisibleItems(prev => prev + ITEMS_PER_PAGE)
  }

  const visibleSessions = filteredSessions.slice(0, visibleItems)
  const hasMore = visibleItems < filteredSessions.length

  if (isPuzzlesLoading) return <LoadingSpinner />
  if (puzzlesError) return <ErrorMessage message="Nepodařilo se načíst data" />

  const hasActiveFilters = searchTerm || 
    filters.dateRange.from || 
    filters.dateRange.to || 
    filters.manufacturers.length > 0 || 
    filters.pieces.length > 0

  return (
    <div className="flex">
      <div className="w-80 bg-indigo-50 dark:bg-indigo-900/10 border-r border-indigo-100 dark:border-indigo-900/20 h-[calc(100vh-4rem)] sticky top-16">
        <div className="p-4 border-b border-indigo-100 dark:border-indigo-900/20">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-gray-900 dark:text-white">Filtry</h2>
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
              >
                Zrušit vše
              </button>
            )}
          </div>
        </div>

        <div className="p-4 space-y-6">
          <FilterSection title="Časové období">
            <DateFilter
              dateRange={filters.dateRange}
              onFilterChange={(range) =>
                setFilters({ ...filters, dateRange: range })
              }
            />
          </FilterSection>

          <FilterSection title="Výrobci">
            <ManufacturerFilter
              manufacturers={manufacturers}
              selectedManufacturers={filters.manufacturers}
              onFilterChange={(selected) =>
                setFilters({ ...filters, manufacturers: selected })
              }
            />
          </FilterSection>

          <FilterSection title="Počet dílků">
            <BasicFilters
              filters={filters}
              onFilterChange={setFilters}
            />
          </FilterSection>
        </div>
      </div>

      <div className="flex-1 px-6">
        <div className="mb-6 space-y-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Historie skládání</h1>
          </div>

          <SearchBar value={searchTerm} onChange={setSearchTerm} />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Puzzle
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Výrobce
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Počet dílků
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Datum
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Doba skládání
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {visibleSessions.map((session) => (
                <tr key={session.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap text-left">
                    <button
                      onClick={() => handlePuzzleClick(session.puzzle.name)}
                      className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                    >
                      {session.puzzle.name}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-left text-gray-900 dark:text-gray-300">
                    {session.puzzle.manufacturer}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-left text-gray-900 dark:text-gray-300">
                    {session.puzzle.pieces}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-left text-gray-900 dark:text-gray-300">
                    {formatDate(session.start_date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-left">
                    <div className="flex items-center">
                      <span className="text-gray-900 dark:text-gray-300">
                        {formatShortDuration(session.duration_minutes || 0)}
                        <span className="text-gray-500 dark:text-gray-400 ml-1">
                          ({session.duration_minutes} min)
                        </span>
                      </span>
                      {session.isFastest && session.duration_minutes && (
                        <Zap className="w-5 h-5 ml-2 text-yellow-500" title="Nejrychlejší čas" />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {hasMore && (
            <div className="flex justify-center py-6">
              <button
                onClick={handleLoadMore}
                className="btn btn-secondary"
              >
                Načíst další
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}