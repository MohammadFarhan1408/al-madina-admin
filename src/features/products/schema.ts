// Product form schema mirroring backend model/validation (doc §5.2).
import { z } from 'zod'

import { PRODUCT_BADGES, PRODUCT_VARIANT_SIZES_ML, SCENT_FAMILIES } from './types'

const productVariantSchema = z.object({
  volumeMl: z.number().refine(v => (PRODUCT_VARIANT_SIZES_ML as readonly number[]).includes(v), {
    message: 'Choose a standard size'
  }),
  price: z.number().min(0, 'Must be 0 or greater'),
  sku: z.string().trim().min(2, 'SKU is required'),
  barcode: z.string().trim().optional().or(z.literal('')),
  stock: z.number().int().min(0, 'Must be 0 or greater'),
  inStock: z.boolean()
})

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
  isSeasonal: z.boolean(),
  variants: z.array(productVariantSchema),
  tagIds: z.array(z.string()),
  slug: z.string().trim().optional().or(z.literal('')),
  metaTitle: z.string().trim().optional().or(z.literal('')),
  metaDescription: z.string().trim().optional().or(z.literal('')),
  metaKeywords: z.array(z.string())
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
  isSeasonal: false,
  variants: [],
  tagIds: [],
  slug: '',
  metaTitle: '',
  metaDescription: '',
  metaKeywords: []
}
