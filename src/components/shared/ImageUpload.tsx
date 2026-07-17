'use client'

// Reusable image uploader. Supports single (avatar/category/collection) and
// multiple (product gallery) modes. Shows a local preview immediately on
// selection, then uploads each file and reports the resulting URL(s) upward
// via onChange. Partial failures in multi-select keep whatever succeeded.

import { useEffect, useRef, useState } from 'react'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import FormHelperText from '@mui/material/FormHelperText'
import IconButton from '@mui/material/IconButton'
import CircularProgress from '@mui/material/CircularProgress'
import Avatar from '@mui/material/Avatar'

import { uploadImage, type UploadType } from '@/libs/api/upload'
import { ApiError } from '@/libs/api/types'
import ZoomableImage from './ZoomableImage'

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp']

const MAX_BYTES: Record<UploadType, number> = {
  product: 10 * 1024 * 1024,
  category: 10 * 1024 * 1024,
  collection: 10 * 1024 * 1024,
  avatar: 5 * 1024 * 1024
}

type PendingPreview = { localUrl: string; name: string }

type ImageUploadProps = {
  type: UploadType
  value: string[]
  onChange: (urls: string[]) => void
  multiple?: boolean
  label?: string

  /** Lets the parent form disable Submit while an upload is in flight. */
  onUploadingChange?: (uploading: boolean) => void

  /** External validation error (e.g. from RHF/Zod) shown alongside any upload error. */
  error?: string
}

const ImageUpload = ({
  type,
  value,
  onChange,
  multiple = false,
  label = 'Upload image',
  onUploadingChange,
  error: externalError
}: ImageUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [pending, setPending] = useState<PendingPreview[]>([])
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    onUploadingChange?.(uploading)
  }, [uploading, onUploadingChange])

  // Revoke object URLs on unmount to avoid leaking memory.
  useEffect(() => {
    return () => {
      pending.forEach(p => URL.revokeObjectURL(p.localUrl))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const validate = (file: File): string | null => {
    if (!ALLOWED_MIME_TYPES.includes(file.type)) return `${file.name}: unsupported file type`
    if (file.size > MAX_BYTES[type]) return `${file.name}: file exceeds ${Math.round(MAX_BYTES[type] / (1024 * 1024))}MB`

    return null
  }

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const selected = Array.from(files)
    const validationErrors = selected.map(validate).filter((e): e is string => Boolean(e))

    if (validationErrors.length > 0) {
      setUploadError(validationErrors.join('; '))

      return
    }

    const previews = selected.map(file => ({ localUrl: URL.createObjectURL(file), name: file.name }))

    setPending(previews)
    setUploading(true)
    setUploadError(null)

    try {
      const results = await Promise.allSettled(selected.map(file => uploadImage(file, type)))
      const succeeded = results.filter((r): r is PromiseFulfilledResult<string> => r.status === 'fulfilled').map(r => r.value)
      const failed = results.filter((r): r is PromiseRejectedResult => r.status === 'rejected')

      if (succeeded.length > 0) {
        onChange(multiple ? [...value, ...succeeded] : succeeded.slice(0, 1))
      }

      if (failed.length > 0) {
        const messages = failed.map(r => (r.reason instanceof ApiError ? r.reason.message : 'Upload failed'))

        setUploadError(`${failed.length} of ${selected.length} file(s) failed: ${messages.join('; ')}`)
      }
    } finally {
      previews.forEach(p => URL.revokeObjectURL(p.localUrl))
      setPending([])
      setUploading(false)

      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const removeAt = (index: number) => onChange(value.filter((_, i) => i !== index))

  return (
    <div className='flex flex-col gap-3'>
      <Typography variant='body2' color='text.secondary'>
        {label}
      </Typography>
      <Box
        className='flex flex-wrap items-center gap-3 rounded p-2'
        onDragOver={e => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={e => {
          e.preventDefault()
          setIsDragging(false)
          void handleFiles(e.dataTransfer.files)
        }}
        sx={{
          border: '1px dashed',
          borderColor: isDragging ? 'primary.main' : 'transparent',
          transition: 'border-color 0.15s'
        }}
      >
        {value.map((url, index) => (
          <Box key={url + index} className='relative'>
            <ZoomableImage src={url} alt={`Image ${index + 1}`}>
              <Avatar variant='rounded' src={url} sx={{ width: 72, height: 72 }} />
            </ZoomableImage>
            <IconButton
              size='small'
              color='error'
              aria-label={`Remove image ${index + 1}`}
              onClick={() => removeAt(index)}
              sx={{ position: 'absolute', top: -10, insetInlineEnd: -10, bgcolor: 'background.paper' }}
            >
              <i className='tabler-x text-[16px]' />
            </IconButton>
          </Box>
        ))}
        {pending.map((p, index) => (
          <Box key={p.localUrl + index} className='relative'>
            <Avatar variant='rounded' src={p.localUrl} sx={{ width: 72, height: 72, opacity: 0.6 }} />
            <Box className='absolute inset-0 flex items-center justify-center'>
              <CircularProgress size={20} />
            </Box>
          </Box>
        ))}
        <Button
          variant='tonal'
          color='secondary'
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          startIcon={uploading ? <CircularProgress size={16} color='inherit' /> : <i className='tabler-upload' />}
        >
          {uploading ? 'Uploading…' : multiple ? 'Add image' : value.length ? 'Replace' : 'Upload or drop'}
        </Button>
      </Box>
      <input
        ref={inputRef}
        type='file'
        accept={ALLOWED_MIME_TYPES.join(',')}
        multiple={multiple}
        hidden
        onChange={e => handleFiles(e.target.files)}
      />
      {(uploadError || externalError) && (
        <FormHelperText error>{uploadError ?? externalError}</FormHelperText>
      )}
    </div>
  )
}

export default ImageUpload
