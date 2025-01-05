import { WishListItem } from '../types'

export interface WishListFilters {
  manufacturers: string[]
  categories: string[]
  tags: string[]
  sources: number[]
  priority: string[]
  inStock: boolean | null
  isReserved: boolean | null
  priceRange: {
    min: number | null
    max: number | null
  }
}

export const initialWishListFilters: WishListFilters = {
  manufacturers: [],
  categories: [],
  tags: [],
  sources: [],
  priority: [],
  inStock: null,
  isReserved: null,
  priceRange: {
    min: null,
    max: null
  }
}

export function applyWishListFilters(items: WishListItem[], filters: WishListFilters) {
  return items.filter(item => {
    if (filters.manufacturers.length > 0 && !filters.manufacturers.includes(item.manufacturer)) {
      return false
    }

    if (filters.categories.length > 0 && !filters.categories.some(cat => item.categories.includes(cat))) {
      return false
    }

    if (filters.tags.length > 0 && !filters.tags.some(tag => item.tags.includes(tag))) {
      return false
    }

    if (filters.sources.length > 0 && (!item.source || !filters.sources.includes(item.source.id))) {
      return false
    }

    if (filters.priority.length > 0 && !filters.priority.includes(item.priority)) {
      return false
    }

    if (filters.inStock !== null && item.in_stock !== filters.inStock) {
      return false
    }

    if (filters.isReserved !== null) {
      const hasReservation = !!item.reservation
      if (filters.isReserved !== hasReservation) {
        return false
      }
    }

    if (filters.priceRange.min !== null && item.price < filters.priceRange.min) {
      return false
    }

    if (filters.priceRange.max !== null && item.price > filters.priceRange.max) {
      return false
    }

    return true
  })
}

export function createWishListNavigationState(filters: Partial<WishListFilters>) {
  return {
    ...filters,
    searchTerm: '',
    // Vyčistit prázdné pole a null hodnoty
    ...(filters.manufacturers?.length ? { manufacturers: filters.manufacturers } : {}),
    ...(filters.categories?.length ? { categories: filters.categories } : {}),
    ...(filters.priority?.length ? { priority: filters.priority[0] } : {}),
    ...(filters.sources?.length ? { source: filters.sources[0] } : {}),
    ...(filters.priceRange?.min !== null ? { priceMin: filters.priceRange.min } : {}),
    ...(filters.priceRange?.max !== null ? { priceMax: filters.priceRange.max } : {})
  }
}