// Product form schema mirroring backend model/validation (doc §5.2).
import { z } from 'zod'

import { PRODUCT_BADGES, SCENT_FAMILIES } from './types'

export const productSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  nameAr: z.string().trim().optional().or(z.literal('')),
  brand: z.string().trim().min(1, 'Brand is required'),
  categoryId: z.string().min(1, 'Category is required'),
  description: z.string().trim().min(1, 'Description is required'),
  scentFamily: z.enum(SCENT_FAMILIES, { message: 'Scent family is required' }),
  volumeMl: z.number().min(0, 'Must be 0 or greater'),
  price: z.number().min(0, 'Must be 0 or greater'),
  originalPrice: z.number().min(0).optional(),
  currency: z.string().trim().max(3, 'Max 3 characters'),
  notes: z.array(z.string()),
  images: z.array(z.string()),
  badge: z.enum(PRODUCT_BADGES).optional(),
  inStock: z.boolean(),
  isFeatured: z.boolean(),
  isNewArrival: z.boolean(),
  isBestSeller: z.boolean(),
  isSignature: z.boolean(),
  isSeasonal: z.boolean()
})

export type ProductFormValues = z.infer<typeof productSchema>

export const defaultProductValues: ProductFormValues = {
  name: '',
  nameAr: '',
  brand: 'Al Madina',
  categoryId: '',
  description: '',
  scentFamily: 'oud',
  volumeMl: 50,
  price: 0,
  originalPrice: undefined,
  currency: 'AED',
  notes: [],
  images: [],
  badge: undefined,
  inStock: true,
  isFeatured: false,
  isNewArrival: false,
  isBestSeller: false,
  isSignature: false,
  isSeasonal: false
}
