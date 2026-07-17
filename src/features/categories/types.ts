// Category domain types (doc §5.3, §7.3).

export type Category = {
  id: string
  name: string
  tagline?: string
  image: string
  productCount: number
  sortOrder: number
  slug?: string
  metaTitle?: string
  metaDescription?: string
  metaKeywords?: string[]
  createdAt: string
  updatedAt: string
}
