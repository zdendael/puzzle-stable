import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getPuzzles } from '../../lib/api'
import { useLocation } from 'react-router-dom'
import type { CollectionFilter } from '../../pages/PuzzlesPage'

interface BasicFiltersProps {
  filters: any
  onFilterChange: (filters: any) => void
}

export function BasicFilters({ filters, onFilterChange }: BasicFiltersProps) {
  const location = useLocation()
  const isSessionsPage = location.pathname === '/sessions'

  const { data: puzzles } = useQuery({
    queryKey: ['puzzles'],
    queryFn: getPuzzles
  })

  const uniquePieceCounts = useMemo(() => {
    if (!puzzles) return []
    const counts = new Set(puzzles.map(p => p.pieces))
    return Array.from(counts).sort((a, b) => a - b)
  }, [puzzles])

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm text-gray-600 dark:text-gray-400">Počet dílků</label>
        <div className="mt-1 grid grid-cols-2 sm:grid-cols-3 gap-1">
          {uniquePieceCounts.map((count) => (
            <button
              key={count}
              onClick={() => {
                const newPieces = filters.pieces?.includes(count)
                  ? filters.pieces.filter((p: number) => p !== count)
                  : [...(filters.pieces || []), count]
                onFilterChange({
                  ...filters,
                  pieces: newPieces
                })
              }}
              className={`px-2 py-1 text-xs rounded-md ${
                filters.pieces?.includes(count)
                  ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {count}
            </button>
          ))}
        </div>

        {filters.pieces?.length > 0 && (
          <button
            onClick={() => onFilterChange({ ...filters, pieces: [] })}
            className="mt-2 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
          >
            Zrušit filtr
          </button>
        )}
      </div>

      {!isSessionsPage && (
        <>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">Obtížnost</label>
            <div className="mt-1 grid grid-cols-2 sm:grid-cols-2 gap-1">
              {[
                { value: 'unrated', label: 'Nehodnoceno', color: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200' },
                { value: 'easy', label: 'Snadné', color: 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200' },
                { value: 'medium', label: 'Střední', color: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200' },
                { value: 'hard', label: 'Těžké', color: 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200' }
              ].map(({ value, label, color }) => (
                <button
                  key={value}
                  onClick={() => {
                    const difficulties = filters.difficulties || []
                    const newDifficulties = difficulties.includes(value)
                      ? difficulties.filter(d => d !== value)
                      : [...difficulties, value]
                    onFilterChange({ ...filters, difficulties: newDifficulties })
                  }}
                  className={`px-2 py-1 text-xs rounded-md ${
                    filters.difficulties?.includes(value)
                      ? color
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            {filters.difficulties?.length > 0 && (
              <button
                onClick={() => onFilterChange({ ...filters, difficulties: [] })}
                className="mt-2 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
              >
                Zrušit filtr
              </button>
            )}
          </div>

          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">Stav ve sbírce</label>
            <div className="mt-1 grid grid-cols-1 sm:grid-cols-2 gap-1">
              {[
                { value: 'all', label: 'Všechna puzzle', color: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200' },
                { value: 'in_collection', label: 'Pouze ve sbírce', color: 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200' },
                { value: 'removed', label: 'Pouze vyřazená', color: 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200' }
              ].map(({ value, label, color }) => (
                <button
                  key={value}
                  onClick={() => onFilterChange({ ...filters, collectionStatus: value as CollectionFilter })}
                  className={`px-2 py-1 text-xs rounded-md ${
                    filters.collectionStatus === value
                      ? color
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}