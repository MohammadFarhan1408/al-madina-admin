'use client'

// Collection card for the Collections grid — and, with `preview`, the live
// preview on the collection form. Echoes the mobile app's collection card:
// the image with a dark scrim carrying the title, and the accent colour as a
// rule across the top. The whole card opens the collection via a stretched
// link on the title; Edit/Delete sit above that layer.
import { useState } from 'react'

import Link from 'next/link'

import classnames from 'classnames'

import Card from '@/components/ui/Card'
import IconButton from '@/components/ui/IconButton'
import Skeleton from '@/components/ui/Skeleton'
import { humanize } from '@/libs/format'

import { accentSwatch } from '../accent'
import type { CollectionAccent } from '../types'

type CollectionCardProps = {
  title: string
  subtitle?: string
  image?: string
  accent: CollectionAccent
  productCount?: number
  sortOrder?: number

  /** Omit for a preview: no link, no actions. */
  href?: string
  onEdit?: () => void
  onDelete?: () => void
}

const CollectionCard = ({
  title,
  subtitle,
  image,
  accent,
  productCount,
  sortOrder,
  href,
  onEdit,
  onDelete
}: CollectionCardProps) => {
  // Track the failed URL rather than a flag, so a new image (the form
  // preview after an upload) gets a fresh chance to load.
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const showImage = Boolean(image) && failedSrc !== image
  const hasActions = Boolean(onEdit || onDelete)

  return (
    <Card hoverable={Boolean(href)} className='group relative flex h-full flex-col overflow-hidden'>
      <span aria-hidden className={classnames('h-1 w-full shrink-0', accentSwatch[accent])} />

      <div className='relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-obsidian'>
        {showImage ? (
          <img
            src={image}
            alt=''
            onError={() => setFailedSrc(image ?? null)}
            className='size-full object-cover transition-transform duration-300 ease-out-quart group-hover:scale-[1.03]'
          />
        ) : (
          <div className='flex size-full items-center justify-center text-stone'>
            <i aria-hidden className='tabler-stack-2 text-4xl' />
          </div>
        )}

        {/* Scrim: guarantees ivory text clears contrast on any image. */}
        <div
          aria-hidden
          className='pointer-events-none absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-richBlack/90 via-richBlack/45 to-transparent'
        />

        <div className='absolute inset-x-0 bottom-0 flex flex-col gap-1 p-3.5'>
          <span className='flex items-center gap-1.5 text-2xs font-semibold tracking-[0.12em] text-ivoryDim uppercase'>
            <span
              aria-hidden
              className={classnames('size-2 rounded-full ring-1 ring-ivory/60', accentSwatch[accent])}
            />
            {humanize(accent)}
          </span>
          <h3 className='line-clamp-2 text-base leading-snug font-semibold text-ivory'>
            {href ? (
              <Link
                href={href}
                className='rounded-xs after:absolute after:inset-0 after:content-[""] hover:underline focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-primary focus-visible:after:ring-inset'
              >
                {title || 'Untitled collection'}
              </Link>
            ) : (
              title || 'Untitled collection'
            )}
          </h3>
          {subtitle && <p className='line-clamp-1 text-xs text-ivoryDim/90'>{subtitle}</p>}
        </div>

        {hasActions && (
          <div
            className={classnames(
              'absolute top-2 right-2 z-10 flex gap-1 transition-opacity',
              'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 pointer-coarse:opacity-100'
            )}
          >
            {onEdit && (
              <IconButton
                size='sm'
                variant='outlined'
                aria-label={`Edit ${title}`}
                className='bg-backgroundPaper/95 shadow-sm'
                onClick={onEdit}
              >
                <i className='tabler-edit' />
              </IconButton>
            )}
            {onDelete && (
              <IconButton
                size='sm'
                variant='outlined'
                color='error'
                aria-label={`Delete ${title}`}
                className='bg-backgroundPaper/95 shadow-sm'
                onClick={onDelete}
              >
                <i className='tabler-trash' />
              </IconButton>
            )}
          </div>
        )}
      </div>

      {(productCount !== undefined || sortOrder !== undefined) && (
        <div className='flex items-center justify-between gap-3 px-3.5 py-2.5 text-xs text-textSecondary'>
          {productCount !== undefined && (
            <span className='flex items-center gap-1.5'>
              <i aria-hidden className='tabler-package text-sm text-textMuted' />
              <span className='font-medium text-textPrimary tabular-nums'>{productCount}</span>
              {productCount === 1 ? 'product' : 'products'}
            </span>
          )}
          {sortOrder !== undefined && (
            <span
              className='flex items-center gap-1 text-textMuted'
              title='Sort order — lower numbers are listed first'
            >
              Order <span className='font-medium text-textSecondary tabular-nums'>{sortOrder}</span>
            </span>
          )}
        </div>
      )}
    </Card>
  )
}

export const CollectionCardSkeleton = () => (
  <Card aria-hidden className='flex h-full flex-col overflow-hidden'>
    <Skeleton variant='block' className='aspect-[4/3] w-full rounded-none' />
    <div className='flex items-center justify-between px-3.5 py-3'>
      <Skeleton className='h-3.5 w-24' />
      <Skeleton className='h-3.5 w-8' />
    </div>
  </Card>
)

export default CollectionCard
