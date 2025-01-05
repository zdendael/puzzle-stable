import type { Puzzle } from '../../lib/types'

interface PuzzleCategoriesProps {
  categories: any[]
  puzzle: Puzzle
  onFilter: (type: string, value: string) => void
}

export function PuzzleCategories({ categories, puzzle, onFilter }: PuzzleCategoriesProps) {
  if (!puzzle.categories.length) return null

  return (
    <div className="mb-4">
      <div className="font-medium mb-2 text-gray-900 dark:text-gray-100">Motivy:</div>
      <div className="flex flex-wrap gap-2">
        {puzzle.categories.map(categoryName => {
          const category = categories?.find(c => c.name === categoryName)
          return category ? (
            <button
              key={categoryName}
              onClick={() => onFilter('category', categoryName)}
              className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-900/70"
            >
              <span className="text-lg mr-1.5">{category.emoji}</span>
              {category.name}
            </button>
          ) : null
        })}
      </div>
    </div>
  )
}