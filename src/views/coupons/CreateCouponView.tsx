'use client'

import { useRouter } from 'next/navigation'

import PageHeader from '@/components/shared/PageHeader'
import Breadcrumbs from '@/components/shared/Breadcrumbs'
import CouponForm from '@/features/coupons/components/CouponForm'

const CreateCouponView = () => {
  const router = useRouter()

  return (
    <>
      <Breadcrumbs extra={[{ label: 'New Coupon' }]} />
      <PageHeader title='New Coupon' subtitle='Create a new discount code' />
      <CouponForm onSuccess={() => router.push('/coupons')} onCancel={() => router.push('/coupons')} />
    </>
  )
}

export default CreateCouponView
