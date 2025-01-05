import type { Puzzle } from '../../lib/types'

interface PuzzleTagsProps {
  tags: any[]
  puzzle: Puzzle
  onFilter: (type: string, value: string) => void
}

export function PuzzleTags({ tags, puzzle, onFilter }: PuzzleTagsProps) {
  if (!puzzle.tags.length) return null

  return (
    <div className="mb-4">
      <div className="font-medium mb-2 text-gray-900 dark:text-gray-100">Štítky:</div>
      <div className="flex flex-wrap gap-2">
        {puzzle.tags.map(tagName => {
          const tag = tags?.find(t => t.name === tagName)
          return tag ? (
            <button
              key={tagName}
              onClick={() => onFilter('tag', tagName)}
              className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
              style={{
                backgroundColor: `${tag.color}20`,
                color: tag.color,
                ...(document.documentElement.classList.contains('dark') && {
                  backgroundColor: `${tag.color}40`,
                  color: `${tag.color}dd`
                })
              }}
            >
              <span className="text-lg mr-1.5">{tag.emoji}</span>
              {tag.name}
            </button>
          ) : null
        })}
      </div>
    </div>
  )
}