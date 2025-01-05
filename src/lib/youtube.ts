import { toast } from 'react-hot-toast'

const API_KEY = 'AIzaSyCqXthR8LiP3W5ctjqu_T722a5falxfEn8'

interface YouTubeVideo {
  id: string
  title: string
  description: string
  publishedAt: Date
  thumbnailUrl: string
  viewCount: number
  likeCount: number
  commentCount: number
}

export async function getVideoDetails(videoId: string): Promise<YouTubeVideo | null> {
  const maxRetries = 3
  let retryCount = 0
  let lastError: Error | null = null

  while (retryCount < maxRetries) {
    try {
      const response = await Promise.race([
        fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoId}&key=${API_KEY}`
        ),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 10000)
        )
      ])

      if (!response.ok) {
        throw new Error(`YouTube API vrátilo chybu: ${response.status}`)
      }

      const data = await response.json()
      
      if (!data.items?.[0]) {
        console.warn(`Video ${videoId} nebylo nalezeno`)
        return null
      }

      const video = data.items[0]
      return {
        id: video.id,
        title: video.snippet.title,
        description: video.snippet.description,
        publishedAt: new Date(video.snippet.publishedAt),
        thumbnailUrl: video.snippet.thumbnails.maxres?.url || 
                     video.snippet.thumbnails.high?.url ||
                     video.snippet.thumbnails.medium?.url,
        viewCount: parseInt(video.statistics.viewCount) || 0,
        likeCount: parseInt(video.statistics.likeCount) || 0,
        commentCount: parseInt(video.statistics.commentCount) || 0
      }
    } catch (error) {
      console.error(`Pokus ${retryCount + 1}/${maxRetries} selhal:`, error)
      lastError = error as Error
      retryCount++
      
      if (retryCount < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)))
        continue
      }
      
      console.error('Chyba při načítání dat z YouTube po všech pokusech:', lastError)
      return null // Tichý fail pro lepší UX
    }
  }
  
  return null
}

export function getVideoIdFromUrl(url: string): string | null {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/)
  return match ? match[1] : null
}

export function formatViewCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M zhlédnutí`
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K zhlédnutí`
  }
  return `${count} zhlédnutí`
}

export function getYoutubeThumbnailUrl(videoId: string): string {
  // Vrátíme URL pro nejvyšší dostupnou kvalitu
  return `https://i.ytimg.com/vi/${videoId}/sddefault.jpg`
}

// Záložní URL pro případ, že maxresdefault není dostupný
export function getYoutubeFallbackThumbnailUrl(videoId: string): string {
  // Vrátíme URL pro nižší kvalitu
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
}