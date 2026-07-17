'use client'

// Create/edit product drawer. RHF + Zod; gallery via shared ImageUpload
// (type=product). Category options come from the categories feature.
import { useEffect, useMemo, useState } from 'react'

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
import Autocomplete from '@mui/material/Autocomplete'
import Chip from '@mui/material/Chip'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import CustomTextField from '@core/components/mui/TextField'
import ImageUpload from '@/components/shared/ImageUpload'
import { useToast } from '@/contexts/ToastContext'
import { getErrorMessage } from '@/libs/api/types'
import { useCategories } from '@/features/categories/hooks/useCategories'
import { useTags } from '@/features/tags/hooks/useTags'
import { productSchema, defaultProductValues, type ProductFormValues } from '../schema'
import { useCreateProduct, useUpdateProduct } from '../hooks/useProducts'
import { PRODUCT_BADGES, PRODUCT_VARIANT_SIZES_ML, SCENT_FAMILIES, type Product } from '../types'
import { humanize } from '@/libs/format'

type Props = {
  open: boolean
  onClose: () => void
  product?: Product | null
}

const AVAILABILITY_FLAGS: { name: keyof ProductFormValues; label: string }[] = [{ name: 'inStock', label: 'In stock' }]

const MERCHANDISING_FLAGS: { name: keyof ProductFormValues; label: string }[] = [
  { name: 'isFeatured', label: 'Featured' },
  { name: 'isNewArrival', label: 'New arrival' },
  { name: 'isBestSeller', label: 'Best seller' },
  { name: 'isSignature', label: 'Signature' },
  { name: 'isSeasonal', label: 'Seasonal' }
]

