import type { Metadata } from 'next'

import EditCategoryView from '@views/categories/EditCategoryView'

export const metadata: Metadata = {
  title: 'Edit Category — Al Madina Admin'
}

type Props = { params: Promise<{ id: string }> }

const EditCategoryPage = async ({ params }: Props) => {
  const { id } = await params

  return <EditCategoryView id={id} />
}

export default EditCategoryPage
