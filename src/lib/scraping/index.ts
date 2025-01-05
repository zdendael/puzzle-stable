import { scraperConfigs } from './configs'
import type { ScrapedData } from './types'

const CORS_PROXY = 'https://corsproxy.io/?'

export async function scrapePuzzle(url: string): Promise<ScrapedData> {
  try {
    // Kontrola podporovaného e-shopu
    const shopConfig = Object.entries(scraperConfigs).find(([domain]) => 
      url.toLowerCase().includes(domain.toLowerCase())
    )?.[1]

    if (!shopConfig) {
      throw new Error('Tento e-shop zatím není podporován')
    }

    // Načtení stránky přes CORS proxy
    const proxyUrl = `${CORS_PROXY}${encodeURIComponent(url)}`
    const response = await fetch(proxyUrl)
    if (!response.ok) {
      throw new Error(`Nepodařilo se načíst stránku (HTTP ${response.status})`)
    }

    const html = await response.text()
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')

    console.log('Scraping data from:', url)

    // Získání názvu
    const nameElement = doc.querySelector(shopConfig.selectors.name)
    const name = nameElement?.textContent?.trim()
    console.log('Found name:', name)
    if (!name) {
      throw new Error('Nepodařilo se načíst název puzzle')
    }

    // Získání výrobce
    const manufacturerElement = doc.querySelector(shopConfig.selectors.manufacturer)
    console.log('Found manufacturer element:', manufacturerElement?.textContent)
    const manufacturer = manufacturerElement ? shopConfig.transforms.manufacturer(manufacturerElement.textContent || '') : ''
    if (!manufacturer) {
      throw new Error('Nepodařilo se načíst výrobce')
    }

    // Získání počtu dílků
    const piecesElement = doc.querySelector(shopConfig.selectors.pieces)
    console.log('Found pieces element:', piecesElement?.textContent)
    const pieces = piecesElement ? shopConfig.transforms.pieces(piecesElement.textContent || '') : 0
    if (!pieces) {
      throw new Error('Nepodařilo se načíst počet dílků')
    }

    // Získání ceny
    const priceElement = doc.querySelector(shopConfig.selectors.price)
    console.log('Found price element:', priceElement?.textContent)
    const price = priceElement ? shopConfig.transforms.price(priceElement.textContent || '') : 0

    // Získání obrázku
    const imageElement = doc.querySelector(shopConfig.selectors.image)
    const imageUrl = imageElement?.getAttribute('src') || imageElement?.getAttribute('data-src')
    console.log('Found image URL:', imageUrl)
    if (!imageUrl) {
      throw new Error('Nepodařilo se načíst obrázek')
    }

    // Kontrola dostupnosti
    const stockElement = doc.querySelector(shopConfig.selectors.inStock)
    console.log('Found stock element:', stockElement?.textContent)
    const inStock = stockElement ? shopConfig.transforms.inStock(stockElement.textContent || '') : false

    // Sestavení dat
    const data: ScrapedData = {
      name: name.replace(/^Puzzle\s+/i, '').replace(/\s+\d+\s*dílků$/i, '').trim(),
      manufacturer,
      pieces,
      price,
      image_url: shopConfig.transforms.imageUrl(imageUrl, url),
      in_stock: inStock,
      url
    }

    console.log('Scraped data:', data)
    return data
  } catch (error) {
    console.error('Chyba při scrapování:', error)
    throw error instanceof Error ? error : new Error('Nepodařilo se načíst data z e-shopu')
  }
}