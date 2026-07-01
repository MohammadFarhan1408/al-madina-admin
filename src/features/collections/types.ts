// Collection domain types (doc §5.4, §7.4).

export const COLLECTION_ACCENTS = ['gold', 'emerald', 'burgundy'] as const
export type CollectionAccent = (typeof COLLECTION_ACCENTS)[number]

export type Collection = {
  id: string
  title: string
  subtitle: string
  image: string
  accent: CollectionAccent
  productIds: string[]
  productCount: number
  sortOrder: number
  createdAt: string
  updatedAt: string
}
