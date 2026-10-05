'use client'

import Link from 'next/link'

import ChartCard from '@/components/shared/ChartCard'
import EntityCell from '@/components/shared/EntityCell'
import Button from '@/components/ui/Button'
import { useProducts } from '@/features/products/hooks/useProducts'

/** Products currently marked out of stock (the real `inStock` flag — there is
 *  no stock quantity at product level to threshold on). */
const InventoryAlertCard = () => {
  const { data, isLoading } = useProducts({ inStock: false, limit: 5 })
  const items = data?.items ?? []
  const total = data?.total ?? 0

  return (
    <ChartCard
      title='Out of stock'
      description={total ? `${total} product${total === 1 ? '' : 's'} can't be ordered` : undefined}
      isLoading={isLoading}
      height={240}
      className='h-full'
      empty={
        !total && { title: 'Everything is in stock', description: 'Products marked out of stock will be listed here.' }
      }
      action={
        total > items.length ? (
          <Link href='/products?stock=false'>
            <Button size='sm' variant='text' endIcon={<i className='tabler-arrow-right' />}>
              View all
            </Button>
          </Link>
        ) : undefined
      }
    >
      <ul className='flex flex-col gap-3'>
        {items.map(product => (
          <li key={product.id}>
            <Link href={`/products/${product.id}/edit`} className='block rounded-md hover:bg-actionHover'>
              <EntityCell name={product.name} subtitle={`by ${product.brand}`} image={product.images?.[0]} />
            </Link>
          </li>
        ))}
      </ul>
    </ChartCard>
  )
}

export default InventoryAlertCard
