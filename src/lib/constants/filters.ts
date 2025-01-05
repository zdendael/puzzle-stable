import type { Filters } from '../types/filters'

export const initialFilters: Filters = {
  pieces: [],
  difficulties: [],
  ratingRange: { min: null, max: null },
  collectionStatus: 'all',
  isGift: false,
  isCollaboration: false,
  isOwnPurchase: false,
  priceMin: null,
  priceMax: null,
  manufacturers: [],
  categories: [],
  tags: [],
  sources: [],
  editions: [],
  dateRange: { from: null, to: null },
  purchaseDateRange: { from: null, to: null },
  sessionDuration: { min: null, max: null },
  estimatedTimeRange: { min: null, max: null }
}