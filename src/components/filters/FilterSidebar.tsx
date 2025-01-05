import { useState } from 'react'
import { ChevronLeft, ChevronRight, Filter, X } from 'lucide-react'
import { BasicFilters } from './BasicFilters'
import { AcquisitionFilters } from './AcquisitionFilters'
import { ManufacturerFilter } from './ManufacturerFilter'
import { CategoryFilter } from './CategoryFilter'
import { TagFilter } from './TagFilter'
import { DateFilter } from './DateFilter'
import { SourceFilter } from './SourceFilter'
import { SessionDurationFilter } from './SessionDurationFilter'
import { FilterSection } from './FilterSection'
import { RatingRangeFilter } from './RatingRangeFilter'
import { EditionFilter } from './EditionFilter'
import { EstimatedTimeFilter } from './EstimatedTimeFilter'
import { SIDEBAR_STYLES } from '../../lib/constants'
import { initialFilters } from '../../lib/constants/filters'
import type { Filters } from '../../lib/types/filters'

interface FilterSidebarProps {
  filters: Filters
  onFilterChange: (filters: Filters) => void
  manufacturers: any[]
  categories: any[]
  tags: any[]
  sources: any[]
}

export function FilterSidebar({ 
  filters, 
  onFilterChange, 
  manufacturers, 
  categories, 
  tags, 
  sources
}: FilterSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [openSections, setOpenSections] = useState<string[]>(['Počet dílků a obtížnost'])

  const handleResetAll = () => {
    onFilterChange(initialFilters)
    setOpenSections(['Počet dílků a obtížnost'])
  }

  const handleSectionToggle = (title: string, isOpen: boolean) => {
    if (isOpen) {
      setOpenSections([...openSections, title])
    } else {
      setOpenSections(openSections.filter(section => section !== title))
    }
  }

  const isFiltered = filters.pieces.length > 0 || 
    filters.difficulties.length > 0 || 
    filters.ratingRange.min !== null || 
    filters.ratingRange.max !== null ||
    filters.collectionStatus !== 'all' ||
    filters.isGift || 
    filters.isCollaboration || 
    filters.isOwnPurchase || 
    filters.priceMin !== null || 
    filters.priceMax !== null || 
    filters.manufacturers.length > 0 || 
    filters.categories.length > 0 || 
    filters.tags.length > 0 || 
    filters.sources.length > 0 ||
    filters.editions.length > 0 ||
    filters.dateRange.from !== null || 
    filters.dateRange.to !== null || 
    filters.purchaseDateRange.from !== null || 
    filters.purchaseDateRange.to !== null || 
    filters.sessionDuration.min !== null || 
    filters.sessionDuration.max !== null ||
    filters.estimatedTimeRange.min !== null ||
    filters.estimatedTimeRange.max !== null

  const filterContent = (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-indigo-100 dark:border-indigo-900/20">
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-gray-900 dark:text-white">Filtry</h2>
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
            title="Počet dílků a obtížnost"
            defaultOpen={openSections.includes("Počet dílků a obtížnost")}
            onToggle={(isOpen) => handleSectionToggle("Počet dílků a obtížnost", isOpen)}
          >
            <BasicFilters
              filters={filters}
              onFilterChange={onFilterChange}
            />
          </FilterSection>

          <FilterSection
            title="Hodnocení"
            defaultOpen={openSections.includes("Hodnocení")}
            onToggle={(isOpen) => handleSectionToggle("Hodnocení", isOpen)}
          >
            <RatingRangeFilter
              ratingRange={filters.ratingRange}
              onFilterChange={(range) =>
                onFilterChange({ ...filters, ratingRange: range })
              }
            />
          </FilterSection>

          <FilterSection
            title="Předpokládaná doba"
            defaultOpen={openSections.includes("Předpokládaná doba")}
            onToggle={(isOpen) => handleSectionToggle("Předpokládaná doba", isOpen)}
          >
            <EstimatedTimeFilter
              value={filters.estimatedTimeRange}
              onChange={(range) =>
                onFilterChange({ ...filters, estimatedTimeRange: range })
              }
            />
          </FilterSection>

          <FilterSection
            title="Způsob získání"
            defaultOpen={openSections.includes("Způsob získání")}
            onToggle={(isOpen) => handleSectionToggle("Způsob získání", isOpen)}
          >
            <AcquisitionFilters
              filters={filters}
              onFilterChange={onFilterChange}
            />
          </FilterSection>

          <FilterSection
            title="Výrobci"
            defaultOpen={openSections.includes("Výrobci")}
            onToggle={(isOpen) => handleSectionToggle("Výrobci", isOpen)}
          >
            <ManufacturerFilter
              manufacturers={manufacturers}
              selectedManufacturers={filters.manufacturers}
              onFilterChange={(selected) =>
                onFilterChange({ ...filters, manufacturers: selected })
              }
            />
          </FilterSection>

          <FilterSection
            title="Edice"
            defaultOpen={openSections.includes("Edice")}
            onToggle={(isOpen) => handleSectionToggle("Edice", isOpen)}
          >
            <EditionFilter
              selectedEditions={filters.editions}
              onFilterChange={(selected) =>
                onFilterChange({ ...filters, editions: selected })
              }
            />
          </FilterSection>

          <FilterSection
            title="Motivy"
            defaultOpen={openSections.includes("Motivy")}
            onToggle={(isOpen) => handleSectionToggle("Motivy", isOpen)}
          >
            <CategoryFilter
              categories={categories}
              selectedCategories={filters.categories}
              onFilterChange={(selected) =>
                onFilterChange({ ...filters, categories: selected })
              }
            />
          </FilterSection>

          <FilterSection
            title="Štítky"
            defaultOpen={openSections.includes("Štítky")}
            onToggle={(isOpen) => handleSectionToggle("Štítky", isOpen)}
          >
            <TagFilter
              tags={tags}
              selectedTags={filters.tags}
              onFilterChange={(selected) =>
                onFilterChange({ ...filters, tags: selected })
              }
            />
          </FilterSection>

          <FilterSection
            title="Zdroje"
            defaultOpen={openSections.includes("Zdroje")}
            onToggle={(isOpen) => handleSectionToggle("Zdroje", isOpen)}
          >
            <SourceFilter
              sources={sources}
              selectedSources={filters.sources}
              onFilterChange={(selected) =>
                onFilterChange({ ...filters, sources: selected })
              }
            />
          </FilterSection>

          <FilterSection
            title="Datum přidání"
            defaultOpen={openSections.includes("Datum přidání")}
            onToggle={(isOpen) => handleSectionToggle("Datum přidání", isOpen)}
          >
            <DateFilter
              dateRange={filters.dateRange}
              onFilterChange={(range) =>
                onFilterChange({ ...filters, dateRange: range })
              }
            />
          </FilterSection>

          <FilterSection
            title="Datum nákupu"
            defaultOpen={openSections.includes("Datum nákupu")}
            onToggle={(isOpen) => handleSectionToggle("Datum nákupu", isOpen)}
          >
            <DateFilter
              dateRange={filters.purchaseDateRange}
              onFilterChange={(range) =>
                onFilterChange({ ...filters, purchaseDateRange: range })
              }
            />
          </FilterSection>

          <FilterSection
            title="Doba skládání"
            defaultOpen={openSections.includes("Doba skládání")}
            onToggle={(isOpen) => handleSectionToggle("Doba skládání", isOpen)}
          >
            <SessionDurationFilter
              durationRange={filters.sessionDuration}
              onFilterChange={(range) =>
                onFilterChange({ ...filters, sessionDuration: range })
              }
            />
          </FilterSection>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <div
        className={`${SIDEBAR_STYLES.container} ${
          isCollapsed ? SIDEBAR_STYLES.width.collapsed : SIDEBAR_STYLES.width.expanded
        }`}
      >
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={SIDEBAR_STYLES.toggleButton}
          title={isCollapsed ? "Zobrazit filtry" : "Skrýt filtry"}
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