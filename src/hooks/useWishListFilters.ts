import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { WishListFilters, initialWishListFilters } from '../lib/filters/wishlistFilters'

interface LocationState {
  priority?: string
  manufacturers?: string[]
  categories?: string[]
  source?: number
  priceMin?: number
  priceMax?: number
  isReserved?: boolean
  inStock?: boolean
}

export function useWishListFilters() {
  const [filters, setFilters] = useState<WishListFilters>(initialWishListFilters)
  const location = useLocation()
  const locationState = location.state as LocationState | undefined

  useEffect(() => {
    if (locationState) {
      const newFilters = { ...initialWishListFilters }
      
      if (locationState.priority) {
        newFilters.priority = [locationState.priority.toLowerCase()]
      }
      if (locationState.manufacturers) {
        newFilters.manufacturers = locationState.manufacturers
      }
      if (locationState.categories) {
        newFilters.categories = locationState.categories
      }
      if (locationState.source) {
        newFilters.sources = [locationState.source]
      }
      if (locationState.isReserved !== undefined) {
        newFilters.isReserved = locationState.isReserved
      }
      if (locationState.inStock !== undefined) {
        newFilters.inStock = locationState.inStock
      }
      if (locationState.priceMin !== undefined || locationState.priceMax !== undefined) {
        newFilters.priceRange = {
          min: locationState.priceMin || null,
          max: locationState.priceMax || null
        }
      }
      
      setFilters(newFilters)
      // Vyčistit state po aplikování filtrů
      window.history.replaceState({}, document.title)
    }
  }, [locationState])

  const updateFilters = (newFilters: WishListFilters) => {
    setFilters(newFilters)
    // Vyčistit location state při změně filtrů
    if (JSON.stringify(newFilters) === JSON.stringify(initialWishListFilters)) {
      window.history.replaceState({}, document.title)
    }
  }

  return { filters, setFilters: updateFilters }
}