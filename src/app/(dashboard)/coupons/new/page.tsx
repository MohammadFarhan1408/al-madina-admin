import type { Metadata } from 'next'

import CreateCouponView from '@views/coupons/CreateCouponView'

export const metadata: Metadata = {
  title: 'New Coupon — Al Madina Admin'
}

const NewCouponPage = () => <CreateCouponView />

export default NewCouponPage
