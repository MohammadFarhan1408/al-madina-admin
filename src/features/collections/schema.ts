// Collection form schema mirroring backend model (doc §5.4).
import { z } from 'zod'

import { COLLECTION_ACCENTS } from './types'

export const collectionSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  subtitle: z.string().trim().min(1, 'Subtitle is required'),
  image: z.string().min(1, 'An image is required'),
  accent: z.enum(COLLECTION_ACCENTS, { message: 'Accent is required' }),
  sortOrder: z.number().int('Must be a whole number').min(0, 'Must be 0 or greater')
})

export type CollectionFormValues = z.infer<typeof collectionSchema>

export const defaultCollectionValues: CollectionFormValues = {
  title: '',
  subtitle: '',
  image: '',
  accent: 'gold',
  sortOrder: 0
}
