import Link from 'next/link'

import Skeleton from '@/components/ui/Skeleton'
import { formatCurrency } from '@/libs/format'
import type { TopProduct } from '@/features/dashboard/types'

type TopProductsListProps = { products: TopProduct[] }

const Thumb = ({ src }: { src?: string }) =>
  src ? (
    <img src={src} alt='' className='size-10 shrink-0 rounded-md border border-border object-cover' />
  ) : (
    <span
      aria-hidden
      className='flex size-10 shrink-0 items-center justify-center rounded-md bg-secondary/15 text-secondaryDark'
    >
      <i className='tabler-perfume text-[18px]' />
    </span>
  )

/** Best sellers, ranked by sales revenue. Each row says both measures in words
 *  — the AED amount and the units — so neither is mistaken for the other; the
 *  thin bar is the revenue relative to the leader. A row links to the product
 *  when the order line still carries its id. */
const TopProductsList = ({ products }: TopProductsListProps) => {
  const top = Math.max(...products.map(p => p.revenue), 1)

  return (
    <div className='flex flex-col gap-3'>
      <ol className='flex flex-col'>
        {products.map((product, i) => {
          const body = (
            <>
              <span aria-hidden className='w-4 shrink-0 text-center text-xs font-medium text-textMuted'>
                {i + 1}
              </span>
              <Thumb src={product.image} />
              <span className='flex min-w-0 flex-1 flex-col gap-1'>
                <span className='flex items-baseline justify-between gap-3'>
                  <span className='truncate text-sm font-medium text-textPrimary'>{product.name}</span>
                  <span className='shrink-0 text-sm font-semibold tabular-nums text-textPrimary'>
                    {formatCurrency(product.revenue)}
                  </span>
                </span>
                <span className='flex items-center gap-3'>
                  <span aria-hidden className='h-1 flex-1 overflow-hidden rounded-full bg-actionHover'>
                    <span
                      className='block h-full rounded-full bg-primaryInk'
                      style={{ width: `${(product.revenue / top) * 100}%` }}
                    />
                  </span>
                  <span className='shrink-0 text-xs text-textMuted tabular-nums'>
                    {product.unitsSold} {product.unitsSold === 1 ? 'unit' : 'units'} sold
                  </span>
                </span>
              </span>
            </>
          )

          const rowClass = 'flex items-center gap-3 rounded-md px-2 py-2.5'

          return (
            <li key={product.id ?? product.name} className='-mx-2'>
              {product.id ? (
                <Link
                  href={`/products/${product.id}`}
                  className={`${rowClass} transition-colors hover:bg-actionHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60`}
                >
                  {body}
                </Link>
              ) : (
                <div className={rowClass}>{body}</div>
              )}
            </li>
          )
        })}
      </ol>
      <p className='text-xs text-textMuted'>
        Sales value is item price × units on non-cancelled orders, before shipping and discounts.
      </p>
    </div>
  )
}

export const TopProductsSkeleton = () => (
  <ul className='flex flex-col'>
    {[...Array(5)].map((_, i) => (
      <li key={i} className='flex items-center gap-3 py-2.5'>
        <span className='w-4' />
        <Skeleton variant='block' className='size-10' />
        <span className='flex flex-1 flex-col gap-2'>
          <Skeleton className='w-3/5' />
          <Skeleton className='h-1 w-full' />
        </span>
      </li>
    ))}
  </ul>
)

export default TopProductsList
