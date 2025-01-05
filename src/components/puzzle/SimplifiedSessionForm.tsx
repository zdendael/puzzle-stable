import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createPuzzleSession } from '../../lib/api/sessions'
import { updatePuzzle } from '../../lib/api/puzzles'
import toast from 'react-hot-toast'
import { Clock, Star, BarChart3 } from 'lucide-react'
import { StarRating } from '../StarRating'
import { useQuery } from '@tanstack/react-query'
import { getPuzzles } from '../../lib/api'

interface SimplifiedSessionFormProps {
  puzzleId: number
  initialData: {
    start_date: Date
    end_date: Date
    duration_minutes: number
  }
  onClose: () => void
}

export function SimplifiedSessionForm({ puzzleId, initialData, onClose }: SimplifiedSessionFormProps) {
  const [form, setForm] = useState({
    start_date: initialData.start_date.toISOString().split('T')[0],
    duration_minutes: initialData.duration_minutes,
    notes: '',
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
      // Nejprve vytvoříme session
      const sessionPromise = createPuzzleSession({
        puzzle_id: puzzleId,
        start_date: new Date(form.start_date),
        end_date: null,
        duration_minutes: form.duration_minutes,
        notes: form.notes || undefined
      })
      
      // Pokud bylo změněno hodnocení nebo obtížnost, aktualizujeme puzzle
      if ((form.rating !== null && form.rating !== puzzle?.rating) || 
          (form.difficulty !== 'unrated' && form.difficulty !== puzzle?.difficulty)) {
        const puzzlePromise = updatePuzzle(puzzleId, {
          ...puzzle!,
          rating: form.rating !== null ? form.rating : puzzle?.rating,
          difficulty: form.difficulty !== 'unrated' ? form.difficulty : puzzle?.difficulty
        })
        await Promise.all([sessionPromise, puzzlePromise])
      } else {
        await sessionPromise
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['puzzles'] })
      toast.success('Skládání bylo uloženo')
      onClose()
    },
    onError: () => {
      toast.error('Něco se pokazilo')
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.start_date) {
      toast.error('Vyplň datum skládání')
      return
    }
    if (!form.duration_minutes || form.duration_minutes <= 0) {
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onClose}
          className="btn btn-secondary"
          disabled={isPending}
        >
          Zrušit
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isPending}
        >
          {isPending ? 'Ukládám...' : 'Uložit'}
        </button>
      </div>
    </form>
  )
}