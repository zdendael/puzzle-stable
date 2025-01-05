export interface ScraperConfig {
  selectors: {
    image: string
    inStock: string
  }
  transforms: {
    price: (value: string | number) => number
    pieces: (value: string) => number
    manufacturer: (value: string) => string
    inStock: (value: string) => boolean
    imageUrl: (url: string, baseUrl: string) => string
  }
}

export interface ScrapedData {
  name: string
  manufacturer: string
  pieces: number
  price: number
  image_url: string
  in_stock: boolean
  url: string
}