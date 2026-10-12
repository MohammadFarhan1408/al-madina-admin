// Pure derivations for the Product Detail page. Everything here reads fields
// the product already carries — nothing is estimated or thresholded.
import type { Product } from '../../types'

export type SizeRow = {
  key: string
  volumeMl: number
  price: number
  originalPrice?: number
  sku?: string
  barcode?: string

  /** Unit count — only variants carry one; the default size has no quantity. */
  stock?: number
  inStock: boolean
  isDefault: boolean
}

/** The default size (the product's own volume/price/inStock) followed by its
 *  variants, smallest first — the full set of sizes a customer can buy. */
export function sizeRows(product: Product): SizeRow[] {
  const variants = [...product.variants]
    .sort((a, b) => a.volumeMl - b.volumeMl)
    .map((v, i) => ({
      key: v.sku || `variant-${i}`,
      volumeMl: v.volumeMl,
      price: v.price,
      sku: v.sku || undefined,
      barcode: v.barcode || undefined,
      stock: v.stock,
      inStock: v.inStock,
      isDefault: false
    }))

  return [
    {
      key: 'default',
      volumeMl: product.volumeMl,
      price: product.price,
      originalPrice: product.originalPrice,
      inStock: product.inStock,
      isDefault: true
    },
    ...variants
  ]
}

/** Lowest and highest price across the default size and every variant. */
export function priceRange(product: Product) {
  const prices = [product.price, ...product.variants.map(v => v.price)]

  return { min: Math.min(...prices), max: Math.max(...prices) }
}

/** Units across variants, or null when there are no variants to count —
 *  the default size has no quantity field, so a sum would be misleading. */
export function variantUnits(product: Product): number | null {
  return product.variants.length ? product.variants.reduce((sum, v) => sum + (v.stock ?? 0), 0) : null
}
