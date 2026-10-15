'use client'

// Grid-view card for the Products list. The whole card opens the product
// (a stretched link on the title, so it's one real <a> for keyboard, screen
// readers and middle-click); Edit/Delete sit above that link layer.
import { useState } from 'react'

import Link from 'next/link'

import classnames from 'classnames'

import StatusChip from '@/components/shared/StatusChip'
import Card from '@/components/ui/Card'
import IconButton from '@/components/ui/IconButton'
import Skeleton from '@/components/ui/Skeleton'
import { formatCurrency, humanize } from '@/libs/format'

import type { Product } from '../types'

type ProductCardProps = {
  product: Product
  categoryName?: string
  onEdit: () => void
  onDelete: () => void
}

const actionButton = 'bg-backgroundPaper/95 shadow-sm backdrop-blur-sm'

const ProductCard = ({ product, categoryName, onEdit, onDelete }: ProductCardProps) => {
  const [imageFailed, setImageFailed] = useState(false)
  const image = product.images?.[0]
  const href = `/products/${product.id}`
  const onSale = product.originalPrice != null && product.originalPrice > product.price
  const extraSizes = product.variants?.length ?? 0

  return (
    <Card hoverable className='group relative flex h-full flex-col overflow-hidden'>
      {/* Image — 4:5 suits a bottle better than a square crop */}
      <div className='relative aspect-[4/5] w-full shrink-0 overflow-hidden bg-surfaceSunken/50'>
        {image && !imageFailed ? (
          <img
            src={image}
            alt=''
            onError={() => setImageFailed(true)}
            className={classnames(
              'size-full object-cover transition-transform duration-300 ease-out-quart group-hover:scale-[1.03]',
              !product.inStock && 'opacity-70 grayscale-[35%]'
            )}
          />
        ) : (
          <div className='flex size-full flex-col items-center justify-center gap-1.5 text-textMuted'>
            <i aria-hidden className='tabler-photo text-3xl' />
            <span className='text-xs'>No image</span>
          </div>
        )}

        {/* Chips sit on a paper backing: the soft badge tints alone are
            unreadable over a dark bottle shot. */}
        {product.badge && (
          <div className='pointer-events-none absolute top-2.5 left-2.5 rounded-md bg-backgroundPaper shadow-xs'>
            <StatusChip value={product.badge} />
          </div>
        )}
        <div className='pointer-events-none absolute bottom-2.5 left-2.5 rounded-md bg-backgroundPaper shadow-xs'>
          <StatusChip value={product.inStock ? 'in-stock' : 'out-of-stock'} dot />
        </div>

        {/* Top-right: actions, above the stretched link. Revealed on hover or
            keyboard focus; always shown on touch screens, which can't hover. */}
        <div
          className={classnames(
            'absolute top-2 right-2 z-10 flex gap-1 transition-opacity',
            'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 pointer-coarse:opacity-100'
          )}
        >
          <IconButton
            size='sm'
            variant='outlined'
            aria-label={`Edit ${product.name}`}
            className={actionButton}
            onClick={onEdit}
          >
            <i className='tabler-edit' />
          </IconButton>
          <IconButton
            size='sm'
            variant='outlined'
            color='error'
            aria-label={`Delete ${product.name}`}
            className={actionButton}
            onClick={onDelete}
          >
            <i className='tabler-trash' />
          </IconButton>
        </div>
      </div>

      <div className='flex flex-1 flex-col gap-2 p-3.5'>
        <div className='flex min-w-0 flex-col gap-0.5'>
          <span className='truncate text-xs text-textMuted'>
            {[product.brand, categoryName ?? humanize(product.scentFamily)].filter(Boolean).join(' · ')}
          </span>
          <h3 className='line-clamp-2 min-h-10 text-sm leading-5 font-semibold text-textPrimary'>
            <Link
              href={href}
              className='rounded-xs after:absolute after:inset-0 after:content-[""] hover:underline focus-visible:outline-none focus-visible:after:rounded-lg focus-visible:after:ring-2 focus-visible:after:ring-primary/60'
            >
              {product.name}
            </Link>
          </h3>
        </div>

        <div className='flex items-center gap-1.5 text-xs text-textSecondary'>
          {product.reviewCount > 0 ? (
            <>
              <i aria-hidden className='tabler-star-filled text-sm text-primaryDark' />
              <span className='font-medium text-textPrimary tabular-nums'>{product.rating.toFixed(1)}</span>
              <span className='text-textMuted tabular-nums'>
                ({product.reviewCount}
                <span className='sr-only'> reviews</span>)
              </span>
            </>
          ) : (
            <span className='text-textMuted'>No reviews yet</span>
          )}
        </div>

        <div className='mt-auto border-t border-border pt-2.5'>
          <div className='flex min-w-0 flex-col'>
            <span className='flex items-baseline gap-1.5'>
              <span className='text-base font-semibold text-textPrimary tabular-nums'>
                {formatCurrency(product.price, product.currency)}
              </span>
              {onSale && (
                <span className='text-xs text-textMuted line-through tabular-nums'>
                  <span className='sr-only'>Original price </span>
                  {formatCurrency(product.originalPrice, product.currency)}
                </span>
              )}
            </span>
            <span className='text-xs text-textMuted'>
              {product.volumeMl}ml{extraSizes > 0 && ` · +${extraSizes} size${extraSizes === 1 ? '' : 's'}`}
            </span>
          </div>
        </div>
      </div>
    </Card>
  )
}

/** Same box model as ProductCard, so the grid doesn't shift when data lands. */
export const ProductCardSkeleton = () => (
  <Card aria-hidden className='flex h-full flex-col overflow-hidden'>
    <Skeleton variant='block' className='aspect-[4/5] w-full rounded-none' />
    <div className='flex flex-col gap-2 p-3.5'>
      <Skeleton className='h-3 w-1/2' />
      <Skeleton className='h-4 w-4/5' />
      <Skeleton className='h-3 w-1/3' />
      <Skeleton className='mt-2 h-5 w-2/5' />
    </div>
  </Card>
)

export default ProductCard
