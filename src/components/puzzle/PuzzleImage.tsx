import { useState } from 'react'
import { ImageOff } from 'lucide-react'

interface PuzzleImageProps {
  imageUrl?: string | null
  name: string
}

export function PuzzleImage({ imageUrl, name }: PuzzleImageProps) {
  const [error, setError] = useState(false)

  if (!imageUrl || error) {
    return (
      <div className="w-full h-64 bg-gray-100 dark:bg-gray-900 rounded-lg flex items-center justify-center">
        <div className="text-center text-gray-400">
          <ImageOff className="w-8 h-8 mx-auto mb-2" />
          <span className="text-sm">Bez obrázku</span>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-64 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <img
        src={imageUrl}
        alt={name}
        className="max-w-full max-h-64 object-contain"
        onError={() => setError(true)}
        loading="lazy"
      />
    </div>
  )
}