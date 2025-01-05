import { useState } from 'react'
import { Youtube, ExternalLink } from 'lucide-react'
import { getYoutubeVideoId, getYoutubeThumbnailUrl } from '../../utils/youtube'

interface YouTubePreviewProps {
  url: string
  title: string
}

export function YouTubePreview({ url, title }: YouTubePreviewProps) {
  const [imageError, setImageError] = useState(false)
  const videoId = getYoutubeVideoId(url)
  
  if (!videoId) return null

  const thumbnailUrl = getYoutubeThumbnailUrl(videoId)

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block relative aspect-video rounded-lg overflow-hidden group"
      title={`Otevřít video "${title}" na YouTube`}
    >
      {!imageError ? (
        <img
          src={thumbnailUrl}
          alt={title}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <Youtube className="w-12 h-12 text-gray-400 dark:text-gray-600" />
        </div>
      )}
      
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center">
        <ExternalLink className="text-white opacity-0 group-hover:opacity-100 w-8 h-8" />
      </div>
    </a>
  )
}