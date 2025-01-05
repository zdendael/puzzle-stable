import { useState } from 'react'
import { ChevronLeft, ChevronRight, Filter, X } from 'lucide-react'
import { FilterSection } from './FilterSection'
import { SIDEBAR_STYLES } from '../../lib/constants'

interface SourcesSidebarProps {
  filters: {
    types: string[]
    isCollaboration: boolean | null
    puzzleCount: { min: number | null; max: number | null }
  }
  onFilterChange: (filters: any) => void
  totalCount?: number
  filteredCount?: number
}

export function SourcesSidebar({
  filters,
  onFilterChange,
  totalCount,
  filteredCount
}: SourcesSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [openSections, setOpenSections] = useState<string[]>(['Základní filtry'])

  const handleResetAll = () => {
    onFilterChange({
      types: [],
      isCollaboration: null,
      puzzleCount: { min: null, max: null }
    })
    setOpenSections(['Základní filtry'])
  }

  const handleSectionToggle = (title: string, isOpen: boolean) => {
    if (isOpen) {
      setOpenSections([...openSections, title])
    } else {
      setOpenSections(openSections.filter(section => section !== title))
    }
  }

  const isFiltered = filters.types?.length > 0 || 
    filters.isCollaboration !== null || 
    filters.puzzleCount?.min !== null || 
    filters.puzzleCount?.max !== null

  const filterContent = (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-indigo-100 dark:border-indigo-900/20">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-gray-900 dark:text-white">Filtry</h2>
            {isFiltered && filteredCount !== undefined && totalCount !== undefined && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                ({filteredCount} z {totalCount})
              </span>
            )}
          </div>
          {isFiltered && (
            <button
              onClick={handleResetAll}
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
            >
              Zrušit vše
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800">
        <div className="p-4 space-y-2">
          <FilterSection
            title="Typ zdroje" 
            defaultOpen={openSections.includes("Typ zdroje")}
            onToggle={(isOpen) => handleSectionToggle("Typ zdroje", isOpen)}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
              {[
                { value: 'eshop', label: 'E-shopy' },
                { value: 'store', label: 'Kamenné obchody' },
                { value: 'person', label: 'Osoby' },
                { value: 'company', label: 'Firmy' }
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => {
                    const newTypes = filters.types.includes(value)
                      ? filters.types.filter(t => t !== value)
                      : [...filters.types, value]
                    onFilterChange({ ...filters, types: newTypes })
                  }}
                  className={`px-2 py-1 text-xs rounded-md ${
                    filters.types.includes(value) ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200' : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </FilterSection>

          <FilterSection
            title="Spolupráce" 
            defaultOpen={openSections.includes("Spolupráce")}
            onToggle={(isOpen) => handleSectionToggle("Spolupráce", isOpen)}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
              {[
                { value: true, label: 'Spolupráce', color: 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200' },
                { value: false, label: 'Bez spolupráce', color: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200' },
                { value: null, label: 'Vše', color: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200' }
              ].map(({ value, label, color }) => (
                <button
                  key={String(value)}
                  onClick={() => onFilterChange({ ...filters, isCollaboration: value })}
                  className={`px-2 py-1 text-xs rounded-md ${
                    filters.isCollaboration === value
                      ? color
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </FilterSection>

          <FilterSection
            title="Počet puzzlí" 
            defaultOpen={openSections.includes("Počet puzzlí")}
            onToggle={(isOpen) => handleSectionToggle("Počet puzzlí", isOpen)}
          >
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={filters.puzzleCount.min || ''}
                  onChange={(e) =>
                    onFilterChange({
                      ...filters,
                      puzzleCount: {
                        ...filters.puzzleCount,
                        min: e.target.value ? Number(e.target.value) : null
                      }
                    })
                  }
                  placeholder="Od"
                  className="w-24 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <span className="text-gray-700 dark:text-gray-300">-</span>
                <input
                  type="number"
                  value={filters.puzzleCount.max || ''}
                  onChange={(e) =>
                    onFilterChange({
                      ...filters,
                      puzzleCount: {
                        ...filters.puzzleCount,
                        max: e.target.value ? Number(e.target.value) : null
                      }
                    })
                  }
                  placeholder="Do"
                  className="w-24 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              {(filters.puzzleCount.min !== null || filters.puzzleCount.max !== null) && (
                <button
                  onClick={() =>
                    onFilterChange({
                      ...filters,
                      puzzleCount: { min: null, max: null }
                    })
                  }
                  className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                >
                  Zrušit filtr
                </button>
              )}
            </div>
          </FilterSection>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop verze */}
      <div
        className={`${SIDEBAR_STYLES.container} ${
          isCollapsed ? SIDEBAR_STYLES.width.collapsed : SIDEBAR_STYLES.width.expanded
        }`}
      >
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={SIDEBAR_STYLES.toggleButton}
          title={isCollapsed ? 'Zobrazit filtry' : 'Skrýt filtry'}
        >
          {isCollapsed ? (
            <div className="flex flex-col items-center">
              <Filter className="w-4 h-4 text-gray-600 dark:text-gray-400 mb-1" />
              <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </div>
          ) : (
            <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          )}
        </button>

        {!isCollapsed && filterContent}
      </div>

      {/* Mobilní verze */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="md:hidden fixed bottom-4 right-4 z-50 bg-indigo-600 text-white p-4 rounded-full shadow-lg"
      >
        <Filter className="w-6 h-6" />
      </button>

      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-gray-900/50">
          <div className="fixed inset-y-0 right-0 w-full max-w-xs bg-white dark:bg-gray-800 shadow-xl">
            <div className="absolute top-0 right-0 p-4">
              <button
                onClick={() => setIsMobileOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            {filterContent}
          </div>
        </div>
      )}
    </>
  )
}