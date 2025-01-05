import { useState } from 'react'
import { ChevronLeft, ChevronRight, Filter } from 'lucide-react'
import { BasicFilters } from '../filters/BasicFilters'
import { useLocation } from 'react-router-dom'
import { ManufacturerFilter } from '../filters/ManufacturerFilter'
import { CategoryFilter } from '../filters/CategoryFilter'
import { TagFilter } from '../filters/TagFilter'
import { SourceFilter } from '../filters/SourceFilter'
import { FilterSection } from '../filters/FilterSection'
import { WishListFilters } from '../../lib/filters/wishlistFilters'

interface WishListSidebarProps {
  filters: WishListFilters
  onFilterChange: (filters: WishListFilters) => void
  manufacturers: any[]
  categories: any[]
  tags: any[]
  sources: any[]
  items: any[] // Přidáno pro správné počítání
}

export function WishListSidebar({
  filters,
  onFilterChange,
  manufacturers,
  categories,
  tags,
  sources,
  items
}: WishListSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const location = useLocation()
  const [openSections, setOpenSections] = useState<string[]>(['Základní filtry'])

  // Počítání výskytů pouze pro aktivní položky
  const activeItems = items.filter(i => !i.deleted_at)

  const manufacturerCounts = items.reduce((acc, item) => {
    if (item.manufacturer) {
      acc[item.manufacturer] = (acc[item.manufacturer] || 0) + 1
    }
    return acc
  }, {})

  const categoryCounts = items.reduce((acc, item) => {
    item.categories.forEach(cat => {
      acc[cat] = (acc[cat] || 0) + 1
    })
    return acc
  }, {})

  const tagCounts = items.reduce((acc, item) => {
    item.tags.forEach(tag => {
      acc[tag] = (acc[tag] || 0) + 1
    })
    return acc
  }, {})

  const sourceCounts = items.reduce((acc, item) => {
    if (item.source?.id) {
      acc[item.source.id] = (acc[item.source.id] || 0) + 1
    }
    return acc
  }, {})

  const handleResetAll = () => {
    onFilterChange({
      manufacturers: [],
      categories: [],
      tags: [],
      sources: [],
      priority: [],
      inStock: null,
      isReserved: null,
      priceRange: { min: null, max: null }
    })
    // Vyčistit location state při resetu filtrů
    window.history.replaceState({}, document.title)
    setOpenSections(['Základní filtry'])
  }

  const handleSectionToggle = (title: string, isOpen: boolean) => {
    if (isOpen) {
      setOpenSections([...openSections, title])
    } else {
      setOpenSections(openSections.filter(section => section !== title))
    }
  }

  return (
    <div
      className={`bg-indigo-50 dark:bg-indigo-900/10 border-r border-indigo-100 dark:border-indigo-900/20 h-[calc(100vh-64px)] sticky top-0 transition-all duration-300 ${
        isCollapsed ? 'w-12' : 'w-80'
      }`}
    >
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full p-1 shadow-sm"
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

      {!isCollapsed && (
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-indigo-100 dark:border-indigo-900/20">
            <div className="flex justify-between items-center">
              <h2 className="font-semibold text-gray-900 dark:text-white">Filtry</h2>
              <button
                onClick={handleResetAll}
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
              >
                Zrušit vše
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800">
            <div className="p-4 space-y-2">
              <FilterSection
                title="Priorita"
                defaultOpen={openSections.includes('Priorita')}
                onToggle={(isOpen) => handleSectionToggle('Priorita', isOpen)}
              >
                <div className="space-y-2">
                  {['high', 'medium', 'low'].map((priority) => (
                    <label key={priority} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.priority.includes(priority)}
                        onChange={(e) => {
                          const newPriority = e.target.checked
                            ? [...filters.priority, priority]
                            : filters.priority.filter((p: string) => p !== priority)
                          onFilterChange({ ...filters, priority: newPriority })
                        }}
                        className="form-checkbox text-indigo-600 dark:text-indigo-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        {priority === 'high'
                          ? 'Vysoká priorita'
                          : priority === 'medium'
                          ? 'Střední priorita'
                          : 'Nízká priorita'}
                      </span>
                    </label>
                  ))}
                </div>
              </FilterSection>

              <FilterSection
                title="Skladem"
                defaultOpen={openSections.includes('Skladem')}
                onToggle={(isOpen) => handleSectionToggle('Skladem', isOpen)}
              >
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={filters.inStock === true}
                      onChange={() => onFilterChange({ ...filters, inStock: true })}
                      className="form-radio text-indigo-600 dark:text-indigo-500"
                      name="inStock"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Skladem
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={filters.inStock === false}
                      onChange={() => onFilterChange({ ...filters, inStock: false })}
                      className="form-radio text-indigo-600 dark:text-indigo-500"
                      name="inStock"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Není skladem
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={filters.inStock === null}
                      onChange={() => onFilterChange({ ...filters, inStock: null })}
                      className="form-radio text-indigo-600 dark:text-indigo-500"
                      name="inStock"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Vše
                    </span>
                  </label>
                </div>
              </FilterSection>

              <FilterSection
                title="Rezervace"
                defaultOpen={openSections.includes('Rezervace')}
                onToggle={(isOpen) => handleSectionToggle('Rezervace', isOpen)}
              >
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={filters.isReserved === true}
                      onChange={() => onFilterChange({ ...filters, isReserved: true })}
                      className="form-radio text-indigo-600 dark:text-indigo-500"
                      name="isReserved"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Rezervované
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={filters.isReserved === false}
                      onChange={() => onFilterChange({ ...filters, isReserved: false })}
                      className="form-radio text-indigo-600 dark:text-indigo-500"
                      name="isReserved"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Nerezervované
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={filters.isReserved === null}
                      onChange={() => onFilterChange({ ...filters, isReserved: null })}
                      className="form-radio text-indigo-600 dark:text-indigo-500"
                      name="isReserved"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Vše
                    </span>
                  </label>
                </div>
              </FilterSection>

              <FilterSection
                title="Výrobci"
                defaultOpen={openSections.includes('Výrobci')}
                onToggle={(isOpen) => handleSectionToggle('Výrobci', isOpen)}
              >
                <ManufacturerFilter
                  manufacturers={manufacturers}
                  selectedManufacturers={filters.manufacturers}
                  onFilterChange={(selected) =>
                    onFilterChange({ ...filters, manufacturers: selected })
                  }
                  wishlistCounts={manufacturerCounts}
                />
              </FilterSection>

              <FilterSection
                title="Motivy"
                defaultOpen={openSections.includes('Motivy')}
                onToggle={(isOpen) => handleSectionToggle('Motivy', isOpen)}
              >
                <CategoryFilter
                  categories={categories}
                  selectedCategories={filters.categories}
                  onFilterChange={(selected) =>
                    onFilterChange({ ...filters, categories: selected })
                  }
                  wishlistCounts={categoryCounts}
                />
              </FilterSection>

              <FilterSection
                title="Štítky"
                defaultOpen={openSections.includes('Štítky')}
                onToggle={(isOpen) => handleSectionToggle('Štítky', isOpen)}
              >
                <TagFilter
                  tags={tags}
                  selectedTags={filters.tags}
                  onFilterChange={(selected) =>
                    onFilterChange({ ...filters, tags: selected })
                  }
                  wishlistCounts={tagCounts}
                />
              </FilterSection>

              <FilterSection
                title="Zdroje"
                defaultOpen={openSections.includes('Zdroje')}
                onToggle={(isOpen) => handleSectionToggle('Zdroje', isOpen)}
              >
                <SourceFilter
                  sources={sources}
                  selectedSources={filters.sources}
                  onFilterChange={(selected) =>
                    onFilterChange({ ...filters, sources: selected })
                  }
                  wishlistCounts={sourceCounts}
                />
              </FilterSection>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}