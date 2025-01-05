import { useState } from 'react'
import { format } from 'date-fns'
import { cs } from 'date-fns/locale'
import { Clock, Plus, Zap, ChevronDown, ChevronUp, Calendar } from 'lucide-react'
import { Modal } from '../Modal'
import { SessionForm } from './SessionForm'
import { ItemActions } from '../ItemActions'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updatePuzzleSession, deletePuzzleSession } from '../../lib/api'
import toast from 'react-hot-toast'
import type { Puzzle, PuzzleSession } from '../../lib/types'
import { PuzzleTimer } from './PuzzleTimer'
import { formatDate, formatShortDuration } from '../../utils/format'

interface PuzzleSessionsProps {
  puzzle: Puzzle
}

export function PuzzleSessions({ puzzle }: PuzzleSessionsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedSession, setSelectedSession] = useState<PuzzleSession | undefined>()
  const [showAllSessions, setShowAllSessions] = useState(false)

  const queryClient = useQueryClient()

  const { mutate: handleDelete } = useMutation({
    mutationFn: (id: number) => deletePuzzleSession(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['puzzles'] })
      toast.success('Záznam byl smazán')
    },
    onError: () => {
      toast.error('Něco se pokazilo')
    }
  })

  const handleEditSession = (session: PuzzleSession) => {
    setSelectedSession(session)
    setIsModalOpen(true)
  }

  const handleAddSession = () => {
    setSelectedSession(undefined)
    setIsModalOpen(true)
  }

  // Najít nejrychlejší čas mezi dokončenými sessions
  const fastestTime = puzzle.sessions?.reduce((fastest, session) => {
    if (session.duration_minutes && (!fastest || session.duration_minutes < fastest)) {
      return session.duration_minutes
    }
    return fastest
  }, 0)

  const renderSession = (session: PuzzleSession) => (
    <div
      key={session.id}
      className="text-sm bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 relative mb-3"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center text-gray-700 dark:text-gray-300 mb-2">
            <Calendar className="w-4 h-4 mr-1 text-gray-400 dark:text-gray-500 flex-shrink-0" />
            {formatDate(session.start_date)}
          </div>
          {session.duration_minutes ? (
            <div className="flex items-center text-gray-700 dark:text-gray-300">
              <Clock className="w-4 h-4 mr-1 text-gray-400 dark:text-gray-500 flex-shrink-0" />
              <span>
                {formatShortDuration(session.duration_minutes)}
                <span className="text-gray-500 dark:text-gray-400 ml-1">
                  ({session.duration_minutes} min)
                </span>
              </span>
            </div>
          ) : (
            <div className="flex items-center text-gray-700 dark:text-gray-300">
              <Clock className="w-4 h-4 mr-1 text-gray-400 dark:text-gray-500 flex-shrink-0" />
              <span>Probíhá...</span>
            </div>
          )}
          {session.notes && (
            <div className="mt-2 text-gray-600 dark:text-gray-400 break-words">
              {session.notes}
            </div>
          )}
          {session.duration_minutes === fastestTime && fastestTime > 0 && (
            <div className="absolute bottom-2 right-2">
              <span className="group/tooltip relative">
                <Zap className="w-4 h-4 text-yellow-500 dark:text-yellow-400 flex-shrink-0" />
                <span className="invisible group-hover/tooltip:visible absolute left-1/2 -translate-x-1/2 -top-8 px-2 py-1 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded whitespace-nowrap">
                  Nejrychlejší čas
                </span>
              </span>
            </div>
          )}
        </div>
        <div className="ml-4">
          <ItemActions
            onEdit={() => handleEditSession(session)}
            onDelete={() => handleDelete(session.id)}
          />
        </div>
      </div>
    </div>
  )

  const latestSession = puzzle.sessions?.[0]
  const olderSessions = puzzle.sessions?.slice(1) || []

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-gray-900 dark:text-white">Historie skládání</h4>
        <div className="flex items-center gap-2">
          <PuzzleTimer puzzleId={puzzle.id!} />
          <button
            onClick={handleAddSession}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Přidat záznam o skládání"
          >
            <Plus className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </button>
        </div>
      </div>

      {!puzzle.sessions?.length ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Zatím žádné záznamy o skládání
        </p>
      ) : (
        <div>
          {latestSession && renderSession(latestSession)}
          
          {olderSessions.length > 0 && (
            <div>
              {showAllSessions ? (
                <>
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                    <div className="space-y-3">
                      {olderSessions.map(session => renderSession(session))}
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAllSessions(false)}
                    className="flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    <ChevronUp className="w-4 h-4 mr-1" />
                    Skrýt starší záznamy
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowAllSessions(true)}
                  className="flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <ChevronDown className="w-4 h-4 mr-1" />
                  Zobrazit {olderSessions.length} {olderSessions.length === 1 ? 'starší záznam' : 
                    olderSessions.length >= 2 && olderSessions.length <= 4 ? 'starší záznamy' : 'starších záznamů'}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedSession ? 'Upravit záznam o skládání' : 'Přidat záznam o skládání'}
      >
        <SessionForm
          puzzleId={puzzle.id!}
          session={selectedSession}
          onClose={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  )
}