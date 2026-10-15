import type { ReactNode } from 'react'

import classnames from 'classnames'

import Button from '@/components/ui/Button'
import Card, { CardBody, CardHeader, type CardPadding } from '@/components/ui/Card'
import EmptyState from '@/components/ui/EmptyState'
import Skeleton from '@/components/ui/Skeleton'

type ChartCardProps = {
  title: string
  icon?: string
  description?: ReactNode
  action?: ReactNode
  isLoading?: boolean

  /** Shown instead of the chart when there is nothing to plot. */
  empty?: { title: string; description?: string; icon?: string } | false

  /** The section's own request failed. Shown in place of the body with a
   *  Retry, so one failed request never blanks the rest of the page. */
  isError?: boolean
  errorMessage?: string
  onRetry?: () => void

  /** A refetch is in flight: the previous render stays, dimmed, rather than
   *  flashing back to a skeleton. */
  isRefetching?: boolean

  /** Loading placeholder shaped like the content. Defaults to a block the
   *  height of the plot. */
  skeleton?: ReactNode
  height?: number
  bodyPadding?: CardPadding
  className?: string
  children: ReactNode
}

/** Card shell for a chart or a dashboard section: header, a skeleton the shape
 *  of the content (so nothing reflows when data lands), a built-in empty state
 *  and a per-section error with Retry. The error is neutral rather than a red
 *  banner: when several sections share one failed request, a stack of
 *  identical alerts reads as an outage. */
const ChartCard = ({
  title,
  icon,
  description,
  action,
  isLoading,
  empty,
  isError,
  errorMessage,
  onRetry,
  isRefetching,
  skeleton,
  height = 240,
  bodyPadding = 'md',
  className,
  children
}: ChartCardProps) => (
  <Card className={classnames('flex min-w-0 flex-col', className)}>
    <CardHeader title={title} icon={icon} description={description} action={action} />
    <CardBody
      padding={isError || isLoading || empty ? 'md' : bodyPadding}
      aria-busy={isLoading || isRefetching || undefined}
      className='min-w-0 flex-1'
    >
      {isError ? (
        <EmptyState
          size='sm'
          icon='tabler-cloud-off'
          title={`Couldn’t load ${title.toLowerCase()}`}
          description={errorMessage || 'The request failed. Check your connection and try again.'}
          action={
            onRetry && (
              <Button
                size='sm'
                variant='outlined'
                color='secondary'
                startIcon={<i className='tabler-refresh' />}
                onClick={onRetry}
              >
                Retry
              </Button>
            )
          }
        />
      ) : isLoading ? (
        (skeleton ?? <Skeleton variant='block' className='w-full' style={{ height }} />)
      ) : empty ? (
        <EmptyState
          size='sm'
          icon={empty.icon ?? 'tabler-chart-bar-off'}
          title={empty.title}
          description={empty.description}
        />
      ) : (
        <div className={classnames('transition-opacity duration-150', isRefetching && 'opacity-60')}>{children}</div>
      )}
    </CardBody>
  </Card>
)

export default ChartCard
