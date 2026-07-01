'use client'

// Create/edit category dialog. RHF + Zod, image via shared ImageUpload.
import { useEffect } from 'react'

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import CustomTextField from '@core/components/mui/TextField'
import ImageUpload from '@/components/shared/ImageUpload'
import { useToast } from '@/contexts/ToastContext'
import { ApiError } from '@/libs/api/types'
import { categorySchema, type CategoryFormValues } from '../schema'
import { useCreateCategory, useUpdateCategory } from '../hooks/useCategories'
import type { Category } from '../types'

type Props = {
  open: boolean
  onClose: () => void
  category?: Category | null
}

const emptyValues: CategoryFormValues = { name: '', tagline: '', image: '', sortOrder: 0 }

const CategoryFormDialog = ({ open, onClose, category }: Props) => {
  const { success, error } = useToast()
  const createMutation = useCreateCategory()
  const updateMutation = useUpdateCategory()
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
    defaultValues: emptyValues
  })

  useEffect(() => {
    if (open) {
      reset(
        category
          ? {
              name: category.name,
              tagline: category.tagline ?? '',
              image: category.image,
              sortOrder: category.sortOrder
            }
          : emptyValues
      )
    }
  }, [open, category, reset])

  const image = watch('image')

  const onSubmit = async (values: CategoryFormValues) => {
    try {
      if (isEdit && category) {
        await updateMutation.mutateAsync({ id: category.id, body: values })
        success('Category updated')
      } else {
        await createMutation.mutateAsync(values)
        success('Category created')
      }

      onClose()
    } catch (err) {
      error(err instanceof ApiError ? err.message : 'Something went wrong')
    }
  }

  const submitting = createMutation.isPending || updateMutation.isPending

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
            label='Category image'
          />
          {errors.image && (
            <span className='text-error text-sm'>{errors.image.message}</span>
          )}
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
