'use client'

// Create/edit coupon form. RHF + Zod.
import { useEffect } from 'react'

import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import Card, { CardBody } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import DateInput from '@/components/ui/DateInput'
import Input from '@/components/ui/Input'
import { RadioGroup } from '@/components/ui/Radio'
import Switch from '@/components/ui/Switch'
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
      <CardBody>
        <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-5'>
          <Controller
            name='code'
            control={control}
            render={({ field }) => (
              <Input {...field} required label='Code' placeholder='WELCOME10' error={errors.code?.message} />
            )}
          />
          <Controller
            name='description'
            control={control}
            render={({ field }) => (
              <Input {...field} required label='Description' error={errors.description?.message} />
            )}
          />
          <div className='grid grid-cols-1 gap-5 sm:grid-cols-2'>
            <Controller
              name='discountType'
              control={control}
              render={({ field }) => (
                <RadioGroup
                  inline
                  name='discountType'
                  label='Discount type'
                  value={field.value}
                  onChange={field.onChange}
                  options={DISCOUNT_TYPES.map(type => ({
                    label: type === 'percentage' ? 'Percentage' : 'Fixed amount',
                    value: type
                  }))}
                />
              )}
            />
            <Controller
              name='value'
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  onChange={e => field.onChange(e.target.value === '' ? 0 : Number(e.target.value))}
                  type='number'
                  required
                  label='Value'
                  error={errors.value?.message}
                />
              )}
            />
            <Controller
              name='minPurchase'
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  value={field.value ?? ''}
                  onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                  type='number'
                  label='Minimum purchase (optional)'
                />
              )}
            />
            <Controller
              name='maxDiscount'
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  value={field.value ?? ''}
                  onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                  type='number'
                  label='Maximum discount (optional)'
                />
              )}
            />
            <Controller
              name='usageLimit'
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  value={field.value ?? ''}
                  onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                  type='number'
                  label='Usage limit (optional)'
                />
              )}
            />
            <Controller
              name='expiresAt'
              control={control}
              render={({ field }) => (
                <DateInput {...field} required label='Expires on' error={errors.expiresAt?.message} />
              )}
            />
          </div>
          <Controller
            name='isActive'
            control={control}
            render={({ field }) => (
              <Switch label='Active' checked={field.value} onChange={e => field.onChange(e.target.checked)} />
            )}
          />

          <div className='flex items-center justify-end gap-4'>
            <Button type='button' variant='outlined' color='secondary' onClick={onCancel} disabled={submitting}>
              Cancel
            </Button>
            <Button type='submit' loading={submitting}>
              {isEdit ? 'Save changes' : 'Create'}
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  )
}

export default CouponForm
