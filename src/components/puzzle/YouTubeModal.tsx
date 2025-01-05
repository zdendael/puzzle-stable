import { useState } from 'react'
import { Youtube } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updatePuzzle } from '../../lib/api/puzzles'
import { isValidYoutubeUrl } from '../../utils/youtube'
import toast from 'react-hot-toast'
import type { Puzzle } from '../../lib/types'

interface YouTubeModalProps {
  puzzle: Puzzle
  onClose: () => void
}

export function YouTubeModal({ puzzle, onClose }: YouTubeModalProps) {
  const [url, setUrl] = useState(puzzle.youtube_url || '')
  const [isPending, setIsPending] = useState(false)
  const queryClient = useQueryClient()

  const { mutate } = useMutation({
    mutationFn: async () => {
      if (!isValidYoutubeUrl(url)) {
        throw new Error('Neplatný formát YouTube URL')
      }
      await updatePuzzle(puzzle.id!, {
        ...puzzle,
        youtube_url: url
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['puzzles'] })
      toast.success('Video bylo přidáno')
      onClose()
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Něco se pokazilo')
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsPending(true)
    mutate()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          <Youtube className="inline-block w-4 h-4 mr-1" />
          Odkaz na YouTube video
        </label>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          placeholder="https://youtube.com/watch?v=..."
          required
        />
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Vložte odkaz na video ve formátu https://youtube.com/watch?v=... nebo https://youtu.be/...
        </p>
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