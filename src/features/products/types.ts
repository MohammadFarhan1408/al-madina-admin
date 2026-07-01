// Product domain types (doc §5.2, §7.2).

export const SCENT_FAMILIES = ['oud', 'floral', 'amber', 'musk', 'woody', 'citrus', 'spicy'] as const
export type ScentFamily = (typeof SCENT_FAMILIES)[number]

export const PRODUCT_BADGES = ['new', 'bestseller', 'limited', 'exclusive'] as const
export type ProductBadge = (typeof PRODUCT_BADGES)[number]

export const PRODUCT_SORTS = ['featured', 'price_asc', 'price_desc', 'rating', 'newest'] as const
export type ProductSort = (typeof PRODUCT_SORTS)[number]

export type Product = {
  id: string
  name: string
  nameAr?: string
  brand: string
  categoryId: string
  description: string
  notes: string[]
  scentFamily: ScentFamily
  volumeMl: number
  price: number
  originalPrice?: number
  currency: string
  images: string[]
  rating: number
  reviewCount: number
  inStock: boolean
  badge?: ProductBadge
  isFeatured: boolean
  isNewArrival: boolean
  isBestSeller: boolean
  isSignature: boolean
  isSeasonal: boolean
  createdAt: string
  updatedAt: string
}

/** Query params accepted by `GET /products` (doc §7.2). */
export type ProductListParams = {
  page?: number
  limit?: number
  categoryId?: string
  family?: ScentFamily
  q?: string
  sort?: ProductSort
  badge?: ProductBadge
  inStock?: boolean
  minPrice?: number
  maxPrice?: number
  isFeatured?: boolean
  isNewArrival?: boolean
  isBestSeller?: boolean
  isSignature?: boolean
  isSeasonal?: boolean
}
