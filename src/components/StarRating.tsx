import { Star } from 'lucide-react'

interface StarRatingProps {
  rating?: number
  onChange?: (rating: number) => void
  readonly?: boolean
  size?: 'sm' | 'md'
}

export function StarRating({ rating, onChange, readonly = false, size = 'md' }: StarRatingProps) {
  const stars = [1, 2, 3, 4, 5]

  const starSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'

  return (
    <div className="flex">
      {stars.map((star) => (
        <div
          key={star}
          onClick={() => !readonly && onChange?.(star)}
          className={`${readonly ? 'cursor-default' : 'cursor-pointer'} p-0.5 focus:outline-none`}
        >
          <Star
            className={`${starSize} ${
              (rating ?? 0) >= star
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-gray-200 text-gray-200'
            } ${!readonly && 'hover:fill-yellow-400 hover:text-yellow-400'}`}
          />
        </div>
      ))}
    </div>
  )
}