import type { Metadata } from 'next'

import EditProductView from '@views/products/EditProductView'

export const metadata: Metadata = {
  title: 'Edit Product — Al Madina Admin'
}

type Props = { params: Promise<{ id: string }> }

const EditProductPage = async ({ params }: Props) => {
  const { id } = await params

  return <EditProductView id={id} />
}

export default EditProductPage
