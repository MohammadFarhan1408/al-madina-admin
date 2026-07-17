'use client'

// Create/edit collection dialog (doc §5.4). RHF + Zod; accent enum + image.
import { useEffect, useState } from 'react'

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import Autocomplete from '@mui/material/Autocomplete'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import CustomTextField from '@core/components/mui/TextField'
import ImageUpload from '@/components/shared/ImageUpload'
import { useToast } from '@/contexts/ToastContext'
import { getErrorMessage } from '@/libs/api/types'
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
  const [imageUploading, setImageUploading] = useState(false)
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
            sortOrder: collection.sortOrder,
            slug: collection.slug ?? '',
            metaTitle: collection.metaTitle ?? '',
            metaDescription: collection.metaDescription ?? '',
            metaKeywords: collection.metaKeywords ?? []
          }
        : defaultCollectionValues
    )
  }, [open, collection, reset])

  const image = watch('image')
  const metaKeywords = watch('metaKeywords')

  const onSubmit = async (values: CollectionFormValues) => {
    const payload = {
      ...values,
      slug: values.slug || undefined,
      metaTitle: values.metaTitle || undefined,
      metaDescription: values.metaDescription || undefined
    }

    try {
      if (isEdit && collection) {
        await updateMutation.mutateAsync({ id: collection.id, body: payload })
        success('Collection updated')
      } else {
        await createMutation.mutateAsync(payload)
        success('Collection created')
      }

      onClose()
    } catch (err) {
      error(getErrorMessage(err, 'Something went wrong'))
    }
  }

  const submitting = createMutation.isPending || updateMutation.isPending || imageUploading

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
            onUploadingChange={setImageUploading}
            label='Collection image'
            error={errors.image?.message}
          />

          <Divider />
          <Typography variant='overline' color='text.secondary'>
            SEO
          </Typography>
          <Controller
            name='slug'
            control={control}
            render={({ field }) => <CustomTextField {...field} fullWidth label='Slug (optional — auto-generated from title)' />}
          />
          <Controller
            name='metaTitle'
            control={control}
            render={({ field }) => <CustomTextField {...field} fullWidth label='Meta title (optional)' />}
          />
          <Controller
            name='metaDescription'
            control={control}
            render={({ field }) => <CustomTextField {...field} fullWidth multiline minRows={2} label='Meta description (optional)' />}
          />
          <Controller
            name='metaKeywords'
            control={control}
            render={({ field }) => (
              <Autocomplete
                multiple
                freeSolo
                options={[]}
                value={metaKeywords ?? []}
                onChange={(_, next) => field.onChange(next)}
                renderTags={(tagValue, getTagProps) =>
                  tagValue.map((option, index) => {
                    const { key, ...rest } = getTagProps({ index })

                    return <Chip key={key} variant='tonal' label={option} size='small' {...rest} />
                  })
                }
                renderInput={params => (
                  <CustomTextField {...params} label='Meta keywords (optional)' placeholder='Type a keyword and press Enter' />
                )}
              />
            )}
          />
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
