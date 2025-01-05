import { useState } from 'react'
import { Search, Store, Globe, User, Building2 } from 'lucide-react'
import type { SourceType } from '../../lib/types'

interface SourceFilterProps {
  sources: any[]
  selectedSources: number[]
  onFilterChange: (selected: number[]) => void
  wishlistCounts?: Record<string, number>
}

const sourceTypeConfig: Record<SourceType, { label: string; icon: typeof Store; color: string }> = {
  eshop: { label: 'E-shopy', icon: Globe, color: 'text-blue-500' },
  store: { label: 'Kamenné obchody', icon: Store, color: 'text-green-500' },
  person: { label: 'Osoby', icon: User, color: 'text-purple-500' },
  company: { label: 'Firmy', icon: Building2, color: 'text-orange-500' }
}

export function SourceFilter({
  sources,
  selectedSources,
  onFilterChange,
  wishlistCounts
}: SourceFilterProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredSources = sources.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Seskupení zdrojů podle typu
  const groupedSources = filteredSources.reduce((acc, source) => {
    if (!acc[source.type]) {
      acc[source.type] = []
    }
    acc[source.type].push(source)
    return acc
  }, {} as Record<SourceType, typeof sources>)

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Hledat zdroje..."
          className="w-full pl-8 pr-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />
      </div>

      <div className="space-y-4 max-h-40 overflow-y-auto">
        {(Object.keys(sourceTypeConfig) as SourceType[]).map(type => {
          const sourcesOfType = groupedSources[type] || []
          if (sourcesOfType.length === 0) return null

          const { label, icon: Icon, color } = sourceTypeConfig[type]

          return (
            <div key={type} className="space-y-1">
              <div className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                <Icon className={`w-4 h-4 ${color} mr-1`} />
                {label}
              </div>
              <div className="space-y-1 ml-6">
                {sourcesOfType.sort((a, b) => a.name.localeCompare(b.name, 'cs')).map((source) => (
                  <label key={source.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedSources.includes(source.id)}
                      onChange={(e) => {
                        const newSelected = e.target.checked
                          ? [...selectedSources, source.id]
                          : selectedSources.filter((id) => id !== source.id)
                        onFilterChange(newSelected)
                      }}
                      className="form-checkbox text-indigo-600 dark:text-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      {source.name}{' '}
                      <span className="text-gray-400 dark:text-gray-500">
                        ({wishlistCounts ? wishlistCounts[source.id] || 0 : source.puzzleCount || 0})
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}