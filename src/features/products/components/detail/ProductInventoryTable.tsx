// "Pricing & inventory" — one table for every purchasable size: the default
// size first (the product's own price/availability), then each variant with
// its SKU and unit count. Replaces the separate Pricing list + Variants table,
// which repeated the default price in two places.
import Card, { CardHeader } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import StatusChip from '@/components/shared/StatusChip'
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '@/components/ui/Table'
import { formatCurrency } from '@/libs/format'

import type { Product } from '../../types'
import { sizeRows } from './productDetail'
import CopyValueButton from '@/components/shared/CopyValueButton'

const ProductInventoryTable = ({ product }: { product: Product }) => {
  const rows = sizeRows(product)
  const variantCount = product.variants.length
  const showBarcode = product.variants.some(v => v.barcode)

  return (
    <Card className='overflow-hidden'>
      <CardHeader
        title='Pricing & inventory'
        icon='tabler-cash'
        description={
          variantCount
            ? `Default size and ${variantCount} variant${variantCount === 1 ? '' : 's'}`
            : 'Default size only — no variants added'
        }
        divided={false}
      />
      <Table aria-label='Sizes, prices and stock'>
        <TableHead>
          <TableRow>
            <TableHeaderCell className='pl-5'>Size</TableHeaderCell>
            <TableHeaderCell align='right'>Price</TableHeaderCell>
            <TableHeaderCell>SKU</TableHeaderCell>
            {showBarcode && <TableHeaderCell>Barcode</TableHeaderCell>}
            <TableHeaderCell align='right'>Units</TableHeaderCell>
            <TableHeaderCell className='pr-5'>Availability</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map(row => (
            <TableRow key={row.key} hover>
              <TableCell className='pl-5'>
                <span className='flex items-center gap-2 whitespace-nowrap'>
                  <span className='font-medium tabular-nums'>{row.volumeMl}ml</span>
                  {row.isDefault && (
                    <Badge size='sm' color='primary'>
                      Default
                    </Badge>
                  )}
                </span>
              </TableCell>
              <TableCell align='right' className='whitespace-nowrap tabular-nums'>
                <span className='font-medium'>{formatCurrency(row.price, product.currency)}</span>
                {row.originalPrice != null && row.originalPrice > row.price && (
                  <span className='ml-2 text-xs text-textMuted line-through'>
                    <span className='sr-only'>Original price </span>
                    {formatCurrency(row.originalPrice, product.currency)}
                  </span>
                )}
              </TableCell>
              <TableCell>
                {row.sku ? (
                  <span className='flex items-center gap-1 whitespace-nowrap'>
                    <span className='font-mono text-xs text-textSecondary'>{row.sku}</span>
                    <CopyValueButton value={row.sku} label='SKU' />
                  </span>
                ) : (
                  <span className='text-textMuted'>—</span>
                )}
              </TableCell>
              {showBarcode && (
                <TableCell>
                  <span className='font-mono text-xs text-textSecondary'>{row.barcode ?? '—'}</span>
                </TableCell>
              )}
              <TableCell align='right' className='tabular-nums'>
                {row.stock !== undefined ? (
                  row.stock
                ) : (
                  <span className='text-textMuted' title='Unit counts are tracked on variants only'>
                    —<span className='sr-only'>Not tracked for the default size</span>
                  </span>
                )}
              </TableCell>
              <TableCell className='pr-5'>
                <StatusChip value={row.inStock ? 'in-stock' : 'out-of-stock'} dot />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}

export default ProductInventoryTable
