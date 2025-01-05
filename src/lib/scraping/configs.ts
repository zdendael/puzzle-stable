import type { ScraperConfig } from './types'

export const scraperConfigs: Record<string, ScraperConfig> = {
  'skladejpuzzle.cz': {
    selectors: {
      name: 'h1.product-title',
      manufacturer: '.parameter-item:has(.parameter-label:contains("Výrobce")) .parameter-value',
      pieces: '.parameter-item:has(.parameter-label:contains("Počet dílků")) .parameter-value',
      image: '.product-detail-image img',
      inStock: '.availability',
      price: '.price-wrapper .price'
    },
    transforms: {
      price: (value: string | number) => {
        if (typeof value === 'number') return Math.round(value)
        const match = value.match(/[\d.,]+/)
        if (!match) return 0
        const num = parseFloat(match[0].replace(/\s/g, '').replace(',', '.'))
        return isNaN(num) ? 0 : Math.round(num)
      },
      pieces: (value: string) => {
        const match = value.match(/(\d+)/)
        return match ? parseInt(match[1]) : 0
      },
      manufacturer: (value: string) => {
        return value.trim()
      },
      inStock: (value: string) => {
        return value.toLowerCase().includes('skladem')
      },
      imageUrl: (url: string, baseUrl: string) => {
        if (!url) return ''
        try {
          const base = new URL(baseUrl)
          const fullUrl = url.startsWith('//') ? `https:${url}` : url
          return new URL(fullUrl, base.origin).toString()
        } catch {
          return url
        }
      }
    }
  }
}