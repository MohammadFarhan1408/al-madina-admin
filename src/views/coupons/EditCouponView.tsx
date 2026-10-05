'use client'

import { useRouter } from 'next/navigation'

import PageHeader from '@/components/shared/PageHeader'
import Breadcrumbs from '@/components/shared/Breadcrumbs'
import QueryState from '@/components/shared/QueryState'
import CouponForm from '@/features/coupons/components/CouponForm'
import { useCoupon } from '@/features/coupons/hooks/useCoupons'

type Props = { id: string }

const EditCouponView = ({ id }: Props) => {
  const router = useRouter()
  const { data: coupon, isLoading, isError, error, refetch } = useCoupon(id)

  if (isLoading || !coupon) {
    return (
      <>
        <Breadcrumbs />
        <PageHeader title='Edit Coupon' />
        <QueryState isError={isError} error={error} onRetry={() => refetch()} fallbackMessage='Failed to load coupon.' />
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
