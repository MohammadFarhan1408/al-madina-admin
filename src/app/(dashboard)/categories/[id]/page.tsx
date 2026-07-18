import type { Metadata } from 'next'

import CategoryDetailView from '@views/categories/CategoryDetailView'

export const metadata: Metadata = {
  title: 'Category — Al Madina Admin'
}

type Props = { params: Promise<{ id: string }> }

const CategoryDetailPage = async ({ params }: Props) => {
  const { id } = await params

  return <CategoryDetailView id={id} />
}

export default CategoryDetailPage
