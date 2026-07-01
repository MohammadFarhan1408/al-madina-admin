'use client'

// Create/edit product drawer. RHF + Zod; gallery via shared ImageUpload
// (type=product). Category options come from the categories feature.
import { useEffect } from 'react'

import Drawer from '@mui/material/Drawer'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import CircularProgress from '@mui/material/CircularProgress'
import Grid from '@mui/material/Grid'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import CustomTextField from '@core/components/mui/TextField'
import ImageUpload from '@/components/shared/ImageUpload'
import { useToast } from '@/contexts/ToastContext'
import { ApiError } from '@/libs/api/types'
import { useCategories } from '@/features/categories/hooks/useCategories'
import { productSchema, defaultProductValues, type ProductFormValues } from '../schema'
import { useCreateProduct, useUpdateProduct } from '../hooks/useProducts'
import { PRODUCT_BADGES, SCENT_FAMILIES, type Product } from '../types'
import { humanize } from '@/libs/format'

type Props = {
  open: boolean
  onClose: () => void
  product?: Product | null
}

const RAIL_FLAGS: { name: keyof ProductFormValues; label: string }[] = [
  { name: 'inStock', label: 'In stock' },
  { name: 'isFeatured', label: 'Featured' },
  { name: 'isNewArrival', label: 'New arrival' },
  { name: 'isBestSeller', label: 'Best seller' },
  { name: 'isSignature', label: 'Signature' },
  { name: 'isSeasonal', label: 'Seasonal' }
]

