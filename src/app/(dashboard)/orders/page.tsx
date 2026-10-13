import { Suspense } from 'react'

import type { Metadata } from 'next'

import OrdersView from '@views/orders/OrdersView'
import BrandLoader from '@components/shared/BrandLoader'

export const metadata: Metadata = {
  title: 'Orders — Al Madina Admin'
}

// OrdersView reads its filters from the URL (useSearchParams), which needs a
// Suspense boundary to prerender.
const OrdersPage = () => (
  <Suspense fallback={<BrandLoader />}>
    <OrdersView />
  </Suspense>
)

export default OrdersPage
