import type { Metadata } from 'next'

import CouponsView from '@views/coupons/CouponsView'

export const metadata: Metadata = {
  title: 'Coupons — Al Madina Admin'
}

const CouponsPage = () => <CouponsView />

export default CouponsPage
