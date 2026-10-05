'use client'

// Create/edit coupon form. RHF + Zod.
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import Card, { CardBody } from '@/components/ui/Card'
import DateInput from '@/components/ui/form/DateInput'
import Input from '@/components/ui/form/Input'
import NumberInput from '@/components/ui/form/NumberInput'
import SegmentedControl from '@/components/ui/form/SegmentedControl'
import FormActions from '@/components/shared/FormActions'
import Switch from '@/components/ui/form/Switch'
import { useFormSync } from '@/hooks/useFormSync'
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
    formState: { errors, isDirty }
  } = useForm<CouponFormValues>({
    resolver: zodResolver(couponSchema),
    defaultValues: defaultCouponValues
  })

  useFormSync(
    reset,
    coupon,
    c => ({
      code: c.code,
      description: c.description,
      discountType: c.discountType,
      value: c.value,
      minPurchase: c.minPurchase,
      maxDiscount: c.maxDiscount,
      usageLimit: c.usageLimit,
      expiresAt: c.expiresAt.slice(0, 10),
      isActive: c.isActive
    }),
    defaultCouponValues
  )

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
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardBody className='flex flex-col gap-5'>
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
                <div className='flex flex-col gap-1.5'>
                  <span className='text-sm font-medium text-textPrimary'>Discount type</span>
                  <SegmentedControl
                    aria-label='Discount type'
                    value={field.value}
                    onChange={field.onChange}
                    options={DISCOUNT_TYPES.map(type => ({
                      value: type,
                      label: type === 'percentage' ? 'Percentage' : 'Fixed amount'
                    }))}
                  />
                </div>
              )}
            />
            <Controller
              name='value'
              control={control}
              render={({ field }) => <NumberInput {...field} required label='Value' error={errors.value?.message} />}
            />
            <Controller
              name='minPurchase'
              control={control}
              render={({ field }) => <NumberInput {...field} label='Minimum purchase (optional)' />}
            />
            <Controller
              name='maxDiscount'
              control={control}
              render={({ field }) => <NumberInput {...field} label='Maximum discount (optional)' />}
            />
            <Controller
              name='usageLimit'
              control={control}
              render={({ field }) => <NumberInput {...field} label='Usage limit (optional)' />}
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
        </CardBody>
      </Card>

      <FormActions
        dirty={isDirty}
        submitting={submitting}
        submitLabel={isEdit ? 'Save changes' : 'Create'}
        onCancel={onCancel}
      />
    </form>
  )
}

export default CouponForm
