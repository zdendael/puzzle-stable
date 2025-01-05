import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createPuzzleSession, updatePuzzleSession } from '../../lib/api/sessions'
import { updatePuzzle } from '../../lib/api/puzzles'
import toast from 'react-hot-toast'
import type { PuzzleSession } from '../../lib/types'
import { Clock, Star, BarChart3 } from 'lucide-react'
import { StarRating } from '../StarRating'
import { useQuery } from '@tanstack/react-query'
import { getPuzzles } from '../../lib/api'

interface SessionFormProps {
  puzzleId: number
  session?: PuzzleSession
  initialData?: {
    start_date: Date
    end_date: Date
    duration_minutes: number
  }
  onClose: () => void
}

export function SessionForm({ puzzleId, session, initialData, onClose }: SessionFormProps) {
  const [isManualDuration, setIsManualDuration] = useState(!session?.end_date && !initialData)
  const [showForm, setShowForm] = useState(!!session || !!initialData)

  const defaultDate = new Date()
  const defaultTime = defaultDate.toTimeString().slice(0, 5)
  const defaultDateString = defaultDate.toISOString().split('T')[0]

  const [form, setForm] = useState({
    start_date: session?.start_date 
      ? new Date(session.start_date).toISOString().split('T')[0] 
      : initialData?.start_date?.toISOString().split('T')[0] 
      ?? defaultDateString,
    start_time: session?.start_date 
      ? new Date(session.start_date).toTimeString().slice(0, 5) 
      : initialData?.start_date?.toTimeString().slice(0, 5)
      ?? defaultTime,
    end_date: session?.end_date 
      ? new Date(session.end_date).toISOString().split('T')[0] 
      : initialData?.end_date?.toISOString().split('T')[0]
      ?? '',
    end_time: session?.end_date 
      ? new Date(session.end_date).toTimeString().slice(0, 5) 
      : initialData?.end_date?.toTimeString().slice(0, 5)
      ?? '',
    duration_minutes: session?.duration_minutes 
      ?? initialData?.duration_minutes 
      ?? 0,
    notes: session?.notes ?? '',
    rating: null as number | null,
    difficulty: 'unrated' as 'unrated' | 'easy' | 'medium' | 'hard'
  })

  const queryClient = useQueryClient()
  
  const { data: puzzles = [] } = useQuery({
    queryKey: ['puzzles'],
    queryFn: getPuzzles
  })

  const puzzle = puzzles.find(p => p.id === puzzleId)

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      // Vytvoříme objekt s daty pro session
      const sessionData: Partial<PuzzleSession> = {
        puzzle_id: puzzleId,
        notes: form.notes || undefined
      }

      if (isManualDuration) {
        const start = new Date(`${form.start_date}T00:00:00`)
        sessionData.start_date = start
        sessionData.end_date = null
        sessionData.duration_minutes = form.duration_minutes
      } else {
        if (!form.start_date || !form.start_time || !form.end_date || !form.end_time) {
          throw new Error('Vyplňte všechny údaje o čase')
        }
        const start = new Date(`${form.start_date}T${form.start_time}:00`)
        const end = new Date(`${form.end_date}T${form.end_time}:00`)
        sessionData.start_date = start
        sessionData.end_date = end
        sessionData.duration_minutes = calculateDuration()
      }

      if (session) {
        await updatePuzzleSession(session.id, sessionData)
      } else {
        await createPuzzleSession(sessionData as Required<Pick<PuzzleSession, 'puzzle_id' | 'start_date'>>)
      }

      // Pokud bylo změněno hodnocení nebo obtížnost, aktualizujeme puzzle
      if ((form.rating !== null && form.rating !== puzzle?.rating) || 
          (form.difficulty !== 'unrated' && form.difficulty !== puzzle?.difficulty)) {
        await updatePuzzle(puzzleId, {
          ...puzzle!,
          rating: form.rating !== null ? form.rating : puzzle?.rating,
          difficulty: form.difficulty !== 'unrated' ? form.difficulty : puzzle?.difficulty
        })
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['puzzles'] })
      toast.success(session ? 'Záznam byl upraven' : 'Záznam byl přidán')
      onClose()
    },
    onError: (error) => {
      console.error('Chyba při ukládání:', error)
      toast.error('Něco se pokazilo')
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!form.start_date) {
      toast.error('Vyplň datum začátku skládání')
      return
    }

    if (!isManualDuration) {
      if (!form.start_time || !form.end_date || !form.end_time) {
        toast.error('Vyplň všechny údaje o čase')
        return
      }

      const duration = calculateDuration()
      if (duration <= 0) {
        toast.error('Čas konce musí být později než čas začátku')
        return
      }
    } else if (!form.duration_minutes || form.duration_minutes <= 0) {
      toast.error('Vyplň platnou dobu trvání')
      return
    }

    mutate()
  }

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Snadné'
      case 'medium': return 'Střední'
      case 'hard': return 'Těžké'
      default: return 'Nehodnoceno'
    }
  }

  const calculateDuration = () => {
    if (!form.start_date || !form.end_date || !form.start_time || !form.end_time) return 0
    
    const start = new Date(`${form.start_date}T${form.start_time}:00`)
    const end = new Date(`${form.end_date}T${form.end_time}:00`)
    
    return Math.round((end.getTime() - start.getTime()) / (1000 * 60))
  }

  if (!showForm) {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Jak chceš zadat dobu skládání?
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => {
              setIsManualDuration(false)
              setShowForm(true)
            }}
            className="flex flex-col items-center justify-center p-6 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors"
          >
            <Clock className="w-8 h-8 mb-3 text-indigo-600 dark:text-indigo-400" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Automatický výpočet
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">
              Zadám čas začátku a konce
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsManualDuration(true)
              setShowForm(true)
            }}
            className="flex flex-col items-center justify-center p-6 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors"
          >
            <Clock className="w-8 h-8 mb-3 text-indigo-600 dark:text-indigo-400" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Ruční zadání
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">
              Zadám jen celkovou dobu
            </span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {isManualDuration ? (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Datum skládání
            </label>
            <input
              type="date"
              value={form.start_date}
              onChange={(e) => setForm({ ...form, start_date: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              <Clock className="inline-block w-4 h-4 mr-1" />
              Doba skládání (minuty)
            </label>
            <input
              type="number"
              value={form.duration_minutes}
              onChange={(e) => setForm({ ...form, duration_minutes: parseInt(e.target.value) || 0 })}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              min="1"
              required
            />
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Datum začátku
              </label>
              <input
                type="date"
                value={form.start_date}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Čas začátku
              </label>
              <input
                type="time"
                value={form.start_time}
                onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Datum dokončení
              </label>
              <input
                type="date"
                value={form.end_date}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Čas dokončení
              </label>
              <input
                type="time"
                value={form.end_time}
                onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>
          </div>

          {form.start_date && form.end_date && form.start_time && form.end_time && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Vypočítaná doba skládání: {calculateDuration()} minut
            </div>
          )}
        </>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Poznámky
        </label>
        <textarea
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <Star className="inline-block w-4 h-4 mr-1" />
          Hodnocení
        </label>
        <StarRating
          rating={form.rating ?? undefined}
          onChange={(rating) => setForm({ ...form, rating })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <BarChart3 className="inline-block w-4 h-4 mr-1" />
          Obtížnost
        </label>
        <div className="grid grid-cols-4 gap-2">
          {['unrated', 'easy', 'medium', 'hard'].map((difficulty) => (
            <button
              key={difficulty}
              type="button"
              onClick={() => setForm({ ...form, difficulty: difficulty as any })}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                form.difficulty === difficulty
                  ? difficulty === 'unrated'
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                    : difficulty === 'easy'
                    ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200'
                    : difficulty === 'medium'
                    ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200'
                    : 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {getDifficultyLabel(difficulty)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={() => {
            if (session) {
              onClose()
            } else {
              setShowForm(false)
            }
          }}
          className="btn btn-secondary"
          disabled={isPending}
        >
          {session ? 'Zrušit' : 'Zpět'}
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isPending}
        >
          {isPending ? 'Ukládám...' : session ? 'Upravit' : 'Přidat'}
        </button>
      </div>
    </form>
  )
}