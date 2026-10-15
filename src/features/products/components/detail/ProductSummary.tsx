'use client'

// Right-hand column of the Product Detail hero: price and availability first
// (what an admin checks most), then the description, notes and key facts.
import { useState } from 'react'

import classnames from 'classnames'

import StatusChip from '@/components/shared/StatusChip'
import SubHeading from '@/components/shared/SubHeading'
import Badge from '@/components/ui/Badge'
import Rating from '@/components/ui/Rating'
import { formatCurrency, humanize } from '@/libs/format'

import type { Product } from '../../types'
import { priceRange } from './productDetail'

type ProductSummaryProps = {
  product: Product
  categoryName?: string
}

// Long enough that most descriptions show in full; clamp only the outliers.
const DESCRIPTION_CLAMP_CHARS = 320

const Fact = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className='flex min-w-0 flex-col gap-0.5'>
    <dt className='text-xs text-textMuted'>{label}</dt>
    <dd className='text-sm font-medium text-textPrimary wrap-break-word'>{children}</dd>
  </div>
)

const ProductSummary = ({ product, categoryName }: ProductSummaryProps) => {
  const [expanded, setExpanded] = useState(false)

  const hasVariants = product.variants.length > 0
  const range = priceRange(product)
  const onSale = product.originalPrice != null && product.originalPrice > product.price
  const longDescription = product.description.length > DESCRIPTION_CLAMP_CHARS

  const otherSizes = [...product.variants]
    .sort((a, b) => a.volumeMl - b.volumeMl)
    .map(v => `${v.volumeMl}ml`)
    .join(', ')

  return (
    <div className='flex min-w-0 flex-col gap-6'>
      {/* Price + availability */}
      <section aria-label='Price and availability' className='flex flex-col gap-3'>
        <div className='flex flex-col gap-1'>
          <span className='text-xs text-textMuted'>
            Price{hasVariants ? ` · ${product.volumeMl}ml (default size)` : ` · ${product.volumeMl}ml`}
          </span>
          <div className='flex flex-wrap items-baseline gap-x-3 gap-y-1'>
            <span className='text-3xl font-semibold tracking-[-0.02em] text-textPrimary tabular-nums'>
              {formatCurrency(product.price, product.currency)}
            </span>
            {onSale && (
              <span className='text-base text-textMuted line-through tabular-nums'>
                <span className='sr-only'>Original price </span>
                {formatCurrency(product.originalPrice, product.currency)}
              </span>
            )}
          </div>
          {hasVariants && (
            <p className='text-sm text-textSecondary'>
              Also in {otherSizes}
              {range.min !== range.max && (
                <>
                  {' '}
                  · {formatCurrency(range.min, product.currency)} – {formatCurrency(range.max, product.currency)}
                </>
              )}
            </p>
          )}
        </div>

        <div className='flex flex-wrap items-center gap-2'>
          <StatusChip value={product.inStock ? 'in-stock' : 'out-of-stock'} dot />
          {product.badge && <StatusChip value={product.badge} />}
          <Badge color='neutral' variant='outlined'>
            {humanize(product.scentFamily)}
          </Badge>
        </div>

        <div className='flex items-center gap-2 text-sm text-textSecondary'>
          {product.reviewCount > 0 ? (
            <>
              <Rating value={product.rating} size='sm' />
              <span className='tabular-nums'>
                <span className='font-medium text-textPrimary'>{product.rating.toFixed(1)}</span> ·{' '}
                {product.reviewCount} review{product.reviewCount === 1 ? '' : 's'}
              </span>
            </>
          ) : (
            <span className='text-textMuted'>No reviews yet</span>
          )}
        </div>
      </section>

      <hr className='border-t border-border' />

      {/* Overview */}
      <section aria-labelledby='product-description' className='flex flex-col gap-2'>
        <SubHeading id='product-description'>Description</SubHeading>
        {product.description ? (
          <>
            <p
              id='product-description-text'
              className={classnames(
                'text-sm leading-6 text-textPrimary wrap-break-word whitespace-pre-line',
                longDescription && !expanded && 'line-clamp-5'
              )}
            >
              {product.description}
            </p>
            {longDescription && (
              <button
                type='button'
                onClick={() => setExpanded(e => !e)}
                aria-expanded={expanded}
                aria-controls='product-description-text'
                className='self-start rounded-xs text-sm font-medium text-primaryInk hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60'
              >
                {expanded ? 'Show less' : 'Read more'}
              </button>
            )}
          </>
        ) : (
          <p className='text-sm text-textMuted'>No description.</p>
        )}
      </section>

      <section aria-label='Fragrance notes' className='flex flex-col gap-2'>
        <SubHeading>Fragrance notes</SubHeading>
        {product.notes.length ? (
          <ul className='flex flex-wrap gap-1.5'>
            {product.notes.map((note, i) => (
              <li key={`${note}-${i}`}>
                <Badge color='secondary'>{note}</Badge>
              </li>
            ))}
          </ul>
        ) : (
          <p className='text-sm text-textMuted'>No notes listed.</p>
        )}
      </section>

      <dl className='grid grid-cols-2 gap-x-6 gap-y-4 rounded-md bg-surfaceSunken/35 px-4 py-3.5 sm:grid-cols-3'>
        <Fact label='Brand'>{product.brand || '—'}</Fact>
        <Fact label='Category'>{categoryName ?? '—'}</Fact>
        <Fact label='Scent family'>{humanize(product.scentFamily)}</Fact>
        {product.nameAr && (
          <Fact label='Arabic name'>
            <span dir='rtl' lang='ar'>
              {product.nameAr}
            </span>
          </Fact>
        )}
      </dl>
    </div>
  )
}

export default ProductSummary
