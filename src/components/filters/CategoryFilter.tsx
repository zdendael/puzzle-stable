import { useState } from 'react'
import { Search } from 'lucide-react'

interface CategoryFilterProps {
  categories: any[]
  selectedCategories: string[]
  onFilterChange: (selected: string[]) => void
  wishlistCounts?: Record<string, number>
}

export function CategoryFilter({
  categories,
  selectedCategories,
  onFilterChange,
  wishlistCounts
}: CategoryFilterProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Hledat motivy..."
          className="w-full pl-8 pr-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />
      </div>

      <div className="space-y-2 max-h-40 overflow-y-auto">
        {filteredCategories.map((category) => (
          <label key={category.id} className="flex items-center">
            <input
              type="checkbox"
              checked={selectedCategories.includes(category.name)}
              onChange={(e) => {
                const newSelected = e.target.checked
                  ? [...selectedCategories, category.name]
                  : selectedCategories.filter((c) => c !== category.name)
                onFilterChange(newSelected)
              }}
              className="form-checkbox text-indigo-600 dark:text-indigo-500"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              {category.emoji} {category.name}{' '}
              <span className="text-gray-400 dark:text-gray-500">
                ({wishlistCounts ? wishlistCounts[category.name] || 0 : category.puzzleCount || 0})
              </span>
            </span>
          </label>
        ))}
      </div>
    </div>
  )
}