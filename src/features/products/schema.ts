// Product form schema mirroring the API's createProductSchema (admin.schema.ts).
import { z } from 'zod'

import { PRODUCT_BADGES, PRODUCT_VARIANT_SIZES_ML, SCENT_FAMILIES } from './types'

const productVariantSchema = z.object({
  volumeMl: z.number().refine(v => (PRODUCT_VARIANT_SIZES_ML as readonly number[]).includes(v), {
    message: 'Choose a standard size'
  }),
  price: z.number({ error: 'Enter a price' }).min(0, 'Must be 0 or greater'),
  sku: z.string().trim().min(2, 'SKU is required'),
  barcode: z.string().trim().optional().or(z.literal('')),
  stock: z.number({ error: 'Enter a stock count' }).int('Must be a whole number').min(0, 'Must be 0 or greater'),
  inStock: z.boolean()
})

export const productSchema = z
  .object({
    name: z.string().trim().min(2, 'At least 2 characters'),
    nameAr: z.string().trim().optional().or(z.literal('')),
    brand: z.string().trim().min(1, 'Brand is required'),
    categoryId: z.string().min(1, 'Category is required'),
    description: z.string().trim().min(5, 'At least 5 characters'),
    scentFamily: z.enum(SCENT_FAMILIES, { message: 'Scent family is required' }),
    volumeMl: z.number({ error: 'Choose a size' }).int('Must be a whole number').min(0, 'Must be 0 or greater'),
    price: z.number({ error: 'Enter a price' }).min(0, 'Must be 0 or greater'),
    originalPrice: z.number().min(0).optional(),
    notes: z.array(z.string()),
    images: z.array(z.string().url('Must be a valid image URL')),
    badge: z.enum(PRODUCT_BADGES).optional(),
    inStock: z.boolean(),
    isFeatured: z.boolean(),
    isNewArrival: z.boolean(),
    isBestSeller: z.boolean(),
    isSignature: z.boolean(),
    isSeasonal: z.boolean(),
    variants: z.array(productVariantSchema),
    tagIds: z.array(z.string()),
    slug: z.string().trim().min(2, 'At least 2 characters').optional().or(z.literal('')),
    metaTitle: z.string().trim().optional().or(z.literal('')),
    metaDescription: z.string().trim().optional().or(z.literal('')),
    metaKeywords: z.array(z.string())
  })
  .superRefine((v, ctx) => {
    // The API rejects a product whose variants repeat a size or an SKU.
    const flagDuplicates = (key: 'volumeMl' | 'sku', message: string) => {
      const counts = new Map<string, number>()
      const norm = (x: string | number) => String(x).trim().toUpperCase()

      v.variants.forEach(x => counts.set(norm(x[key]), (counts.get(norm(x[key])) ?? 0) + 1))
      v.variants.forEach((x, i) => {
        if ((counts.get(norm(x[key])) ?? 0) > 1) ctx.addIssue({ code: 'custom', path: ['variants', i, key], message })
      })
    }

    flagDuplicates('volumeMl', 'This size is listed more than once')
    flagDuplicates('sku', 'SKUs must be unique')
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
