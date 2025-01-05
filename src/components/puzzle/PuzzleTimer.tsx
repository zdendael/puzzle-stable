import { useState } from 'react'
import { Play, Pause, Square, Play as PlayIcon } from 'lucide-react'
import { Modal } from '../Modal'
import { SimplifiedSessionForm } from './SimplifiedSessionForm'
import type { Puzzle } from '../../lib/types'
import { useQuery } from '@tanstack/react-query'
import { getPuzzles } from '../../lib/api'
import { useTimer } from '../../hooks/useTimer'

interface PuzzleTimerProps {
  puzzleId: number
}

export function PuzzleTimer({ puzzleId }: PuzzleTimerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showSessionForm, setShowSessionForm] = useState(false)

  const {
    isRunning,
    isPaused,
    totalElapsed,
    startTime,
    handleStart,
    handlePause,
    handleStop,
    handleReset
  } = useTimer(puzzleId)

  const { data: puzzles = [] } = useQuery({
    queryKey: ['puzzles'],
    queryFn: getPuzzles
  })

  const puzzle = puzzles.find(p => p.id === puzzleId)

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = Math.floor(totalSeconds % 60)
    
    return {
      hours: hours.toString().padStart(2, '0'),
      minutes: minutes.toString().padStart(2, '0'),
      seconds: seconds.toString().padStart(2, '0')
    }
  }

  const handleCloseTimer = () => {
    setIsModalOpen(false)
    setShowSessionForm(false)
    handleReset()
  }

  const handleStopAndSave = () => {
    handleStop()
    setShowSessionForm(true)
  }

  const { hours, minutes, seconds } = formatTime(totalElapsed)

  // Pokud je aktivní časovač pro toto puzzle, zobrazíme jiný stav tlačítka
  const isActiveTimer = isRunning || isPaused

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={`p-2 rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-900/50 ${
          isActiveTimer 
            ? 'text-green-500 dark:text-green-400 animate-pulse' 
            : 'text-indigo-600 dark:text-indigo-400'
        }`}
        title={isActiveTimer ? "Pokračovat v měření času" : "Spustit časovač"}
      >
        <PlayIcon className="w-5 h-5" />
      </button>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseTimer}
        title="Časovač skládání"
        size={showSessionForm ? 'default' : 'large'}
      >
        {!showSessionForm ? (
          <div className="flex flex-col items-center justify-center min-h-[500px] p-8">
            {puzzle && (
              <div className="text-center mb-8">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {puzzle.name}
                </h2>
                {puzzle.image_url && (
                  <div className="w-48 h-48 mx-auto mb-4 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                    <img
                      src={puzzle.image_url}
                      alt={puzzle.name}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                )}
              </div>
            )}

            <div className="text-8xl font-bold mb-12 font-mono text-gray-900 dark:text-white tabular-nums">
              {hours}:{minutes}:{seconds}
            </div>

            <div className="flex gap-8">
              {!isRunning ? (
                <button
                  onClick={handleStart}
                  className="flex items-center justify-center w-24 h-24 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl transition-all"
                >
                  <Play className="w-12 h-12" />
                </button>
              ) : (
                <button
                  onClick={handlePause}
                  className="flex items-center justify-center w-24 h-24 rounded-full bg-yellow-500 hover:bg-yellow-600 text-white shadow-lg hover:shadow-xl transition-all"
                >
                  <Pause className="w-12 h-12" />
                </button>
              )}

              {(isRunning || isPaused) && (
                <button
                  onClick={handleStopAndSave}
                  className="flex items-center justify-center w-24 h-24 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl transition-all"
                >
                  <Square className="w-12 h-12" />
                </button>
              )}
            </div>
          </div>
        ) : (
          <SimplifiedSessionForm
            puzzleId={puzzleId}
            initialData={{
              start_date: startTime!,
              end_date: new Date(),
              duration_minutes: Math.round(totalElapsed / 60)
            }}
            onClose={handleCloseTimer}
          />
        )}
      </Modal>
    </>
  )
}