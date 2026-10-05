import EmptyState from '@/components/ui/EmptyState'
import Skeleton from '@/components/ui/Skeleton'
import { formatCurrency } from '@/libs/format'
import type { TopProduct } from '@/features/dashboard/types'

type TopProductsListProps = {
  products?: TopProduct[]
  isLoading: boolean
}

const TopProductsList = ({ products, isLoading }: TopProductsListProps) => {
  if (isLoading) {
    return (
      <ul className='flex flex-col gap-3'>
        {[...Array(3)].map((_, i) => (
          <li key={i} className='flex items-center gap-3'>
            <Skeleton variant='block' className='size-10' />
            <div className='flex flex-1 flex-col gap-1.5'>
              <Skeleton className='w-3/5' />
              <Skeleton className='h-3 w-1/3' />
            </div>
          </li>
        ))}
      </ul>
    )
  }

  if (!products?.length) {
    return (
      <EmptyState
        size='sm'
        icon='tabler-chart-bar-off'
        title='No sales yet'
        description='Your best sellers will appear here once orders start coming in.'
      />
    )
  }

  const maxUnitsSold = Math.max(...products.map(product => product.unitsSold), 1)

  return (
    <ul className='flex flex-col gap-4'>
      {products.map(product => (
        <li key={product.id ?? product.name} className='flex items-center gap-3'>
          {product.image ? (
            <img src={product.image} alt='' className='size-10 shrink-0 rounded-md border border-border object-cover' />
          ) : (
            <span aria-hidden className='size-10 shrink-0 rounded-md bg-secondary/15' />
          )}
          <div className='flex min-w-0 flex-1 flex-col gap-1'>
            <div className='flex items-baseline justify-between gap-2'>
              <span className='truncate text-sm text-textPrimary'>{product.name}</span>
              <span className='shrink-0 text-sm font-medium tabular-nums text-textPrimary'>
                {formatCurrency(product.revenue)}
              </span>
            </div>
            <div className='flex items-center gap-2'>
              <div className='h-1.5 flex-1 overflow-hidden rounded-full bg-actionHover'>
                <div
                  className='h-full rounded-full bg-primary'
                  style={{ width: `${(product.unitsSold / maxUnitsSold) * 100}%` }}
                />
              </div>
              <span className='shrink-0 text-xs text-textMuted'>{product.unitsSold} sold</span>
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}

export default TopProductsList
