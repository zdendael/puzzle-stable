import type { Puzzle } from '../../lib/types'

export interface TimeEstimate {
  minutes: number
  sampleSize: number
  minTime: number
  maxTime: number
  piecesPerMinute: number
}

export function calculateEstimatedTime(puzzle: Puzzle, allPuzzles: Puzzle[]): TimeEstimate | null {
  // Pokud má puzzle již nějaké skládání, neodhadujeme
  if (puzzle.sessions?.length) return null

  // Najdeme podobná puzzle (±500 dílků) s dokončeným skládáním
  const similarPuzzles = allPuzzles.filter(p => {
    const pieceDifference = Math.abs(p.pieces - puzzle.pieces)
    return pieceDifference <= 500 && p.sessions?.some(s => s.duration_minutes)
  })

  if (!similarPuzzles.length) return null

  // Získáme všechny časy skládání
  const completionTimes = similarPuzzles.flatMap(p => 
    p.sessions?.filter(s => s.duration_minutes).map(s => ({
      duration: s.duration_minutes!,
      piecesPerMinute: p.pieces / s.duration_minutes!
    })) || []
  )

  if (!completionTimes.length) return null

  // Vypočítáme průměrnou rychlost skládání
  const avgPiecesPerMinute = completionTimes.reduce((sum, t) => 
    sum + t.piecesPerMinute, 0) / completionTimes.length

  return {
    minutes: Math.round(puzzle.pieces / avgPiecesPerMinute),
    sampleSize: completionTimes.length,
    minTime: Math.min(...completionTimes.map(t => t.duration)),
    maxTime: Math.max(...completionTimes.map(t => t.duration)),
    piecesPerMinute: avgPiecesPerMinute
  }
}