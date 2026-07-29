'use client'

// Wraps a thumbnail (avatar, img, etc.) so clicking it opens a larger view in
// a lightbox dialog. No-op if there's no src to zoom into.
import { useState, type ReactNode } from 'react'

import Modal from '@/components/ui/Modal'

type ZoomableImageProps = {
  src?: string
  alt?: string
  children: ReactNode
}

const ZoomableImage = ({ src, alt = '', children }: ZoomableImageProps) => {
  const [open, setOpen] = useState(false)

  if (!src) return <>{children}</>

  return (
    <>
      <div
        onClick={() => setOpen(true)}
        role='button'
        tabIndex={0}
        aria-label={`View larger image${alt ? `: ${alt}` : ''}`}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') setOpen(true)
        }}
        className='inline-flex cursor-zoom-in'
      >
        {children}
      </div>
      <Modal open={open} onClose={() => setOpen(false)} size='xl' className='w-auto max-w-none bg-transparent'>
        <div className='relative'>
          <button
            type='button'
            aria-label='Close preview'
            onClick={() => setOpen(false)}
            className='absolute right-2 top-2 rounded-full bg-backgroundPaper p-1.5 shadow hover:bg-primary/10'
          >
            <i className='tabler-x' />
          </button>
          <img src={src} alt={alt} className='block max-h-[85vh] max-w-[90vw] object-contain' />
        </div>
      </Modal>
    </>
  )
}

export default ZoomableImage
