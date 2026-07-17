'use client'

// Create/edit category dialog. RHF + Zod, image via shared ImageUpload.
import { useEffect, useState } from 'react'

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
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
import { categorySchema, defaultCategoryValues, type CategoryFormValues } from '../schema'
import { useCreateCategory, useUpdateCategory } from '../hooks/useCategories'
import type { Category } from '../types'

type Props = {
  open: boolean
  onClose: () => void
  category?: Category | null
}

const CategoryFormDialog = ({ open, onClose, category }: Props) => {
  const { success, error } = useToast()
  const createMutation = useCreateCategory()
  const updateMutation = useUpdateCategory()
  const [imageUploading, setImageUploading] = useState(false)
  const isEdit = !!category

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: defaultCategoryValues
  })

  useEffect(() => {
    if (open) {
      reset(
        category
          ? {
              name: category.name,
              tagline: category.tagline ?? '',
              image: category.image,
              sortOrder: category.sortOrder,
              slug: category.slug ?? '',
              metaTitle: category.metaTitle ?? '',
              metaDescription: category.metaDescription ?? '',
              metaKeywords: category.metaKeywords ?? []
            }
          : defaultCategoryValues
      )
    }
  }, [open, category, reset])

  const image = watch('image')
  const metaKeywords = watch('metaKeywords')

  const onSubmit = async (values: CategoryFormValues) => {
    const payload = {
      ...values,
      slug: values.slug || undefined,
      metaTitle: values.metaTitle || undefined,
      metaDescription: values.metaDescription || undefined
    }

    try {
      if (isEdit && category) {
        await updateMutation.mutateAsync({ id: category.id, body: payload })
        success('Category updated')
      } else {
        await createMutation.mutateAsync(payload)
        success('Category created')
      }

      onClose()
    } catch (err) {
      error(getErrorMessage(err, 'Something went wrong'))
    }
  }

  const submitting = createMutation.isPending || updateMutation.isPending || imageUploading

  return (
    <Dialog open={open} onClose={submitting ? undefined : onClose} maxWidth='sm' fullWidth>
      <DialogTitle>{isEdit ? 'Edit Category' : 'Add Category'}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent className='flex flex-col gap-5'>
          <Controller
            name='name'
            control={control}
            render={({ field }) => (
              <CustomTextField {...field} fullWidth label='Name' error={!!errors.name} helperText={errors.name?.message} />
            )}
          />
          <Controller
            name='tagline'
            control={control}
            render={({ field }) => <CustomTextField {...field} fullWidth label='Tagline' />}
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
            type='category'
            value={image ? [image] : []}
            onChange={urls => setValue('image', urls[0] ?? '', { shouldValidate: true })}
            onUploadingChange={setImageUploading}
            label='Category image'
            error={errors.image?.message}
          />

          <Divider />
          <Typography variant='overline' color='text.secondary'>
            SEO
          </Typography>
          <Controller
            name='slug'
            control={control}
            render={({ field }) => <CustomTextField {...field} fullWidth label='Slug (optional — auto-generated from name)' />}
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

export default CategoryFormDialog
