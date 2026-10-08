import type { ReactNode } from 'react'

import Card, { CardBody, CardHeader } from '@/components/ui/Card'
import EmptyState from '@/components/ui/EmptyState'
import Skeleton from '@/components/ui/Skeleton'

type ChartCardProps = {
  title: string
  description?: string
  action?: ReactNode
  isLoading?: boolean

  /** Shown instead of the chart when there is nothing to plot. */
  empty?: { title: string; description?: string } | false
  height?: number
  className?: string
  children: ReactNode
}

/** Card shell for a chart: header, a skeleton the exact height of the plot
 *  (so nothing reflows when data lands) and a built-in empty state. */
const ChartCard = ({
  title,
  description,
  action,
  isLoading,
  empty,
  height = 240,
  className,
  children
}: ChartCardProps) => (
  <Card className={className}>
    <CardHeader title={title} description={description} action={action} />
    <CardBody>
      {isLoading ? (
        <Skeleton variant='block' className='w-full' style={{ height }} />
      ) : empty ? (
        <EmptyState size='sm' icon='tabler-chart-bar-off' title={empty.title} description={empty.description} />
      ) : (
        children
      )}
    </CardBody>
  </Card>
)

export default ChartCard
