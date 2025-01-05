import { useQuery } from '@tanstack/react-query'
import { getPuzzles } from '../lib/api/puzzles'
import { getWishList } from '../lib/api/wishlist'
import type { ActivityType } from '../components/activity/ActivityPanel'

export function useActivities() {
  const { data: puzzlesData } = useQuery({
    queryKey: ['puzzles'],
    queryFn: getPuzzles
  })

  const { data: wishlist = [] } = useQuery({
    queryKey: ['wishlist'],
    queryFn: getWishList
  })

  const puzzles = puzzlesData ?? []

  // Vytvoření seznamu všech aktivit
  const activities: (ActivityType & { timestamp: number; groupId: string; sortOrder: number })[] = [
    // Přidaná puzzle
    ...puzzles.map(puzzle => ({
      type: 'puzzle_added' as const,
      data: puzzle,
      timestamp: new Date(puzzle.created_at!).getTime(),
      groupId: `puzzle_${puzzle.id}`,
      sortOrder: 1
    })),

    // Odebraná puzzle ze sbírky
    ...puzzles
      .filter(p => !p.in_collection && p.removal_date)
      .map(puzzle => ({
        type: 'puzzle_removed' as const,
        data: puzzle,
        timestamp: new Date(puzzle.removal_date!).getTime(),
        groupId: `puzzle_${puzzle.id}`,
        sortOrder: 2
      })),

    // Smazaná puzzle
    ...puzzles
      .filter(p => p.deleted_at)
      .map(puzzle => ({
        type: 'puzzle_deleted' as const,
        data: puzzle,
        timestamp: new Date(puzzle.deleted_at!).getTime(),
        groupId: `puzzle_${puzzle.id}`,
        sortOrder: 3
      })),

    // Nakoupená puzzle z wishlistu
    ...puzzles
      .filter(p => p.from_wishlist)
      .map(puzzle => ({
        type: 'wishlist_purchased' as const,
        data: puzzle,
        timestamp: new Date(puzzle.created_at!).getTime(),
        groupId: `puzzle_${puzzle.id}`,
        sortOrder: 1
      })),

    // Přidané položky do wishlistu
    ...wishlist
      .filter(item => !item.deleted_at)
      .map(item => ({
        type: 'wishlist_added' as const,
        data: item,
        timestamp: new Date(item.created_at!).getTime(),
        groupId: `wishlist_${item.id}`,
        sortOrder: 1
      })),

    // Smazané položky z wishlistu
    ...wishlist
      .filter(item => item.deleted_at)
      .map(item => ({
        type: 'wishlist_deleted' as const,
        data: item,
        timestamp: new Date(item.deleted_at!).getTime(),
        groupId: `wishlist_${item.id}`,
        sortOrder: 2
      }))
  ]

  // Seřazení podle času a zajištění správného pořadí souvisejících aktivit
  return activities
    .sort((a, b) => {
      // Pokud jsou aktivity ze stejného času
      if (a.timestamp === b.timestamp) {
        // Pokud jsou ze stejné skupiny (stejné puzzle/wishlist item)
        if (a.groupId === b.groupId) {
          // Seřadit podle priority (sortOrder)
          return a.sortOrder - b.sortOrder
        }
        // Jinak podle groupId pro konzistentní řazení
        return a.groupId.localeCompare(b.groupId)
      }
      // Primárně podle času sestupně
      return b.timestamp - a.timestamp
    })
    .slice(0, 20)
    .map(({ type, data }) => ({ type, data }))
}