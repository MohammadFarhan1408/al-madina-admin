'use client'

// Create/edit coupon form. RHF + Zod. Main column: code, discount, limits;
// aside: on/off switch and a plain-language summary of the rule as the
// checkout code applies it (coupons.service computeDiscount).
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import Card, { CardBody, CardHeader } from '@/components/ui/Card'
import DateInput from '@/components/ui/form/DateInput'
import Input from '@/components/ui/form/Input'
import NumberInput from '@/components/ui/form/NumberInput'
import ChoiceChips from '@/components/ui/form/ChoiceChips'
import Button from '@/components/ui/Button'
import FormActions from '@/components/shared/FormActions'
import Switch from '@/components/ui/form/Switch'
import FormLayout from '@/components/shared/FormLayout'
import { useInvalidSubmit } from '@/hooks/useInvalidSubmit'
import { formatCurrency, formatDate } from '@/libs/format'
import { toDateKey } from '@/libs/dateRange'
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

const CURRENCY = 'AED'

// Unambiguous characters only (no 0/O, 1/I) — codes get read aloud and retyped.
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

const randomCode = () => {
  const bytes = crypto.getRandomValues(new Uint8Array(8))

  return Array.from(bytes, b => CODE_ALPHABET[b % CODE_ALPHABET.length]).join('')
}

const inDays = (n: number) => {
  const d = new Date()

  d.setDate(d.getDate() + n)

  return toDateKey(d)
}

const EXPIRY_SHORTCUTS = [
  { label: '+7 days', value: () => inDays(7) },
  { label: '+30 days', value: () => inDays(30) },
  { label: '+90 days', value: () => inDays(90) },
  {
    label: 'End of month',
    value: () => {
      const now = new Date()

      return toDateKey(new Date(now.getFullYear(), now.getMonth() + 1, 0))
    }
  }
]

/** The rule in words, mirroring coupons.service: percentage of the subtotal
 *  (or a flat amount), capped by maxDiscount, never more than the subtotal. */
const describeRule = (v: Partial<CouponFormValues>) => {
  if (v.value === undefined) return 'Set a discount value to see the rule.'

  const amount =
    v.discountType === 'percentage' ? `${v.value}% off the subtotal` : `${formatCurrency(v.value, CURRENCY)} off`

  const parts = [amount]

  if (v.discountType === 'percentage' && v.maxDiscount !== undefined) {
    parts.push(`up to ${formatCurrency(v.maxDiscount, CURRENCY)}`)
  }

  parts.push(v.minPurchase ? `on orders of ${formatCurrency(v.minPurchase, CURRENCY)} or more` : 'on any order')

  return `${parts.join(', ')}.`
}

