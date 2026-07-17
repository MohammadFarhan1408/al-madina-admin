// Category form schema mirroring backend model/validation (doc §5.3).
import { z } from 'zod'

export const categorySchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  tagline: z.string().trim().optional().or(z.literal('')),
  image: z.string().min(1, 'An image is required'),
  sortOrder: z.number().int('Must be a whole number').min(0, 'Must be 0 or greater'),
  slug: z.string().trim().optional().or(z.literal('')),
  metaTitle: z.string().trim().optional().or(z.literal('')),
  metaDescription: z.string().trim().optional().or(z.literal('')),
  metaKeywords: z.array(z.string())
})

export type CategoryFormValues = z.infer<typeof categorySchema>

export const defaultCategoryValues: CategoryFormValues = {
  name: '',
  tagline: '',
  image: '',
  sortOrder: 0,
  slug: '',
  metaTitle: '',
  metaDescription: '',
  metaKeywords: []
}
