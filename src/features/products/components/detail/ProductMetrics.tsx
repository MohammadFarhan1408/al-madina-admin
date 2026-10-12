// Compact metric row under the Product Detail hero. Every value is read or
// summed straight from the product record — no estimates.
import StatCard from '@/components/shared/StatCard'
import { formatCurrency } from '@/libs/format'

import type { Product } from '../../types'
import { priceRange, variantUnits } from './productDetail'

const ProductMetrics = ({ product }: { product: Product }) => {
  const range = priceRange(product)
  const units = variantUnits(product)
  const variantCount = product.variants.length
  const imageCount = product.images?.length ?? 0

  const priceValue =
    range.min === range.max
      ? formatCurrency(range.min, product.currency)
      : `${formatCurrency(range.min, product.currency)} – ${formatCurrency(range.max, product.currency)}`

  return (
    <section aria-label='Product metrics' className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4'>
      <StatCard
        title='Price range'
        value={priceValue}
        icon='tabler-currency-dirham'
        subtitle={`Across ${variantCount + 1} size${variantCount ? 's' : ''}`}
      />
      <StatCard
        title='Variants'
        value={variantCount}
        icon='tabler-flask'
        color='secondary'
        subtitle={variantCount ? `Plus the ${product.volumeMl}ml default` : 'Default size only'}
      />
      <StatCard
        title='Units across variants'
        value={units ?? '—'}
        icon='tabler-packages'
        color={units === 0 ? 'error' : 'success'}
        subtitle={units === null ? 'No variants to count' : `Default size tracks availability only`}
      />
      <StatCard
        title='Gallery images'
        value={imageCount}
        icon='tabler-photo'
        color='info'
        subtitle={imageCount ? 'First image is the cover' : 'Add images from Edit'}
      />
    </section>
  )
}

export default ProductMetrics
