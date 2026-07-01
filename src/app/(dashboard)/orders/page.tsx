import type { Metadata } from 'next'

import OrdersView from '@views/orders/OrdersView'

export const metadata: Metadata = {
  title: 'Orders — Al Madina Admin'
}

const OrdersPage = () => <OrdersView />

export default OrdersPage
