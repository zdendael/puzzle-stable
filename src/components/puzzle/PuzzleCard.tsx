import { ItemActions } from '../ItemActions'
import { ExternalLink } from 'lucide-react'
import { PuzzleInfo } from './PuzzleInfo'
import { PuzzleCategories } from './PuzzleCategories'
import { PuzzleTags } from './PuzzleTags'
import { PuzzleImage } from './PuzzleImage'
import { PuzzleSessions } from './PuzzleSessions'
import type { Puzzle } from '../../lib/types'
import type { CollectionFilter } from '../../pages/PuzzlesPage'

interface PuzzleCardProps {
  puzzle: Puzzle
  onEdit: (puzzle: Puzzle) => void
  onDelete: (id: number) => void
  onFilter: (type: string, value: string | boolean | CollectionFilter) => void
  categories: any[]
  tags: any[]
}

export function PuzzleCard({ puzzle, onEdit, onDelete, onFilter, categories, tags }: PuzzleCardProps) {
  const getAcquisitionLabel = (puzzle: Puzzle) => {
    if (puzzle.is_gift) return 'Dárek'
    if (puzzle.is_collaboration) return 'Spolupráce'
    if (puzzle.is_own_purchase) return 'Vlastní nákup'
    return null
  }

  const getAcquisitionFilterValue = (puzzle: Puzzle) => {
    if (puzzle.is_gift) return 'gift'
    if (puzzle.is_collaboration) return 'collaboration'
    if (puzzle.is_own_purchase) return 'own_purchase'
    return null
  }

  const getAcquisitionStyle = (type: string) => {
    switch (type) {
      case 'gift':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900/50 dark:text-pink-200 hover:bg-pink-200 dark:hover:bg-pink-900/70'
      case 'collaboration':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200 hover:bg-purple-200 dark:hover:bg-purple-900/70'
      case 'own_purchase':
        return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-900/70'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
    }
  }

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg ${
        !puzzle.in_collection ? 'border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 opacity-75 saturate-50' : ''
      }`}
      style={{ isolation: 'isolate' }}
    >
      <div className={`p-4 sm:p-6 ${!puzzle.in_collection ? 'grayscale-[25%]' : ''}`}>
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">{puzzle.name}</h3>
          <ItemActions
            onEdit={() => onEdit(puzzle)}
            onDelete={() => onDelete(puzzle.id!)}
          />
        </div>

        <div className="relative">
          <PuzzleImage imageUrl={puzzle.image_url} name={puzzle.name} />
        </div>
        {/* Způsob získání a stav ve sbírce */}
        <div className="flex flex-wrap gap-2 mt-6 mb-4">
          {getAcquisitionLabel(puzzle) && (
            <button
              onClick={() => {
                const value = getAcquisitionFilterValue(puzzle)
                onFilter('acquisition', value!)
              }}
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                getAcquisitionStyle(getAcquisitionFilterValue(puzzle)!)
              }`}
            >
              {getAcquisitionLabel(puzzle)}
            </button>
          )}

          <button
            onClick={() => onFilter('collection', puzzle.in_collection ? 'in_collection' : 'removed')}
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              puzzle.in_collection 
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-900/70'
                : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-900/70'
            }`}
          >
            {puzzle.in_collection ? 'Ve sbírce' : 'Vyřazeno'}
          </button>
        </div>

        <PuzzleInfo puzzle={puzzle} onFilter={onFilter} />

        {/* Motivy a štítky */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
          <div>
            <PuzzleCategories categories={categories} puzzle={puzzle} onFilter={onFilter} />
          </div>
          <div>
            <PuzzleTags tags={tags} puzzle={puzzle} onFilter={onFilter} />
          </div>
        </div>

        <PuzzleSessions puzzle={puzzle} />
      </div>
    </div>
  )
}