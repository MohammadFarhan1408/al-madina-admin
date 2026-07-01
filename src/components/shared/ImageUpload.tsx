'use client'

// Reusable image uploader. Supports single (avatar/category/collection) and
// multiple (product gallery) modes. Uploads each file immediately and reports
// the resulting URL(s) upward via onChange.

import { useState, useRef } from 'react'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import CircularProgress from '@mui/material/CircularProgress'
import Avatar from '@mui/material/Avatar'

import { uploadImage, type UploadType } from '@/libs/api/upload'
import { ApiError } from '@/libs/api/types'

type ImageUploadProps = {
  type: UploadType
  value: string[]
  onChange: (urls: string[]) => void
  multiple?: boolean
  label?: string
}

const ImageUpload = ({ type, value, onChange, multiple = false, label = 'Upload image' }: ImageUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    setUploading(true)
    setError(null)

    try {
      const selected = Array.from(files)
      const urls = await Promise.all(selected.map(file => uploadImage(file, type)))

      onChange(multiple ? [...value, ...urls] : urls.slice(0, 1))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Upload failed')
    } finally {
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
      <div className='flex flex-wrap items-center gap-3'>
        {value.map((url, index) => (
          <Box key={url + index} className='relative'>
            <Avatar variant='rounded' src={url} sx={{ width: 72, height: 72 }} />
            <IconButton
              size='small'
              color='error'
              onClick={() => removeAt(index)}
              sx={{ position: 'absolute', top: -10, insetInlineEnd: -10, bgcolor: 'background.paper' }}
            >
              <i className='tabler-x text-[16px]' />
            </IconButton>
          </Box>
        ))}
        <Button
          variant='tonal'
          color='secondary'
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          startIcon={uploading ? <CircularProgress size={16} color='inherit' /> : <i className='tabler-upload' />}
        >
          {uploading ? 'Uploading…' : multiple ? 'Add image' : value.length ? 'Replace' : 'Upload'}
        </Button>
      </div>
      <input
        ref={inputRef}
        type='file'
        accept='image/png,image/jpeg,image/webp'
        multiple={multiple}
        hidden
        onChange={e => handleFiles(e.target.files)}
      />
      {error && (
        <Typography variant='caption' color='error'>
          {error}
        </Typography>
      )}
    </div>
  )
}

export default ImageUpload
