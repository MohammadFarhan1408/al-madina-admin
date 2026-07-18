'use client'

import { useRouter } from 'next/navigation'

import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'

import PageHeader from '@/components/shared/PageHeader'
import Breadcrumbs from '@/components/shared/Breadcrumbs'
import CouponForm from '@/features/coupons/components/CouponForm'
import { useCoupon } from '@/features/coupons/hooks/useCoupons'

type Props = { id: string }

const EditCouponView = ({ id }: Props) => {
  const router = useRouter()
  const { data: coupon, isLoading, isError, error } = useCoupon(id)

  if (isLoading || !coupon) {
    return (
      <>
        <Breadcrumbs />
        <PageHeader title='Edit Coupon' />
        {isError ? (
          <Alert severity='error'>{(error as Error)?.message || 'Failed to load coupon.'}</Alert>
        ) : (
          <div className='flex justify-center p-8'>
            <CircularProgress />
          </div>
        )}
      </>
    )
  }

  return (
    <>
      <Breadcrumbs extra={[{ label: coupon.code, href: '/coupons' }, { label: 'Edit' }]} />
      <PageHeader title={`Edit ${coupon.code}`} />
      <CouponForm coupon={coupon} onSuccess={() => router.push('/coupons')} onCancel={() => router.push('/coupons')} />
    </>
  )
}

export default EditCouponView