const ProductFormDrawer = ({ open, onClose, product }: Props) => {
  const { success, error } = useToast()
  const { data: categories } = useCategories()
  const { data: tags } = useTags()
  const createMutation = useCreateProduct()
  const updateMutation = useUpdateProduct()
  const [imagesUploading, setImagesUploading] = useState(false)
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

  const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({
    control,
    name: 'variants'
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
            isSeasonal: product.isSeasonal,
            variants: product.variants ?? [],
            tagIds: product.tagIds ?? [],
            slug: product.slug ?? '',
            metaTitle: product.metaTitle ?? '',
            metaDescription: product.metaDescription ?? '',
            metaKeywords: product.metaKeywords ?? []
          }
        : defaultProductValues
    )
  }, [open, product, reset])

  const images = watch('images')
  const notes = watch('notes')
  const tagIds = watch('tagIds')
  const metaKeywords = watch('metaKeywords')

  const selectedTags = useMemo(() => (tags ?? []).filter(t => tagIds.includes(t.id)), [tags, tagIds])

  const onSubmit = async (values: ProductFormValues) => {
    // Drop empty optional fields so we don't send blank strings.
    const payload = {
      ...values,
      nameAr: values.nameAr || undefined,
      slug: values.slug || undefined,
      metaTitle: values.metaTitle || undefined,
      metaDescription: values.metaDescription || undefined
    }

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
      error(getErrorMessage(err, 'Something went wrong'))
    }
  }

  const submitting = createMutation.isPending || updateMutation.isPending || imagesUploading

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
        <IconButton size='small' onClick={onClose} disabled={submitting} aria-label='Close'>
          <i className='tabler-x text-textPrimary' />
        </IconButton>
      </div>
      <Divider />
      <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-5 p-6'>
        <Controller
          name='name'
          control={control}
          render={({ field }) => (
            <CustomTextField {...field} fullWidth required label='Name' error={!!errors.name} helperText={errors.name?.message} />
          )}
        />
        <Controller
          name='nameAr'
          control={control}
          render={({ field }) => <CustomTextField {...field} fullWidth label='Arabic name (optional)' dir='rtl' />}
        />
        <Controller
          name='brand'
          control={control}
          render={({ field }) => (
            <CustomTextField {...field} fullWidth required label='Brand' error={!!errors.brand} helperText={errors.brand?.message} />
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
              required
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
            <CustomTextField {...field} select fullWidth required label='Scent family'>
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
              required
              multiline
              minRows={3}
              label='Description'
              error={!!errors.description}
              helperText={errors.description?.message}
            />
          )}
        />

        <Typography variant='overline' color='text.secondary'>
          Pricing
        </Typography>
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name='volumeMl'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  select
                  onChange={e => field.onChange(Number(e.target.value))}
                  fullWidth
                  required
                  label='Volume (ml)'
                  error={!!errors.volumeMl}
                  helperText={errors.volumeMl?.message}
                >
                  {PRODUCT_VARIANT_SIZES_ML.map(size => (
                    <MenuItem key={size} value={size}>
                      {size}ml
                    </MenuItem>
                  ))}
                </CustomTextField>
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name='currency'
              control={control}
              render={({ field }) => <CustomTextField {...field} fullWidth label='Currency' />}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name='price'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  onChange={e => field.onChange(e.target.value === '' ? 0 : Number(e.target.value))}
                  type='number'
                  fullWidth
                  required
                  label='Price'
                  error={!!errors.price}
                  helperText={errors.price?.message}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
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
                  label='Original price (optional)'
                />
              )}
            />
          </Grid>
        </Grid>

        <Controller
          name='notes'
          control={control}
          render={({ field }) => (
            <Autocomplete
              multiple
              freeSolo
              options={[]}
              value={notes ?? []}
              onChange={(_, next) => field.onChange(next)}
              renderTags={(tagValue, getTagProps) =>
                tagValue.map((option, index) => {
                  const { key, ...rest } = getTagProps({ index })

                  return <Chip key={key} variant='tonal' label={option} size='small' {...rest} />
                })
              }
              renderInput={params => (
                <CustomTextField {...params} label='Fragrance notes' placeholder='Type a note and press Enter' />
              )}
            />
          )}
        />

        <Controller
          name='badge'
          control={control}
          render={({ field }) => (
            <CustomTextField {...field} value={field.value ?? ''} select fullWidth label='Badge (optional)'>
              <MenuItem value=''>None</MenuItem>
              {PRODUCT_BADGES.map(badge => (
                <MenuItem key={badge} value={badge}>
                  {humanize(badge)}
                </MenuItem>
              ))}
            </CustomTextField>
          )}
        />

        <Autocomplete
          multiple
          options={tags ?? []}
          value={selectedTags}
          getOptionLabel={t => t.name}
          isOptionEqualToValue={(a, b) => a.id === b.id}
          onChange={(_, next) => setValue('tagIds', next.map(t => t.id))}
          renderTags={(tagValue, getTagProps) =>
            tagValue.map((option, index) => {
              const { key, ...rest } = getTagProps({ index })

              return <Chip key={key} variant='tonal' label={option.name} size='small' {...rest} />
            })
          }
          renderInput={params => <CustomTextField {...params} label='Tags' placeholder='Select tags' />}
        />

        <ImageUpload
          type='product'
          multiple
          value={images ?? []}
          onChange={urls => setValue('images', urls)}
          onUploadingChange={setImagesUploading}
          label='Gallery images'
        />

        <Divider />
        <div className='flex flex-col gap-3'>
          <div className='flex items-center justify-between'>
            <Typography variant='overline' color='text.secondary'>
              Variants
            </Typography>
            <Button
              size='small'
              startIcon={<i className='tabler-plus' />}
              onClick={() => appendVariant({ volumeMl: 50, price: 0, sku: '', barcode: '', stock: 0, inStock: true })}
            >
              Add size
            </Button>
          </div>
          {variantFields.length === 0 && (
            <Typography variant='caption' color='text.secondary'>
              No additional bottle sizes — the product sells at the base volume/price above.
            </Typography>
          )}
          {variantFields.map((variantField, index) => (
            <Grid container key={variantField.id} spacing={3} alignItems='center'>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Controller
                  name={`variants.${index}.volumeMl`}
                  control={control}
                  render={({ field }) => (
                    <CustomTextField {...field} select fullWidth label='Size' onChange={e => field.onChange(Number(e.target.value))}>
                      {PRODUCT_VARIANT_SIZES_ML.map(size => (
                        <MenuItem key={size} value={size}>
                          {size}ml
                        </MenuItem>
                      ))}
                    </CustomTextField>
                  )}
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Controller
                  name={`variants.${index}.price`}
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      onChange={e => field.onChange(e.target.value === '' ? 0 : Number(e.target.value))}
                      type='number'
                      fullWidth
                      label='Price'
                      error={!!errors.variants?.[index]?.price}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Controller
                  name={`variants.${index}.sku`}
                  control={control}
                  render={({ field }) => (
                    <CustomTextField {...field} fullWidth label='SKU' error={!!errors.variants?.[index]?.sku} />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 5, sm: 2 }}>
                <Controller
                  name={`variants.${index}.stock`}
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      onChange={e => field.onChange(e.target.value === '' ? 0 : Number(e.target.value))}
                      type='number'
                      fullWidth
                      label='Stock'
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 1 }}>
                <IconButton size='small' color='error' aria-label='Remove size' onClick={() => removeVariant(index)}>
                  <i className='tabler-trash' />
                </IconButton>
              </Grid>
            </Grid>
          ))}
        </div>

        <Divider />
        <div className='flex flex-col gap-5'>
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
        </div>

        <Divider />
        <div className='flex flex-col gap-3'>
          <Typography variant='overline' color='text.secondary'>
            Availability
          </Typography>
          <div className='flex flex-wrap gap-x-6 gap-y-2'>
            {AVAILABILITY_FLAGS.map(flag => (
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
          <Typography variant='overline' color='text.secondary'>
            Merchandising &amp; rails
          </Typography>
          <div className='flex flex-wrap gap-x-6 gap-y-2'>
            {MERCHANDISING_FLAGS.map(flag => (
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
        </div>

        <Divider />
        <div className='flex items-center justify-end gap-4'>
          <Button variant='tonal' color='secondary' onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type='submit' variant='contained' disabled={submitting}>
            {submitting ? <CircularProgress size={20} color='inherit' /> : isEdit ? 'Save changes' : 'Create'}
          </Button>
        </div>
      </form>
    </Drawer>
  )
}

export default ProductFormDrawer
