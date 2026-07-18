import type { Metadata } from 'next'

import CustomerDetailView from '@views/customers/CustomerDetailView'

export const metadata: Metadata = {
  title: 'Customer — Al Madina Admin'
}

type Props = { params: Promise<{ id: string }> }

const CustomerDetailPage = async ({ params }: Props) => {
  const { id } = await params

  return <CustomerDetailView id={id} />
}

export default CustomerDetailPage
