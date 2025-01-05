import type { Puzzle } from '../../../lib/types'
import { format } from 'date-fns'
import { cs } from 'date-fns/locale'
import { Trophy } from 'lucide-react'
import { InfoTooltip } from '../../InfoTooltip'
import { useNavigate } from 'react-router-dom'
import { formatShortDuration } from '../../../utils/format'

interface FastestSessionsTableProps {
  puzzles: Puzzle[]
}

export function FastestSessionsTable({ puzzles }: FastestSessionsTableProps) {
  const navigate = useNavigate()
  
  const allSessions = puzzles
    .flatMap(puzzle => (puzzle.sessions || [])
      .filter(s => s.duration_minutes)
      .map(session => ({
        ...session,
        puzzle
      }))
    )
    .sort((a, b) => (a.duration_minutes || 0) - (b.duration_minutes || 0))
    .slice(0, 5)

  const handlePuzzleClick = (name: string) => {
    navigate('/', { state: { searchTerm: name } })
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <InfoTooltip text="Tabulka zobrazuje 5 nejrychleji složených puzzlí. Pro každé puzzle je uvedena doba skládání, počet dílků a datum složení. Zlatá trofej označuje absolutně nejrychlejší složené puzzle ve sbírce. Kliknutím na název puzzle zobrazíte jeho detail." />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="w-8"></th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Puzzle</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Dílků</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Datum</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Čas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {allSessions.map((session, index) => (
              <tr key={session.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                  {index === 0 && (
                    <Trophy className="w-4 h-4 text-yellow-500" />
                  )}
                </td>
                <td className="px-4 py-2 text-sm text-gray-900 dark:text-white max-w-xs">
                  <button
                    className="truncate text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                    onClick={() => handlePuzzleClick(session.puzzle.name)}
                    title={session.puzzle.name}
                  >
                    {session.puzzle.name}
                  </button>
                </td>
                <td className="px-4 py-2 text-sm text-gray-900 dark:text-white whitespace-nowrap">
                  {session.puzzle.pieces}
                </td>
                <td className="px-4 py-2 text-sm text-gray-900 dark:text-white whitespace-nowrap">
                  {format(new Date(session.start_date), 'PP', { locale: cs })}
                </td>
                <td className="px-4 py-2 text-sm text-gray-900 dark:text-white whitespace-nowrap">
                  {formatShortDuration(session.duration_minutes || 0)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}