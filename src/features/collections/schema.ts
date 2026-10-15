// Collection form schema mirroring backend model (doc §5.4).
import { z } from 'zod'

import { COLLECTION_ACCENTS } from './types'

export const collectionSchema = z.object({
  title: z.string().trim().min(2, 'At least 2 characters'),
  subtitle: z.string().trim().min(2, 'At least 2 characters'),
  image: z.string().min(1, 'An image is required').url('Must be a valid image URL'),
  accent: z.enum(COLLECTION_ACCENTS, { message: 'Accent is required' }),
  sortOrder: z.number({ error: 'Enter a number' }).int('Must be a whole number').min(0, 'Must be 0 or greater'),
  slug: z.string().trim().min(2, 'At least 2 characters').optional().or(z.literal('')),
  metaTitle: z.string().trim().optional().or(z.literal('')),
  metaDescription: z.string().trim().optional().or(z.literal('')),
  metaKeywords: z.array(z.string())
})

export type CollectionFormValues = z.infer<typeof collectionSchema>

export const defaultCollectionValues: CollectionFormValues = {
  title: '',
  subtitle: '',
  image: '',
  accent: 'gold',
  sortOrder: 0,
  slug: '',
  metaTitle: '',
  metaDescription: '',
  metaKeywords: []
}
