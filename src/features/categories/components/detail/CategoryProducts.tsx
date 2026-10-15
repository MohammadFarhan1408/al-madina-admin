'use client'

import NextLink from 'next/link'
import { useRouter } from 'next/navigation'

import EntityCell from '@/components/shared/EntityCell'
import StatusChip from '@/components/shared/StatusChip'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import Card, { CardBody, CardHeader } from '@/components/ui/Card'
import Skeleton from '@/components/ui/Skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '@/components/ui/Table'
import { formatCurrency } from '@/libs/format'
import { useProducts } from '@/features/products/hooks/useProducts'
import type { Category } from '@/features/categories/types'

// Enough to recognise the category's range; the full list is one click away.
const PRODUCT_PREVIEW_LIMIT = 8

/** The category's newest products, with a link to the full filtered list. */
const CategoryProducts = ({ category }: { category: Category }) => {
  const router = useRouter()

  const { data, isLoading, isError, refetch } = useProducts({
    categoryId: category.id,
    page: 1,
    limit: PRODUCT_PREVIEW_LIMIT,
    sort: 'newest'
  })

  const items = data?.items ?? []
  const total = data?.total ?? 0

  return (
    <Card className='overflow-hidden'>
      <CardHeader
        title='Products'
        icon='tabler-package'
        description={
          isLoading
            ? 'Loading…'
            : total
              ? `${total} product${total === 1 ? '' : 's'}${total > items.length ? ` · showing the ${items.length} newest` : ''}`
              : undefined
        }
        divided={false}
        action={
          total > 0 ? (
            <Button
              size='sm'
              variant='text'
              endIcon={<i className='tabler-arrow-right' />}
              onClick={() => router.push(`/products?categoryId=${category.id}`)}
            >
              View all
            </Button>
          ) : undefined
        }
      />

      {isError ? (
        <CardBody>
          <Alert severity='error'>
            Couldn&apos;t load this category&apos;s products.{' '}
            <button type='button' className='font-medium underline' onClick={() => refetch()}>
              Retry
            </button>
          </Alert>
        </CardBody>
      ) : isLoading ? (
        <CardBody className='flex flex-col gap-3' aria-hidden>
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className='h-10 w-full' />
          ))}
        </CardBody>
      ) : items.length === 0 ? (
        <CardBody className='flex flex-col items-center gap-2 border-t border-border py-10 text-center'>
          <i aria-hidden className='tabler-package-off text-3xl text-textMuted' />
          <p className='text-sm font-medium text-textPrimary'>No products in this category</p>
          <p className='max-w-72 text-xs text-textMuted'>Assign a category when creating or editing a product.</p>
        </CardBody>
      ) : (
        <Table aria-label={`Products in ${category.name}`}>
          <TableHead>
            <TableRow>
              <TableHeaderCell className='pl-5'>Product</TableHeaderCell>
              <TableHeaderCell align='right'>Price</TableHeaderCell>
              <TableHeaderCell className='pr-5'>Stock</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map(product => (
              <TableRow key={product.id} hover>
                <TableCell className='pl-5'>
                  <NextLink
                    href={`/products/${product.id}`}
                    className='block rounded-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60'
                  >
                    <EntityCell name={product.name} subtitle={`by ${product.brand}`} image={product.images?.[0]} />
                  </NextLink>
                </TableCell>
                <TableCell align='right' className='whitespace-nowrap tabular-nums'>
                  {formatCurrency(product.price, product.currency)}
                </TableCell>
                <TableCell className='pr-5'>
                  <StatusChip value={product.inStock ? 'in-stock' : 'out-of-stock'} dot />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Card>
  )
}

export default CategoryProducts
