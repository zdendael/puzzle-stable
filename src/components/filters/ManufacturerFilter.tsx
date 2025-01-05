import { useState } from 'react'
import { Search } from 'lucide-react'
import { COUNTRIES } from '../../lib/countries'

interface ManufacturerFilterProps {
  manufacturers: any[]
  selectedManufacturers: string[]
  onFilterChange: (selected: string[]) => void
  wishlistCounts?: Record<string, number>
}

export function ManufacturerFilter({
  manufacturers,
  selectedManufacturers,
  onFilterChange,
  wishlistCounts
}: ManufacturerFilterProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredManufacturers = manufacturers.filter((m) =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getCountryFlag = (countryCode: string) => {
    const country = COUNTRIES.find(c => c.code === countryCode)
    return country?.flag || ''
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Hledat výrobce..."
          className="w-full pl-8 pr-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />
      </div>

      <div className="space-y-2 max-h-40 overflow-y-auto">
        {filteredManufacturers.map((manufacturer) => (
          <label key={manufacturer.id} className="flex items-center">
            <input
              type="checkbox"
              checked={selectedManufacturers.includes(manufacturer.name)}
              onChange={(e) => {
                const newSelected = e.target.checked
                  ? [...selectedManufacturers, manufacturer.name]
                  : selectedManufacturers.filter((m) => m !== manufacturer.name)
                onFilterChange(newSelected)
              }}
              className="form-checkbox text-indigo-600 dark:text-indigo-500"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              {getCountryFlag(manufacturer.countryCode)} {manufacturer.name}{' '}
              <span className="text-gray-400 dark:text-gray-500">
                ({wishlistCounts ? wishlistCounts[manufacturer.name] || 0 : manufacturer.puzzleCount || 0})
              </span>
            </span>
          </label>
        ))}
      </div>
    </div>
  )
}