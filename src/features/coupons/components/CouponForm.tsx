'use client'

// Create/edit coupon form. RHF + Zod.
import { useEffect } from 'react'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import Grid from '@mui/material/Grid'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import CircularProgress from '@mui/material/CircularProgress'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import CustomTextField from '@core/components/mui/TextField'
import { useToast } from '@/contexts/ToastContext'
import { getErrorMessage } from '@/libs/api/types'
import { couponSchema, defaultCouponValues, type CouponFormValues } from '../schema'
import { useCreateCoupon, useUpdateCoupon } from '../hooks/useCoupons'
import { DISCOUNT_TYPES, type Coupon } from '../types'

type Props = {
  coupon?: Coupon | null
  onSuccess: (coupon: Coupon) => void
  onCancel: () => void
}

const CouponForm = ({ coupon, onSuccess, onCancel }: Props) => {
  const { success, error } = useToast()
  const createMutation = useCreateCoupon()
  const updateMutation = useUpdateCoupon()
  const isEdit = !!coupon

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<CouponFormValues>({
    resolver: zodResolver(couponSchema),
    defaultValues: defaultCouponValues
  })

  useEffect(() => {
    reset(
      coupon
        ? {
            code: coupon.code,
            description: coupon.description,
            discountType: coupon.discountType,
            value: coupon.value,
            minPurchase: coupon.minPurchase,
            maxDiscount: coupon.maxDiscount,
            usageLimit: coupon.usageLimit,
            expiresAt: coupon.expiresAt.slice(0, 10),
            isActive: coupon.isActive
          }
        : defaultCouponValues
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coupon])

  const onSubmit = async (values: CouponFormValues) => {
    try {
      if (isEdit && coupon) {
        const updated = await updateMutation.mutateAsync({ id: coupon.id, body: values })

        success('Coupon updated')
        onSuccess(updated)
      } else {
        const created = await createMutation.mutateAsync(values)

        success('Coupon created')
        onSuccess(created)
      }
    } catch (err) {
      error(getErrorMessage(err, 'Something went wrong'))
    }
  }

  const submitting = createMutation.isPending || updateMutation.isPending

  return (
    <Card>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-5'>
          <Controller
            name='code'
            control={control}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                required
                label='Code'
                placeholder='WELCOME10'
                error={!!errors.code}
                helperText={errors.code?.message}
              />
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
                label='Description'
                error={!!errors.description}
                helperText={errors.description?.message}
              />
            )}
          />
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name='discountType'
                control={control}
                render={({ field }) => (
                  <CustomTextField {...field} select fullWidth label='Discount type'>
                    {DISCOUNT_TYPES.map(type => (
                      <MenuItem key={type} value={type}>
                        {type === 'percentage' ? 'Percentage' : 'Fixed amount'}
                      </MenuItem>
                    ))}
                  </CustomTextField>
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name='value'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    onChange={e => field.onChange(e.target.value === '' ? 0 : Number(e.target.value))}
                    type='number'
                    fullWidth
                    required
                    label='Value'
                    error={!!errors.value}
                    helperText={errors.value?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name='minPurchase'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    value={field.value ?? ''}
                    onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                    type='number'
                    fullWidth
                    label='Minimum purchase (optional)'
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name='maxDiscount'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    value={field.value ?? ''}
                    onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                    type='number'
                    fullWidth
                    label='Maximum discount (optional)'
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name='usageLimit'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    value={field.value ?? ''}
                    onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                    type='number'
                    fullWidth
                    label='Usage limit (optional)'
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name='expiresAt'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    type='date'
                    fullWidth
                    required
                    label='Expires on'
                    error={!!errors.expiresAt}
                    helperText={errors.expiresAt?.message}
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                )}
              />
            </Grid>
          </Grid>
          <Controller
            name='isActive'
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Switch checked={field.value} onChange={e => field.onChange(e.target.checked)} />}
                label='Active'
              />
            )}
          />

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

export default CouponForm
