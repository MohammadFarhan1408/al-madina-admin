'use client'

import Select from '@/components/ui/form/Select'

export type ReviewsFilterBarProps = {
  rating: number | ''
  onRatingChange: (value: number | '') => void
}

const RATING_OPTIONS = [5, 4, 3, 2, 1].map(n => ({ label: `${n} star${n === 1 ? '' : 's'}`, value: String(n) }))

const ReviewsFilterBar = ({ rating, onRatingChange }: ReviewsFilterBarProps) => (
  <Select
    aria-label='Filter by rating'
    value={rating === '' ? '' : String(rating)}
    onChange={e => onRatingChange(e.target.value === '' ? '' : Number(e.target.value))}
    icon={<i className='tabler-star' />}
    placeholder='All ratings'
    containerClassName='w-full sm:w-48'
    options={RATING_OPTIONS}
  />
)

export default ReviewsFilterBar
