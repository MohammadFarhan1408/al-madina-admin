'use client'

// Reusable image uploader. Supports single (avatar/category/collection) and
// multiple (product gallery) modes. Shows a local preview immediately on
// selection, then uploads each file and reports the resulting URL(s) upward
// via onChange. Partial failures in multi-select keep whatever succeeded.

import { useEffect, useRef, useState } from 'react'

import classnames from 'classnames'

import IconButton from '@/components/ui/IconButton'
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
    if (file.size > MAX_BYTES[type])
      return `${file.name}: file exceeds ${Math.round(MAX_BYTES[type] / (1024 * 1024))}MB`

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

      const succeeded = results
        .filter((r): r is PromiseFulfilledResult<string> => r.status === 'fulfilled')
        .map(r => r.value)

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

  const error = uploadError ?? externalError
  const maxMb = Math.round(MAX_BYTES[type] / (1024 * 1024))
  const formats = ALLOWED_MIME_TYPES.map(m => m.replace('image/', '').toUpperCase()).join(', ')

  return (
    <div className='flex flex-col gap-2.5'>
      <span className='text-sm font-medium text-textPrimary'>{label}</span>

      {/* A <label> wrapping the file input, rather than a div with onClick:
          clicking anywhere in the zone opens the native picker, and the input
          itself stays keyboard-reachable (sr-only, not `hidden`) so the control
          can be operated without a mouse. The visible "Browse" affordance is a
          styled span — a real button here would nest interactive elements. */}
      <label
        className={classnames(
          'flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-6 py-7 text-center',
          'transition-colors duration-150 ease-out-quart',
          'has-focus-visible:border-primary has-focus-visible:ring-2 has-focus-visible:ring-primary/40',
          uploading && 'pointer-events-none opacity-70',
          isDragging
            ? 'border-primary bg-primary/8'
            : error
              ? 'border-error/60 bg-error/4 hover:border-error'
              : 'border-borderControl bg-backgroundDefault/50 hover:border-borderStrong hover:bg-actionHover'
        )}
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
        <input
          ref={inputRef}
          type='file'
          accept={ALLOWED_MIME_TYPES.join(',')}
          multiple={multiple}
          disabled={uploading}
          className='sr-only'
          onChange={e => handleFiles(e.target.files)}
        />
        <span
          aria-hidden
          className={classnames(
            'flex size-10 items-center justify-center rounded-full transition-colors',
            isDragging ? 'bg-primary/22 text-primaryInk' : 'bg-primary/14 text-primaryInk'
          )}
        >
          {uploading ? <Spinner size='sm' label={null} /> : <i className='tabler-cloud-upload text-[20px]' />}
        </span>
        <span className='flex flex-col gap-0.5'>
          <span className='text-sm font-medium text-textPrimary'>
            {uploading ? (
              'Uploading…'
            ) : (
              <>
                Drop image{multiple ? 's' : ''} here, or{' '}
                <span className='text-primaryInk underline underline-offset-2'>browse</span>
              </>
            )}
          </span>
          <span className='text-xs text-textMuted'>{`${formats} · up to ${maxMb}MB`}</span>
        </span>
      </label>

      {(value.length > 0 || pending.length > 0) && (
        <ul className='flex flex-wrap items-center gap-2.5 pt-0.5'>
          {value.map((url, index) => (
            <li key={url + index} className='group relative'>
              <ZoomableImage src={url} alt={`Image ${index + 1}`}>
                <img src={url} alt='' className='size-18 rounded-md border border-border object-cover' />
              </ZoomableImage>
              <IconButton
                size='sm'
                variant='filled'
                color='error'
                rounded
                aria-label={`Remove image ${index + 1}`}
                onClick={() => removeAt(index)}
                className='absolute -right-2 -top-2 size-6 text-[13px] shadow-sm'
              >
                <i className='tabler-x' />
              </IconButton>
            </li>
          ))}
          {pending.map((p, index) => (
            <li key={p.localUrl + index} className='relative'>
              <img
                src={p.localUrl}
                alt=''
                className='size-18 rounded-md border border-border object-cover opacity-45'
              />
              <span className='absolute inset-0 flex items-center justify-center'>
                <Spinner size='sm' label={null} />
              </span>
            </li>
          ))}
        </ul>
      )}

      {error && (
        <span role='alert' className='flex items-start gap-1 text-xs text-error'>
          <i aria-hidden className='tabler-alert-circle mt-px text-[13px]' />
          {error}
        </span>
      )}
    </div>
  )
}

export default ImageUpload
