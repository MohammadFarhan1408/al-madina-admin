'use client'

// Detail-page image gallery (products, categories) — a large primary image with a selectable thumbnail
// strip and a lightbox. The primary image is `object-contain` on a sunken
// well, so any aspect ratio shows whole and undistorted; thumbnails crop
// (`object-cover`) because they're only for recognition.
import { useState, type KeyboardEvent } from 'react'

import classnames from 'classnames'

import Modal from '@/components/ui/Modal'

type ImageGalleryProps = {
  images: string[]
  name: string

  /** Frame for the primary image — square for product shots, wider for banners. */
  aspect?: 'square' | 'landscape'

  /** Copy for the empty state, e.g. "Add images from Edit to show this product in the store." */
  emptyHint?: string
}

const aspectClasses = { square: 'aspect-square', landscape: 'aspect-[4/3]' }

const overlayButton =
  'flex size-9 items-center justify-center rounded-full border border-border bg-backgroundPaper/92 text-textPrimary shadow-sm transition-colors hover:bg-backgroundPaper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60'

const ImageFallback = ({ compact = false }: { compact?: boolean }) => (
  <div className='flex size-full flex-col items-center justify-center gap-1.5 bg-surfaceSunken/45 text-textMuted'>
    <i aria-hidden className={classnames('tabler-photo-off', compact ? 'text-lg' : 'text-3xl')} />
    {!compact && <span className='text-sm'>Image unavailable</span>}
  </div>
)

const ImageGallery = ({ images, name, aspect = 'square', emptyHint }: ImageGalleryProps) => {
  const [selected, setSelected] = useState(0)
  const [lightbox, setLightbox] = useState(false)
  const [broken, setBroken] = useState<Set<string>>(() => new Set())

  const count = images.length
  const index = Math.min(selected, Math.max(count - 1, 0))
  const current = images[index]

  const markBroken = (src: string) => setBroken(prev => (prev.has(src) ? prev : new Set(prev).add(src)))
  const step = (delta: number) => setSelected(i => (Math.min(i, count - 1) + delta + count) % count)

  const onArrowKeys = (e: KeyboardEvent) => {
    if (count < 2) return

    if (e.key === 'ArrowRight') {
      e.preventDefault()
      step(1)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      step(-1)
    }
  }

  if (!count) {
    return (
      <div
        className={classnames(
          aspectClasses[aspect],
          'flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-borderControl/50 bg-surfaceSunken/30 px-6 text-center'
        )}
      >
        <i aria-hidden className='tabler-photo text-4xl text-textMuted' />
        <p className='text-sm font-medium text-textPrimary'>No images</p>
        {emptyHint && <p className='max-w-56 text-xs text-textMuted'>{emptyHint}</p>}
      </div>
    )
  }

  return (
    <div className='flex flex-col gap-3'>
      <div
        className={classnames(
          aspectClasses[aspect],
          'relative w-full overflow-hidden rounded-lg border border-border bg-surfaceSunken/40'
        )}
      >
        {broken.has(current) ? (
          <ImageFallback />
        ) : (
          <button
            type='button'
            onClick={() => setLightbox(true)}
            onKeyDown={onArrowKeys}
            aria-label={`Open image ${index + 1} of ${count} full size`}
            className='group block size-full cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/60'
          >
            <img
              src={current}
              alt={`${name} — image ${index + 1} of ${count}`}
              onError={() => markBroken(current)}
              className='size-full object-contain'
            />
            <span
              aria-hidden
              className={classnames(
                overlayButton,
                'absolute right-3 top-3 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100'
              )}
            >
              <i className='tabler-zoom-in text-base' />
            </span>
          </button>
        )}

        {count > 1 && (
          <>
            <button
              type='button'
              aria-label='Previous image'
              onClick={() => step(-1)}
              className={classnames(overlayButton, 'absolute left-3 top-1/2 -translate-y-1/2')}
            >
              <i aria-hidden className='tabler-chevron-left text-base' />
            </button>
            <button
              type='button'
              aria-label='Next image'
              onClick={() => step(1)}
              className={classnames(overlayButton, 'absolute right-3 top-1/2 -translate-y-1/2')}
            >
              <i aria-hidden className='tabler-chevron-right text-base' />
            </button>
            <span className='pointer-events-none absolute bottom-3 left-3 rounded-md bg-richBlack/72 px-2 py-0.5 text-xs font-medium tabular-nums text-ivory'>
              {index + 1} / {count}
            </span>
          </>
        )}
      </div>

      {count > 1 && (
        <ul aria-label='Gallery thumbnails' className='grid grid-cols-5 gap-2' onKeyDown={onArrowKeys}>
          {images.map((src, i) => (
            <li key={`${src}-${i}`}>
              <button
                type='button'
                onClick={() => setSelected(i)}
                aria-label={`Show image ${i + 1} of ${count}`}
                aria-current={i === index ? 'true' : undefined}
                className={classnames(
                  'block aspect-square w-full overflow-hidden rounded-md border bg-surfaceSunken/40 transition-[border-color,box-shadow]',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
                  i === index
                    ? 'border-primary ring-2 ring-primary/45'
                    : 'border-border opacity-80 hover:border-borderStrong hover:opacity-100'
                )}
              >
                {broken.has(src) ? (
                  <ImageFallback compact />
                ) : (
                  <img src={src} alt='' onError={() => markBroken(src)} className='size-full object-cover' />
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={lightbox}
        onClose={() => setLightbox(false)}
        size='xl'
        label={`${name} images`}
        className='w-auto bg-transparent'
      >
        <div className='relative max-h-[85vh] max-w-[90vw]' onKeyDown={onArrowKeys}>
          <button
            type='button'
            aria-label='Close preview'
            onClick={() => setLightbox(false)}
            className={classnames(overlayButton, 'absolute right-2 top-2 z-(--z-sticky)')}
          >
            <i aria-hidden className='tabler-x text-base' />
          </button>
          {count > 1 && (
            <>
              <button
                type='button'
                aria-label='Previous image'
                onClick={() => step(-1)}
                className={classnames(overlayButton, 'absolute left-2 top-1/2 z-(--z-sticky) -translate-y-1/2')}
              >
                <i aria-hidden className='tabler-chevron-left text-base' />
              </button>
              <button
                type='button'
                aria-label='Next image'
                onClick={() => step(1)}
                className={classnames(overlayButton, 'absolute right-2 top-1/2 z-(--z-sticky) -translate-y-1/2')}
              >
                <i aria-hidden className='tabler-chevron-right text-base' />
              </button>
            </>
          )}
          {broken.has(current) ? (
            <div className='size-80 overflow-hidden rounded-lg'>
              <ImageFallback />
            </div>
          ) : (
            <img
              src={current}
              alt={`${name} — image ${index + 1} of ${count}`}
              className='block max-h-[85vh] w-full object-contain'
            />
          )}
        </div>
      </Modal>
    </div>
  )
}

export default ImageGallery
