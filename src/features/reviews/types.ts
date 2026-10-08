// Review domain types (doc §5.5, §7.12).

export type Review = {
  id: string
  productId: string

  /** Added by the admin list so a moderator can tell what is being reviewed. */
  productName?: string
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

export type ReviewSummary = {
  average: number
  total: number
  distribution: Record<1 | 2 | 3 | 4 | 5, number>
}

export type AdminReviewListParams = {
  page?: number
  limit?: number
  rating?: number
  sortBy?: 'rating' | 'date'
  sortOrder?: 'asc' | 'desc'
}
