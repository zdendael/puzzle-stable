import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getPuzzles, getTags, getCategories, getWishList } from '../lib/api'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { ErrorMessage } from '../components/ErrorMessage'
import { StatisticsSidebar } from '../components/statistics/StatisticsSidebar'
import { CollectionOverview } from '../components/statistics/CollectionOverview'
import { SessionsOverview } from '../components/statistics/SessionsOverview'
import { RatingsOverview } from '../components/statistics/RatingsOverview'
import { ManufacturersMapOverview } from '../components/statistics/ManufacturersMapOverview'
import { CollaborationOverview } from '../components/statistics/CollaborationOverview'
import { WishListOverview } from '../components/statistics/WishListOverview'
import { FinancialOverview } from '../components/statistics/FinancialOverview'
import { CollectionToggle } from '../components/statistics/CollectionToggle'

export function StatisticsPage() {
  const [activeSection, setActiveSection] = useState('overview')
  const [showAll, setShowAll] = useState(false)

  const { data: puzzles, isLoading: isPuzzlesLoading, error: puzzlesError } = useQuery({
    queryKey: ['puzzles'],
    queryFn: getPuzzles,
    select: (data) => data || []
  })

  const { data: tags, isLoading: isTagsLoading } = useQuery({
    queryKey: ['tags'],
    queryFn: getTags,
    select: (data) => data || []
  })

  const { data: categories, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    select: (data) => data || []
  })

  const { data: wishlist = [], isLoading: isWishlistLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: getWishList
  })

  const isLoading = isPuzzlesLoading || isTagsLoading || isCategoriesLoading || isWishlistLoading
  if (isLoading) return <LoadingSpinner />
  if (puzzlesError) return <ErrorMessage message="Nepodařilo se načíst data" />

  // Ensure arrays are always defined
  const puzzlesData = puzzles || []
  const tagsData = tags || []
  const categoriesData = categories || []
  const wishlistData = wishlist || []

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return <CollectionOverview puzzles={puzzlesData} categories={categoriesData} showAll={showAll} />
      case 'manufacturers':
        return <ManufacturersMapOverview puzzles={puzzlesData} />
      case 'collaborations':
        return <CollaborationOverview puzzles={puzzlesData} />
      case 'wishlist':
        return <WishListOverview items={wishlistData} categories={categoriesData} />
      case 'sessions':
        return <SessionsOverview puzzles={puzzlesData} />
      case 'ratings':
        return <RatingsOverview puzzles={puzzlesData} categories={categoriesData} tags={tagsData} />
      case 'financial':
        return <FinancialOverview puzzles={puzzlesData} />
      default:
        return null
    }
  }

  return (
    <div className="flex">
      <StatisticsSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      <div className="flex-1 px-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {activeSection === 'overview' && 'Přehled sbírky'}
            {activeSection === 'sessions' && 'Statistiky skládání'}
            {activeSection === 'ratings' && 'Hodnocení a oblíbenost'}
            {activeSection === 'collaborations' && 'Statistiky spoluprací'}
            {activeSection === 'wishlist' && 'Statistiky nákupního seznamu'}
            {activeSection === 'financial' && 'Finanční přehledy'}
          </h1>
          {activeSection === 'overview' && (
            <CollectionToggle showAll={showAll} onChange={setShowAll} />
          )}
        </div>

        {renderContent()}
      </div>
    </div>
  )
}