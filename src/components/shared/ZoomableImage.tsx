'use client'

// Wraps a thumbnail (Avatar, img, etc.) so clicking it opens a larger view in
// a lightbox dialog. No-op if there's no src to zoom into.
import { useState, type ReactNode } from 'react'

import Dialog from '@mui/material/Dialog'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'

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
      <Box
        onClick={() => setOpen(true)}
        role='button'
        tabIndex={0}
        aria-label={`View larger image${alt ? `: ${alt}` : ''}`}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') setOpen(true)
        }}
        className='inline-flex'
        sx={{ cursor: 'zoom-in' }}
      >
        {children}
      </Box>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth='md'>
        <Box className='relative'>
          <IconButton
            aria-label='Close preview'
            onClick={() => setOpen(false)}
            size='small'
            sx={{ position: 'absolute', top: 8, insetInlineEnd: 8, bgcolor: 'background.paper' }}
          >
            <i className='tabler-x' />
          </IconButton>
          <Box
            component='img'
            src={src}
            alt={alt}
            sx={{ display: 'block', maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain' }}
          />
        </Box>
      </Dialog>
    </>
  )
}

export default ZoomableImage
