import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getEditions } from '../../lib/api/editions'
import { Search, BookOpen } from 'lucide-react'

interface EditionFilterProps {
  selectedEditions: number[]
  onFilterChange: (selected: number[]) => void
}

export function EditionFilter({
  selectedEditions,
  onFilterChange
}: EditionFilterProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const { data: editions } = useQuery({
    queryKey: ['editions'],
    queryFn: getEditions
  })

  const filteredEditions = editions?.filter((edition) =>
    edition.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    edition.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Hledat edice..."
          className="w-full pl-8 pr-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />
      </div>

      <div className="space-y-2 max-h-40 overflow-y-auto">
        {filteredEditions?.map((edition) => (
          <label key={edition.id} className="flex items-center">
            <input
              type="checkbox"
              checked={selectedEditions.includes(edition.id)}
              onChange={(e) => {
                const newSelected = e.target.checked
                  ? [...selectedEditions, edition.id]
                  : selectedEditions.filter((id) => id !== edition.id)
                onFilterChange(newSelected)
              }}
              className="form-checkbox text-indigo-600 dark:text-indigo-500"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              <BookOpen className="inline w-4 h-4 mr-1 text-indigo-500" />
              {edition.name}{' '}
              <span className="text-gray-400 dark:text-gray-500 whitespace-nowrap">
                ({edition.manufacturer}) ({edition.puzzleCount || 0})
              </span>
            </span>
          </label>
        ))}
      </div>
    </div>
  )
}