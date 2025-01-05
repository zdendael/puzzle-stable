import { useState } from 'react'
import { Search } from 'lucide-react'

interface TagFilterProps {
  tags: any[]
  selectedTags: string[]
  onFilterChange: (selected: string[]) => void
  wishlistCounts?: Record<string, number>
}

export function TagFilter({
  tags,
  selectedTags,
  onFilterChange,
  wishlistCounts
}: TagFilterProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredTags = tags.filter((t) =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Hledat štítky..."
          className="w-full pl-8 pr-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />
      </div>

      <div className="space-y-2 max-h-40 overflow-y-auto">
        {filteredTags.map((tag) => (
          <label key={tag.id} className="flex items-center">
            <input
              type="checkbox"
              checked={selectedTags.includes(tag.name)}
              onChange={(e) => {
                const newSelected = e.target.checked
                  ? [...selectedTags, tag.name]
                  : selectedTags.filter((t) => t !== tag.name)
                onFilterChange(newSelected)
              }}
              className="form-checkbox text-indigo-600 dark:text-indigo-500"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              {tag.emoji} {tag.name}{' '}
              <span className="text-gray-400 dark:text-gray-500">
                ({wishlistCounts ? wishlistCounts[tag.name] || 0 : tag.puzzleCount || 0})
              </span>
            </span>
          </label>
        ))}
      </div>
    </div>
  )
}