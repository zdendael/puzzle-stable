import type { Puzzle } from '../types'
import type { CollectionFilter } from '../pages/PuzzlesPage'

import type { Filters } from '../lib/types/filters'
import type { Puzzle } from '../lib/types'

export function filterPuzzles(puzzles: Puzzle[], filters: Filters, searchTerm: string): Puzzle[] {
  if (!Array.isArray(puzzles)) return []
  
  return puzzles.filter(puzzle => {
    // ... předchozí filtry zůstávají stejné

    // Filtr pro předpokládanou dobu skládání
    if (filters.estimatedTimeRange.min !== null || filters.estimatedTimeRange.max !== null) {
      // Pokud má puzzle již nějaké skládání, nezahrneme ho do filtru
      if (puzzle.sessions && puzzle.sessions.length > 0) return false

      // Najdeme podobná puzzle (±500 dílků) s dokončeným skládáním
      const similarPuzzles = puzzles.filter(p => {
        const pieceDifference = Math.abs(p.pieces - puzzle.pieces)
        return pieceDifference <= 500 && p.sessions && p.sessions.length > 0
      })

      if (similarPuzzles.length === 0) return false

      // Vypočítáme průměrnou rychlost skládání
      const completionTimes = similarPuzzles.flatMap(p => 
        p.sessions?.filter(s => s.duration_minutes).map(s => ({
          piecesPerMinute: p.pieces / s.duration_minutes!
        })) || []
      )

      if (completionTimes.length === 0) return false

      const avgPiecesPerMinute = completionTimes.reduce((sum, time) => 
        sum + time.piecesPerMinute, 0) / completionTimes.length

      const estimatedMinutes = Math.round(puzzle.pieces / avgPiecesPerMinute)

      if (filters.estimatedTimeRange.min !== null && estimatedMinutes < filters.estimatedTimeRange.min) return false
      if (filters.estimatedTimeRange.max !== null && estimatedMinutes > filters.estimatedTimeRange.max) return false
    }

    return true
  })
}