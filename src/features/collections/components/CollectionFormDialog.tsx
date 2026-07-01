'use client'

// Create/edit collection dialog (doc §5.4). RHF + Zod; accent enum + image.
import { useEffect } from 'react'

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import CircularProgress from '@mui/material/CircularProgress'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import CustomTextField from '@core/components/mui/TextField'
import ImageUpload from '@/components/shared/ImageUpload'
import { useToast } from '@/contexts/ToastContext'
import { ApiError } from '@/libs/api/types'
import { humanize } from '@/libs/format'
import { collectionSchema, defaultCollectionValues, type CollectionFormValues } from '../schema'
import { useCreateCollection, useUpdateCollection } from '../hooks/useCollections'
import { COLLECTION_ACCENTS, type Collection } from '../types'

type Props = {
  open: boolean
  onClose: () => void
  collection?: Collection | null
}

const CollectionFormDialog = ({ open, onClose, collection }: Props) => {
  const { success, error } = useToast()
  const createMutation = useCreateCollection()
  const updateMutation = useUpdateCollection()
  const isEdit = !!collection

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm<CollectionFormValues>({
    resolver: zodResolver(collectionSchema),
    defaultValues: defaultCollectionValues
  })

  useEffect(() => {
    if (!open) return

    reset(
      collection
        ? {
            title: collection.title,
            subtitle: collection.subtitle,
            image: collection.image,
            accent: collection.accent,
            sortOrder: collection.sortOrder
          }
        : defaultCollectionValues
    )
  }, [open, collection, reset])

  const image = watch('image')

  const onSubmit = async (values: CollectionFormValues) => {
    try {
      if (isEdit && collection) {
        await updateMutation.mutateAsync({ id: collection.id, body: values })
        success('Collection updated')
      } else {
        await createMutation.mutateAsync(values)
        success('Collection created')
      }

      onClose()
    } catch (err) {
      error(err instanceof ApiError ? err.message : 'Something went wrong')
    }
  }

  const submitting = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onClose={submitting ? undefined : onClose} maxWidth='sm' fullWidth>
      <DialogTitle>{isEdit ? 'Edit Collection' : 'Add Collection'}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent className='flex flex-col gap-5'>
          <Controller
            name='title'
            control={control}
            render={({ field }) => (
              <CustomTextField {...field} fullWidth label='Title' error={!!errors.title} helperText={errors.title?.message} />
            )}
          />
          <Controller
            name='subtitle'
            control={control}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label='Subtitle'
                error={!!errors.subtitle}
                helperText={errors.subtitle?.message}
              />
            )}
          />
          <Controller
            name='accent'
            control={control}
            render={({ field }) => (
              <CustomTextField {...field} select fullWidth label='Accent'>
                {COLLECTION_ACCENTS.map(accent => (
                  <MenuItem key={accent} value={accent}>
                    {humanize(accent)}
                  </MenuItem>
                ))}
              </CustomTextField>
            )}
          />
          <Controller
            name='sortOrder'
            control={control}
            render={({ field }) => (
              <CustomTextField
                {...field}
                onChange={e => field.onChange(e.target.value === '' ? 0 : Number(e.target.value))}
                type='number'
                fullWidth
                label='Sort order'
                error={!!errors.sortOrder}
                helperText={errors.sortOrder?.message}
              />
            )}
          />
          <ImageUpload
            type='collection'
            value={image ? [image] : []}
            onChange={urls => setValue('image', urls[0] ?? '', { shouldValidate: true })}
            label='Collection image'
          />
          {errors.image && <span className='text-error text-sm'>{errors.image.message}</span>}
        </DialogContent>
        <DialogActions>
          <Button color='secondary' variant='tonal' onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type='submit' variant='contained' disabled={submitting}>
            {submitting ? <CircularProgress size={20} color='inherit' /> : isEdit ? 'Save changes' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default CollectionFormDialog
