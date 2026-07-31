'use client'

import IconButton from '@/components/ui/IconButton'
import Rating from '@/components/ui/Rating'

export type ReviewsFilterBarProps = {
  rating: number | ''
  onRatingChange: (value: number | '') => void
}

const ReviewsFilterBar = ({ rating, onRatingChange }: ReviewsFilterBarProps) => (
  <div className='flex flex-col gap-1.5'>
    <span className='text-sm font-medium leading-5 text-textPrimary'>Filter by rating</span>
    <div className='flex h-10 items-center gap-1'>
      <Rating value={rating || 0} onChange={value => onRatingChange(value || '')} />
      {rating !== '' && (
        <IconButton size='sm' aria-label='Clear rating filter' onClick={() => onRatingChange('')}>
          <i className='tabler-x' />
        </IconButton>
      )}
    </div>
  </div>
)

export default ReviewsFilterBar
