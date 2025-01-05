import type { Puzzle } from '../types'

interface CompletionTimeEstimate {
  minutes: number
  sampleSize: number
  minTime: number
  maxTime: number
  piecesPerMinute: number
}

export function calculateEstimatedCompletionTime(puzzle: Puzzle, allPuzzles: Puzzle[]): CompletionTimeEstimate | null {
  // Pokud má puzzle již nějaké skládání, neodhadujeme
  if (puzzle.sessions && puzzle.sessions.length > 0) {
    return null
  }

  // Najdeme podobná puzzle (±500 dílků) s dokončeným skládáním
  const similarPuzzles = allPuzzles.filter(p => {
    const pieceDifference = Math.abs(p.pieces - puzzle.pieces)
    return pieceDifference <= 500 && p.sessions && p.sessions.length > 0
  })

  if (similarPuzzles.length === 0) {
    return null
  }

  // Získáme všechny časy skládání podobných puzzlí
  const completionTimes = similarPuzzles.flatMap(p => 
    p.sessions?.filter(s => s.duration_minutes).map(s => ({
      duration: s.duration_minutes!,
      piecesPerMinute: p.pieces / s.duration_minutes!
    })) || []
  )

  if (completionTimes.length === 0) {
    return null
  }

  // Vypočítáme průměrnou rychlost skládání (dílků za minutu)
  const avgPiecesPerMinute = completionTimes.reduce((sum, time) => 
    sum + time.piecesPerMinute, 0) / completionTimes.length

  // Odhadneme čas pro aktuální puzzle
  const estimatedMinutes = Math.round(puzzle.pieces / avgPiecesPerMinute)

  return {
    minutes: estimatedMinutes,
    sampleSize: completionTimes.length,
    minTime: Math.min(...completionTimes.map(t => t.duration)),
    maxTime: Math.max(...completionTimes.map(t => t.duration)),
    piecesPerMinute: avgPiecesPerMinute
  }
}

export function filterByEstimatedTime(
  puzzle: Puzzle, 
  allPuzzles: Puzzle[], 
  minMinutes: number | null, 
  maxMinutes: number | null
): boolean {
  const estimate = calculateEstimatedCompletionTime(puzzle, allPuzzles)
  
  if (!estimate) return false
  
  if (minMinutes !== null && estimate.minutes < minMinutes) return false
  if (maxMinutes !== null && estimate.minutes > maxMinutes) return false
  
  return true
}