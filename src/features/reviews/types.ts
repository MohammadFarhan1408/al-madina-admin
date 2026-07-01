// Review domain types (doc §5.5, §7.12).

export type Review = {
  id: string
  productId: string
  userId?: string | null
  author: string
  avatar?: string
  rating: number
  title: string
  body: string
  date: string
  verified: boolean
  createdAt: string
  updatedAt: string
}

export type AdminReviewListParams = {
  page?: number
  limit?: number
  rating?: number
}
