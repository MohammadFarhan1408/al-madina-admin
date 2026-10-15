'use client'

import type { ReactNode } from 'react'

import Link from 'next/link'

import classnames from 'classnames'

import Button from '@/components/ui/Button'
import Skeleton from '@/components/ui/Skeleton'
import type { Product } from '@/features/products/types'
import {
  ATTENTION_FILTERS,
  useAttentionOrderCounts,
  useOutOfStockProducts
} from '@/features/dashboard/hooks/useDashboard'

type Tone = 'warning' | 'error'

// Tinted only while there's something to do; a cleared item drops to neutral
// so the eye goes to what's left. Each tint pairs with its AA ink.
const toneClasses: Record<Tone, string> = {
  warning: 'bg-warning/18 text-warningInk',
  error: 'bg-error/14 text-errorDark'
}

const ordersHref = (filter: Record<string, string>) => `/orders?${new URLSearchParams(filter)}`

type TileProps = {
  label: string
  hint: string
  icon: string
  tone: Tone
  href: string
  count?: number
  isLoading: boolean
  isError: boolean
  onRetry: () => void
  extra?: ReactNode
}

/** One count that may need action. The count is the backend's own total for
 *  exactly the filter the link opens. State reads from the icon and the words
 *  ("Review" / "All clear"), not from the tint alone. */
const AttentionTile = ({ label, hint, icon, tone, href, count, isLoading, isError, onRetry, extra }: TileProps) => {
  const frame = 'flex h-full min-w-0 flex-col gap-3 rounded-lg border border-border bg-backgroundPaper p-4'

  if (isLoading) {
    return (
      <div className={frame} aria-hidden>
        <div className='flex items-center gap-3'>
          <Skeleton variant='block' className='size-9' />
          <Skeleton className='h-7 w-10' />
        </div>
        <Skeleton className='h-4 w-32' />
        <Skeleton className='h-3 w-44' />
      </div>
    )
  }

  if (isError || count === undefined) {
    return (
      <div className={frame}>
        <p className='text-sm font-medium text-textPrimary'>{label}</p>
        <p className='text-xs text-textMuted'>Couldn’t load this count.</p>
        <div className='mt-auto'>
          <Button
            size='sm'
            variant='outlined'
            color='secondary'
            startIcon={<i className='tabler-refresh' />}
            onClick={onRetry}
          >
            Retry
          </Button>
        </div>
      </div>
    )
  }

  const active = count > 0

  return (
    <Link
      href={href}
      className={classnames(
        frame,
        'group transition-[border-color,box-shadow] hover:border-borderStrong/60 hover:shadow-md',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60'
      )}
    >
      <span className='flex items-center gap-3'>
        <span
          aria-hidden
          className={classnames(
            'flex size-9 shrink-0 items-center justify-center rounded-md',
            active ? toneClasses[tone] : 'bg-success/14 text-successDark'
          )}
        >
          <i className={classnames(active ? icon : 'tabler-circle-check', 'text-[18px]')} />
        </span>
        <span className='text-2xl font-semibold tracking-[-0.01em] text-textPrimary'>{count}</span>
      </span>
      <span className='flex min-w-0 flex-col gap-0.5'>
        <span className='text-sm font-medium text-textPrimary'>{label}</span>
        <span className='text-xs text-textMuted'>{hint}</span>
      </span>
      {extra}
      <span
        className={classnames(
          'mt-auto flex items-center gap-1 text-xs font-medium',
          active ? 'text-primaryInk group-hover:underline' : 'text-textMuted'
        )}
      >
        {active ? 'Review' : 'All clear'}
        {active && <i aria-hidden className='tabler-arrow-right text-sm' />}
      </span>
    </Link>
  )
}

const ProductThumbs = ({ products, total }: { products: Product[]; total: number }) => (
  <span className='flex items-center' aria-hidden>
    {products.map(p =>
      p.images?.[0] ? (
        <img
          key={p.id}
          src={p.images[0]}
          alt=''
          className='-mr-1.5 size-7 rounded-full border-2 border-backgroundPaper object-cover'
        />
      ) : (
        <span key={p.id} className='-mr-1.5 size-7 rounded-full border-2 border-backgroundPaper bg-secondary/20' />
      )
    )}
    {total > products.length && <span className='ml-3 text-xs text-textMuted'>+{total - products.length} more</span>}
  </span>
)

/** "What needs action now": the current state of the store, independent of
 *  the performance range below. */
const NeedsAttentionPanel = () => {
  const orders = useAttentionOrderCounts()
  const outOfStock = useOutOfStockProducts()
  const ordersState = { isLoading: orders.isLoading, isError: orders.isError, onRetry: () => orders.refetch() }
  const stockTotal = outOfStock.data?.total

  return (
    <section aria-labelledby='attention-heading' className='flex flex-col gap-3'>
      <div className='flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1'>
        <h2 id='attention-heading' className='text-base font-semibold tracking-[-0.01em] text-textPrimary'>
          Needs attention
        </h2>
        <p className='text-xs text-textMuted'>Current state of the store — not affected by the date range</p>
      </div>
      <ul className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4'>
        <li>
          <AttentionTile
            label='Orders to fulfil'
            hint='Processing — placed but not yet shipped'
            icon='tabler-package'
            tone='warning'
            href={ordersHref(ATTENTION_FILTERS.toFulfil)}
            count={orders.data?.toFulfil}
            {...ordersState}
          />
        </li>
        <li>
          <AttentionTile
            label='Payment failed'
            hint='Processing orders whose last payment attempt failed'
            icon='tabler-credit-card-off'
            tone='error'
            href={ordersHref(ATTENTION_FILTERS.paymentFailed)}
            count={orders.data?.paymentFailed}
            {...ordersState}
          />
        </li>
        <li>
          <AttentionTile
            label='Payment pending'
            hint='Processing orders not yet paid — cash on delivery stays pending until delivered'
            icon='tabler-clock-dollar'
            tone='warning'
            href={ordersHref(ATTENTION_FILTERS.paymentPending)}
            count={orders.data?.paymentPending}
            {...ordersState}
          />
        </li>
        <li>
          <AttentionTile
            label='Out of stock'
            hint='Products marked out of stock can’t be ordered'
            icon='tabler-alert-triangle'
            tone='error'
            href='/products?stock=false'
            count={stockTotal}
            isLoading={outOfStock.isLoading}
            isError={outOfStock.isError}
            onRetry={() => outOfStock.refetch()}
            extra={!!stockTotal && <ProductThumbs products={outOfStock.data?.items ?? []} total={stockTotal} />}
          />
        </li>
      </ul>
    </section>
  )
}

export default NeedsAttentionPanel