const ProductFormDrawer = ({ open, onClose, product }: Props) => {
  const { success, error } = useToast()
  const { data: categories } = useCategories()
  const createMutation = useCreateProduct()
  const updateMutation = useUpdateProduct()
  const isEdit = !!product

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: defaultProductValues
  })

  useEffect(() => {
    if (!open) return

    reset(
      product
        ? {
            name: product.name,
            nameAr: product.nameAr ?? '',
            brand: product.brand,
            categoryId: product.categoryId,
            description: product.description,
            scentFamily: product.scentFamily,
            volumeMl: product.volumeMl,
            price: product.price,
            originalPrice: product.originalPrice,
            currency: product.currency,
            notes: product.notes ?? [],
            images: product.images ?? [],
            badge: product.badge,
            inStock: product.inStock,
            isFeatured: product.isFeatured,
            isNewArrival: product.isNewArrival,
            isBestSeller: product.isBestSeller,
            isSignature: product.isSignature,
            isSeasonal: product.isSeasonal
          }
        : defaultProductValues
    )
  }, [open, product, reset])

  const images = watch('images')
  const notes = watch('notes')

  const onSubmit = async (values: ProductFormValues) => {
    // Drop empty optional fields so we don't send blank strings.
    const payload = { ...values, nameAr: values.nameAr || undefined }

    try {
      if (isEdit && product) {
        await updateMutation.mutateAsync({ id: product.id, body: payload })
        success('Product updated')
      } else {
        await createMutation.mutateAsync(payload)
        success('Product created')
      }

      onClose()
    } catch (err) {
      error(err instanceof ApiError ? err.message : 'Something went wrong')
    }
  }

  const submitting = createMutation.isPending || updateMutation.isPending

  return (
    <Drawer
      open={open}
      anchor='right'
      onClose={submitting ? undefined : onClose}
      ModalProps={{ keepMounted: false }}
      PaperProps={{ sx: { width: { xs: '100%', sm: 520 } } }}
    >
      <div className='flex items-center justify-between plb-4 pli-6'>
        <Typography variant='h5'>{isEdit ? 'Edit Product' : 'Add Product'}</Typography>
        <IconButton size='small' onClick={onClose} disabled={submitting}>
          <i className='tabler-x text-textPrimary' />
        </IconButton>
      </div>
      <Divider />
      <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-5 p-6'>
        <Controller
          name='name'
          control={control}
          render={({ field }) => (
            <CustomTextField {...field} fullWidth label='Name' error={!!errors.name} helperText={errors.name?.message} />
          )}
        />
        <Controller
          name='nameAr'
          control={control}
          render={({ field }) => <CustomTextField {...field} fullWidth label='Arabic name' dir='rtl' />}
        />
        <Controller
          name='brand'
          control={control}
          render={({ field }) => (
            <CustomTextField {...field} fullWidth label='Brand' error={!!errors.brand} helperText={errors.brand?.message} />
          )}
        />
        <Controller
          name='categoryId'
          control={control}
          render={({ field }) => (
            <CustomTextField
              {...field}
              select
              fullWidth
              label='Category'
              error={!!errors.categoryId}
              helperText={errors.categoryId?.message}
            >
              {(categories ?? []).map(category => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </CustomTextField>
          )}
        />
        <Controller
          name='scentFamily'
          control={control}
          render={({ field }) => (
            <CustomTextField {...field} select fullWidth label='Scent family'>
              {SCENT_FAMILIES.map(family => (
                <MenuItem key={family} value={family}>
                  {humanize(family)}
                </MenuItem>
              ))}
            </CustomTextField>
          )}
        />
        <Controller
          name='description'
          control={control}
          render={({ field }) => (
            <CustomTextField
              {...field}
              fullWidth
              multiline
              minRows={3}
              label='Description'
              error={!!errors.description}
              helperText={errors.description?.message}
            />
          )}
        />

        <Grid container spacing={4}>
          <Grid size={6}>
            <Controller
              name='volumeMl'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  onChange={e => field.onChange(e.target.value === '' ? 0 : Number(e.target.value))}
                  type='number'
                  fullWidth
                  label='Volume (ml)'
                  error={!!errors.volumeMl}
                  helperText={errors.volumeMl?.message}
                />
              )}
            />
          </Grid>
          <Grid size={6}>
            <Controller
              name='currency'
              control={control}
              render={({ field }) => <CustomTextField {...field} fullWidth label='Currency' />}
            />
          </Grid>
          <Grid size={6}>
            <Controller
              name='price'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  onChange={e => field.onChange(e.target.value === '' ? 0 : Number(e.target.value))}
                  type='number'
                  fullWidth
                  label='Price'
                  error={!!errors.price}
                  helperText={errors.price?.message}
                />
              )}
            />
          </Grid>
          <Grid size={6}>
            <Controller
              name='originalPrice'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  value={field.value ?? ''}
                  onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                  type='number'
                  fullWidth
                  label='Original price'
                />
              )}
            />
          </Grid>
        </Grid>

        <Controller
          name='notes'
          control={control}
          render={() => (
            <CustomTextField
              fullWidth
              label='Fragrance notes'
              placeholder='Comma separated, e.g. Rose, Amber, Musk'
              value={(notes ?? []).join(', ')}
              onChange={e =>
                setValue(
                  'notes',
                  e.target.value
                    .split(',')
                    .map(n => n.trim())
                    .filter(Boolean)
                )
              }
            />
          )}
        />

        <Controller
          name='badge'
          control={control}
          render={({ field }) => (
            <CustomTextField {...field} value={field.value ?? ''} select fullWidth label='Badge'>
              <MenuItem value=''>None</MenuItem>
              {PRODUCT_BADGES.map(badge => (
                <MenuItem key={badge} value={badge}>
                  {humanize(badge)}
                </MenuItem>
              ))}
            </CustomTextField>
          )}
        />

        <ImageUpload
          type='product'
          multiple
          value={images ?? []}
          onChange={urls => setValue('images', urls)}
          label='Gallery images'
        />

        <Divider />
        <div className='flex flex-wrap gap-x-6'>
          {RAIL_FLAGS.map(flag => (
            <Controller
              key={flag.name}
              name={flag.name}
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Switch checked={!!field.value} onChange={e => field.onChange(e.target.checked)} />}
                  label={flag.label}
                />
              )}
            />
          ))}
        </div>

        <div className='flex items-center gap-4'>
          <Button type='submit' variant='contained' disabled={submitting}>
            {submitting ? <CircularProgress size={20} color='inherit' /> : isEdit ? 'Save changes' : 'Create'}
          </Button>
          <Button variant='tonal' color='secondary' onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
        </div>
      </form>
    </Drawer>
  )
}

export default ProductFormDrawer
