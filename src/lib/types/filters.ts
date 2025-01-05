import type { CollectionFilter } from '../../pages/PuzzlesPage'

export interface FilterRange<T> {
  min: T | null
  max: T | null
}

export interface DateRange {
  from: string | null
  to: string | null
}

export interface Filters {
  pieces: number[]
  difficulties: string[]
  ratingRange: FilterRange<number>
  collectionStatus: CollectionFilter
  isGift: boolean
  isCollaboration: boolean
  isOwnPurchase: boolean
  priceMin: number | null
  priceMax: number | null
  manufacturers: string[]
  categories: string[]
  tags: string[]
  sources: number[]
  editions: number[]
  dateRange: DateRange
  purchaseDateRange: DateRange
  sessionDuration: FilterRange<number>
  estimatedTimeRange: FilterRange<number>
}