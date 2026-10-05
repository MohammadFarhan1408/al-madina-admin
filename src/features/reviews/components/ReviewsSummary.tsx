'use client'

import Card from '@/components/ui/Card'
import Rating from '@/components/ui/Rating'
import Skeleton from '@/components/ui/Skeleton'
import { useReviewSummary } from '../hooks/useReviews'

/** Average rating plus how many reviews sit at each star level. Counts are
 *  printed, so the bars are decoration, not the only carrier of the number. */
const ReviewsSummary = () => {
  const { data, isLoading } = useReviewSummary()

  if (isLoading) return <Skeleton variant='block' className='mb-4 h-32 w-full' />

  if (!data?.total) return null

  const max = Math.max(...Object.values(data.distribution), 1)

  return (
    <Card className='mb-4'>
      <div className='flex flex-col gap-5 px-5 py-4 sm:flex-row sm:items-center sm:gap-8'>
        <div className='flex flex-col items-start gap-1'>
          <span className='text-3xl font-semibold tabular-nums'>{data.average.toFixed(1)}</span>
          <Rating value={data.average} size='sm' />
          <span className='text-xs text-textMuted'>{data.total} reviews</span>
        </div>
        <ul className='flex flex-1 flex-col gap-1.5' aria-label='Reviews by rating'>
          {([5, 4, 3, 2, 1] as const).map(stars => (
            <li key={stars} className='flex items-center gap-3 text-xs'>
              <span className='w-10 shrink-0 text-textSecondary'>{stars} star</span>
              <div className='h-2 flex-1 overflow-hidden rounded-full bg-actionHover'>
                <div
                  className='h-full rounded-full bg-primaryInk'
                  style={{ width: `${(data.distribution[stars] / max) * 100}%` }}
                />
              </div>
              <span className='w-8 shrink-0 text-right tabular-nums text-textSecondary'>
                {data.distribution[stars]}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  )
}

export default ReviewsSummary
