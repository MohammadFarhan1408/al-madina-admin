'use client'

import { useState } from 'react'

import Link from 'next/link'

import EntityCell from '@/components/shared/EntityCell'
import StatusChip from '@/components/shared/StatusChip'
import IconButton from '@/components/ui/IconButton'
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '@/components/ui/Table'
import { useToast } from '@/contexts/ToastContext'
import { getErrorMessage } from '@/libs/api/types'
import { formatCurrency } from '@/libs/format'
import { useAddCollectionProduct, useRemoveCollectionProduct } from '@/features/collections/hooks/useCollections'
import type { Product } from '@/features/products/types'

type CollectionMembersTableProps = { collectionId: string; title: string; members: Product[] }

/** The collection's products. Removal is immediate with Undo in the toast,
 *  rather than a confirm — it's one click to reverse. */
const CollectionMembersTable = ({ collectionId, title, members }: CollectionMembersTableProps) => {
  const { error: toastError, toast } = useToast()
  const [removingId, setRemovingId] = useState<string | null>(null)
  const addMutation = useAddCollectionProduct()
  const removeMutation = useRemoveCollectionProduct()

  const handleRemove = async (product: Product) => {
    setRemovingId(product.id)

    try {
      await removeMutation.mutateAsync({ id: collectionId, productId: product.id })
      toast(`${product.name} removed`, 'success', {
        label: 'Undo',
        onClick: () => addMutation.mutate({ id: collectionId, productId: product.id })
      })
    } catch (err) {
      toastError(getErrorMessage(err, 'Failed to remove product'))
    } finally {
      setRemovingId(null)
    }
  }

  return (
    <Table aria-label={`Products in ${title}`}>
      <TableHead>
        <TableRow>
          <TableHeaderCell className='pl-5'>Product</TableHeaderCell>
          <TableHeaderCell align='right'>Price</TableHeaderCell>
          <TableHeaderCell>Stock</TableHeaderCell>
          <TableHeaderCell align='right' className='pr-5'>
            <span className='sr-only'>Actions</span>
          </TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {members.map(product => (
          <TableRow key={product.id} hover>
            <TableCell className='pl-5'>
              <Link
                href={`/products/${product.id}`}
                className='block rounded-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60'
              >
                <EntityCell name={product.name} subtitle={`by ${product.brand}`} image={product.images?.[0]} />
              </Link>
            </TableCell>
            <TableCell align='right' className='whitespace-nowrap tabular-nums'>
              {formatCurrency(product.price, product.currency)}
            </TableCell>
            <TableCell>
              <StatusChip value={product.inStock ? 'in-stock' : 'out-of-stock'} dot />
            </TableCell>
            <TableCell align='right' className='pr-5'>
              <IconButton
                size='sm'
                color='error'
                loading={removingId === product.id}
                aria-label={`Remove ${product.name} from collection`}
                title='Remove from collection'
                onClick={() => handleRemove(product)}
              >
                <i className='tabler-x' />
              </IconButton>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default CollectionMembersTable
