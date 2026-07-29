'use client'

// Reusable image uploader. Supports single (avatar/category/collection) and
// multiple (product gallery) modes. Shows a local preview immediately on
// selection, then uploads each file and reports the resulting URL(s) upward
// via onChange. Partial failures in multi-select keep whatever succeeded.

import { useEffect, useRef, useState } from 'react'

import classnames from 'classnames'

import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
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
      <span className='text-sm text-textSecondary'>{label}</span>
      <div
        className={classnames(
          'flex cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border border-dashed p-8 text-center transition-colors',
          isDragging ? 'border-primary bg-actionHover' : 'border-secondary/30 bg-transparent'
        )}
        onClick={() => inputRef.current?.click()}
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
      >
        <span className='flex size-10 items-center justify-center rounded-md bg-primary/15 text-primaryDark'>
          <i className='tabler-upload text-[22px]' />
        </span>
        <p className='text-base font-medium text-textPrimary'>Drag and drop image{multiple ? 's' : ''} here</p>
        <p className='text-sm text-textSecondary'>or</p>
        <Button
          type='button'
          variant='outlined'
          color='secondary'
          onClick={e => {
            e.stopPropagation()
            inputRef.current?.click()
          }}
          disabled={uploading}
          loading={uploading}
          startIcon={<i className='tabler-upload' />}
        >
          {uploading ? 'Uploading…' : 'Browse image'}
        </Button>
      </div>
      {(value.length > 0 || pending.length > 0) && (
        <div className='flex flex-wrap items-center gap-3'>
          {value.map((url, index) => (
            <div key={url + index} className='relative'>
              <ZoomableImage src={url} alt={`Image ${index + 1}`}>
                <img src={url} alt='' className='size-[72px] rounded-md object-cover' />
              </ZoomableImage>
              <button
                type='button'
                aria-label={`Remove image ${index + 1}`}
                onClick={() => removeAt(index)}
                className='absolute -right-2.5 -top-2.5 rounded-full bg-backgroundPaper p-1 text-error shadow hover:bg-error/10'
              >
                <i className='tabler-x text-[16px]' />
              </button>
            </div>
          ))}
          {pending.map((p, index) => (
            <div key={p.localUrl + index} className='relative'>
              <img src={p.localUrl} alt='' className='size-[72px] rounded-md object-cover opacity-60' />
              <div className='absolute inset-0 flex items-center justify-center'>
                <Spinner size='sm' />
              </div>
            </div>
          ))}
        </div>
      )}
      <input
        ref={inputRef}
        type='file'
        accept={ALLOWED_MIME_TYPES.join(',')}
        multiple={multiple}
        hidden
        onChange={e => handleFiles(e.target.files)}
      />
      {(uploadError || externalError) && <span className='text-xs text-error'>{uploadError ?? externalError}</span>}
    </div>
  )
}

export default ImageUpload
