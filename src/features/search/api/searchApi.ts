import { apiGet } from '@/libs/api/axios'
import { endpoints } from '@/libs/api/endpoints'

import type { SearchResults } from '../types'

export const searchApi = {
  search: (q: string) => apiGet<SearchResults>(endpoints.admin.search, { params: { q } })
}