const CouponForm = ({ coupon, onSuccess, onCancel }: Props) => {
  const { success, error } = useToast()
  const createMutation = useCreateCoupon()
  const updateMutation = useUpdateCoupon()
  const onInvalid = useInvalidSubmit<CouponFormValues>()
  const isEdit = !!coupon

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
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
      expiresAt: toDateKey(new Date(c.expiresAt)),
      isActive: c.isActive
    }),
    defaultCouponValues
  )

  const values = watch()
  const isPercentage = values.discountType === 'percentage'

  const onSubmit = async (form: CouponFormValues) => {
    // The API stores an instant. A bare "2026-10-31" parses as midnight UTC,
    // so the coupon died at the *start* of its last day (04:00 in Dubai).
    // Send the end of that day in the admin's timezone instead.
    const payload = { ...form, expiresAt: new Date(`${form.expiresAt}T23:59:59.999`).toISOString() }

    try {
      if (isEdit && coupon) {
        const updated = await updateMutation.mutateAsync({ id: coupon.id, body: payload })

        success('Coupon updated')
        onSuccess(updated)
      } else {
        const created = await createMutation.mutateAsync(payload)

        success('Coupon created')
        onSuccess(created)
      }
    } catch (err) {
      error(getErrorMessage(err, 'Something went wrong'))
    }
  }

  const submitting = createMutation.isPending || updateMutation.isPending
  const expired = values.expiresAt ? values.expiresAt < toDateKey(new Date()) : false

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)} noValidate>
      <FormLayout
        stickyAside
        aside={
          <>
            <Card>
              <CardHeader title='Status' icon='tabler-toggle-right' />
              <CardBody>
                <Controller
                  name='isActive'
                  control={control}
                  render={({ field }) => (
                    <Switch
                      reverse
                      label='Enabled'
                      description='Switch off to retire the code without deleting it.'
                      checked={field.value}
                      onChange={e => field.onChange(e.target.checked)}
                    />
                  )}
                />
              </CardBody>
            </Card>

            <Card className='overflow-hidden'>
              <CardHeader title='Summary' icon='tabler-receipt' />
              <CardBody className='flex flex-col gap-4'>
                {/* A ticket-style code chip: the thing the customer types. */}
                <div className='flex items-center justify-between gap-3 rounded-md border border-dashed border-primary/70 bg-primary/8 px-3.5 py-3'>
                  <span className='truncate font-mono text-lg font-semibold tracking-[0.12em] text-primaryInk'>
                    {values.code?.trim().toUpperCase() || 'CODE'}
                  </span>
                  <span className='shrink-0 text-sm font-semibold text-textPrimary tabular-nums'>
                    {values.value === undefined
                      ? '—'
                      : isPercentage
                        ? `${values.value}%`
                        : formatCurrency(values.value, CURRENCY)}
                  </span>
                </div>
                <p className='text-sm leading-6 text-textPrimary'>{describeRule(values)}</p>
                <dl className='flex flex-col gap-2 border-t border-border pt-3 text-sm'>
                  <div className='flex justify-between gap-3'>
                    <dt className='text-textMuted'>Uses</dt>
                    <dd className='text-textPrimary tabular-nums'>
                      {isEdit ? `${coupon?.usageCount ?? 0} of ` : ''}
                      {values.usageLimit !== undefined ? values.usageLimit : 'unlimited'}
                    </dd>
                  </div>
                  <div className='flex justify-between gap-3'>
                    <dt className='text-textMuted'>Valid until</dt>
                    <dd className={expired ? 'text-errorDark' : 'text-textPrimary'}>
                      {values.expiresAt ? `${formatDate(values.expiresAt)}, end of day` : '—'}
                      {expired && ' (past)'}
                    </dd>
                  </div>
                  <div className='flex justify-between gap-3'>
                    <dt className='text-textMuted'>Status</dt>
                    <dd className='text-textPrimary'>{values.isActive ? 'Enabled' : 'Disabled'}</dd>
                  </div>
                </dl>
              </CardBody>
            </Card>
          </>
        }
      >
        <Card>
          <CardHeader title='Code' icon='tabler-ticket' description='What customers type at checkout' />
          <CardBody className='flex flex-col gap-5'>
            <Controller
              name='code'
              control={control}
              render={({ field }) => (
                <div className='flex items-end gap-2'>
                  <Input
                    {...field}
                    required
                    label='Code'
                    placeholder='WELCOME10'
                    autoCapitalize='characters'
                    spellCheck={false}
                    containerClassName='flex-1'
                    className='font-mono tracking-[0.08em] uppercase'
                    error={errors.code?.message}
                    helperText='3–24 characters. Saved in capitals.'
                  />
                  <Button
                    type='button'
                    variant='outlined'
                    startIcon={<i className='tabler-wand' />}
                    onClick={() => setValue('code', randomCode(), { shouldDirty: true, shouldValidate: true })}

                    // Clears the helper line under the input (16px text + 6px gap).
                    className='mb-[22px]'
                  >
                    Generate
                  </Button>
                </div>
              )}
            />
            <Controller
              name='description'
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  required
                  label='Description'
                  placeholder='e.g. 10% off a first order'
                  error={errors.description?.message}
                />
              )}
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title='Discount' icon='tabler-discount' />
          <CardBody className='flex flex-col gap-5'>
            <Controller
              name='discountType'
              control={control}
              render={({ field }) => (
                <ChoiceChips
                  label='Type'
                  value={field.value}
                  onChange={field.onChange}
                  options={DISCOUNT_TYPES.map(type => ({
                    value: type,
                    label: type === 'percentage' ? 'Percentage' : 'Fixed amount',
                    icon: type === 'percentage' ? 'tabler-percentage' : 'tabler-cash'
                  }))}
                />
              )}
            />
            <div className='grid grid-cols-1 gap-5 sm:grid-cols-2'>
              <Controller
                name='value'
                control={control}
                render={({ field }) => (
                  <NumberInput
                    {...field}
                    required
                    min={0}
                    max={isPercentage ? 100 : undefined}
                    label={isPercentage ? 'Percentage off' : 'Amount off'}
                    startAdornment={
                      isPercentage ? undefined : <span className='text-xs text-textMuted'>{CURRENCY}</span>
                    }
                    endAdornment={isPercentage ? <span className='text-sm text-textMuted'>%</span> : undefined}
                    error={errors.value?.message}
                  />
                )}
              />
              <Controller
                name='maxDiscount'
                control={control}
                render={({ field }) => (
                  <NumberInput
                    {...field}
                    min={0}
                    label='Maximum discount'
                    startAdornment={<span className='text-xs text-textMuted'>{CURRENCY}</span>}
                    helperText={
                      isPercentage ? 'Optional cap on the amount taken off.' : 'Only matters for percentage coupons.'
                    }
                  />
                )}
              />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title='Limits' icon='tabler-adjustments' description='When and how often the code works' />
          <CardBody className='grid grid-cols-1 gap-5 sm:grid-cols-2'>
            <Controller
              name='minPurchase'
              control={control}
              render={({ field }) => (
                <NumberInput
                  {...field}
                  min={0}
                  label='Minimum order subtotal'
                  startAdornment={<span className='text-xs text-textMuted'>{CURRENCY}</span>}
                  helperText='Optional. Leave blank for any order.'
                />
              )}
            />
            <Controller
              name='usageLimit'
              control={control}
              render={({ field }) => (
                <NumberInput
                  {...field}
                  min={0}
                  step={1}
                  label='Total uses'
                  helperText='Optional. Leave blank for unlimited.'
                />
              )}
            />
            <Controller
              name='expiresAt'
              control={control}
              render={({ field }) => (
                <div className='flex flex-col gap-2 sm:col-span-2'>
                  <DateInput
                    {...field}
                    required
                    label='Expires on'
                    containerClassName='sm:max-w-64'
                    error={errors.expiresAt?.message}
                    helperText='Valid through the end of this day.'
                  />
                  <div className='flex flex-wrap gap-1.5' aria-label='Expiry shortcuts'>
                    {EXPIRY_SHORTCUTS.map(shortcut => (
                      <Button
                        key={shortcut.label}
                        type='button'
                        size='sm'
                        variant='soft'
                        color='secondary'
                        onClick={() =>
                          setValue('expiresAt', shortcut.value(), { shouldDirty: true, shouldValidate: true })
                        }
                      >
                        {shortcut.label}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            />
          </CardBody>
        </Card>
      </FormLayout>

      <FormActions
        dirty={isDirty}
        submitting={submitting}
        submitLabel={isEdit ? 'Save changes' : 'Create coupon'}
        submitIcon={isEdit ? undefined : 'tabler-check'}
        onCancel={onCancel}
      />
    </form>
  )
}

export default CouponForm
