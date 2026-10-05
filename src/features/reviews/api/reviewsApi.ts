// Reviews service (doc §7.12 — admin moderation).
import { apiDelete, apiGet } from '@/libs/api/axios'
import { endpoints } from '@/libs/api/endpoints'
import type { Paginated } from '@/libs/api/types'

import type { AdminReviewListParams, Review, ReviewSummary } from '../types'

export const reviewsApi = {
  list: (params: AdminReviewListParams) => apiGet<Paginated<Review>>(endpoints.admin.reviews, { params }),

  summary: () => apiGet<ReviewSummary>(endpoints.admin.reviewsSummary),

  remove: (id: string) => apiDelete<{ success: boolean }>(endpoints.admin.review(id))
}
