import type { Metadata } from 'next'

import OrderDetailView from '@views/orders/OrderDetailView'

export const metadata: Metadata = {
  title: 'Order — Al Madina Admin'
}

type Props = { params: Promise<{ id: string }> }

const OrderDetailPage = async ({ params }: Props) => {
  const { id } = await params

  return <OrderDetailView id={id} />
}

export default OrderDetailPage
