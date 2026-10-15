import type { ReactNode } from 'react'

import Breadcrumbs from '@/components/shared/Breadcrumbs'
import PageHeader from '@/components/shared/PageHeader'
import QueryState from '@/components/shared/QueryState'
import Card, { CardBody } from '@/components/ui/Card'
import Skeleton from '@/components/ui/Skeleton'

type DetailLoadingProps = {

  /** Generic page title (e.g. "Product") — the record's own name isn't known yet. */
  title: string

  /** Same ← target the loaded page uses, so the way out is there while loading. */
  backHref: string
  backLabel?: string

  /** Shaped like the page that's coming, so nothing jumps when data lands. */
  skeleton: ReactNode
  isLoading: boolean
  isError: boolean
  error: unknown
  onRetry: () => void
  fallbackMessage: string
}

/** What a detail page renders until its record is there: the skeleton while
 *  loading, a retryable error if the fetch failed. */
const DetailLoading = ({
  title,
  backHref,
  backLabel,
  skeleton,
  isLoading,
  isError,
  error,
  onRetry,
  fallbackMessage
}: DetailLoadingProps) => (
  <>
    <Breadcrumbs />
    <PageHeader title={title} backHref={backHref} backLabel={backLabel} />
    {isLoading && !isError ? (
      skeleton
    ) : (
      <QueryState isError={isError} error={error} onRetry={onRetry} fallbackMessage={fallbackMessage} />
    )}
  </>
)

/** Skeleton for the image-left / facts-right hero card shared by the product,
 *  category and collection pages. */
export const DetailHeroSkeleton = ({ aspect = 'landscape' }: { aspect?: 'square' | 'landscape' }) => (
  <Card aria-hidden>
    <CardBody padding='lg' className='grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]'>
      <Skeleton variant='block' className={aspect === 'square' ? 'aspect-square w-full' : 'aspect-[4/3] w-full'} />
      <div className='flex flex-col gap-4'>
        <Skeleton className='h-7 w-2/3' />
        <Skeleton className='mt-4 h-20 w-full' />
        <Skeleton className='h-6 w-3/4' />
      </div>
    </CardBody>
  </Card>
)

export default DetailLoading
