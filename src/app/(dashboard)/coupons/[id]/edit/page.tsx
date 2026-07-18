import type { Metadata } from 'next'

import EditCouponView from '@views/coupons/EditCouponView'

export const metadata: Metadata = {
  title: 'Edit Coupon — Al Madina Admin'
}

type Props = { params: Promise<{ id: string }> }

const EditCouponPage = async ({ params }: Props) => {
  const { id } = await params

  return <EditCouponView id={id} />
}

export default EditCouponPage
