'use client'

// Create/edit collection form (doc §5.4). RHF + Zod; accent enum + image.
import { useEffect, useState } from 'react'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import Divider from '@mui/material/Divider'
import CircularProgress from '@mui/material/CircularProgress'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import CustomTextField from '@core/components/mui/TextField'
import ImageUpload from '@/components/shared/ImageUpload'
import SeoFieldsSection from '@/components/shared/SeoFieldsSection'
import { useToast } from '@/contexts/ToastContext'
import { getErrorMessage } from '@/libs/api/types'
import { humanize } from '@/libs/format'
import { collectionSchema, defaultCollectionValues, type CollectionFormValues } from '../schema'
import { useCreateCollection, useUpdateCollection } from '../hooks/useCollections'
import { COLLECTION_ACCENTS, type Collection } from '../types'

type Props = {
  collection?: Collection | null
  onSuccess: (collection: Collection) => void
  onCancel: () => void
}

const CollectionForm = ({ collection, onSuccess, onCancel }: Props) => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collection])

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
        const updated = await updateMutation.mutateAsync({ id: collection.id, body: payload })

        success('Collection updated')
        onSuccess(updated)
      } else {
        const created = await createMutation.mutateAsync(payload)

        success('Collection created')
        onSuccess(created)
      }
    } catch (err) {
      error(getErrorMessage(err, 'Something went wrong'))
    }
  }

  const submitting = createMutation.isPending || updateMutation.isPending || imageUploading

  return (
    <Card>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-5'>
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
          <SeoFieldsSection control={control} metaKeywords={metaKeywords ?? []} sourceFieldLabel='title' />

          <Divider />
          <div className='flex items-center justify-end gap-4'>
            <Button color='secondary' variant='tonal' onClick={onCancel} disabled={submitting}>
              Cancel
            </Button>
            <Button type='submit' variant='contained' disabled={submitting}>
              {submitting ? <CircularProgress size={20} color='inherit' /> : isEdit ? 'Save changes' : 'Create'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default CollectionForm
