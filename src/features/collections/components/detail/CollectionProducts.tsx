'use client'

import Card, { CardBody, CardHeader } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Skeleton from '@/components/ui/Skeleton'
import { useCollectionProducts } from '@/features/collections/hooks/useCollections'
import CollectionAddProduct from './CollectionAddProduct'
import CollectionMembersTable from './CollectionMembersTable'

/** Product membership: add-by-search above the member table, with loading,
 *  error and empty states in place of the table. */
const CollectionProducts = ({ collectionId, title }: { collectionId: string; title: string }) => {
  const { data: members, isLoading, isError, refetch } = useCollectionProducts(collectionId)
  const count = members?.length ?? 0

  return (
    <Card className='overflow-hidden'>
      <CardHeader
        title='Products'
        description={isLoading ? 'Loading…' : `${count} product${count === 1 ? '' : 's'} in this collection`}
      />

      <CollectionAddProduct
        collectionId={collectionId}
        title={title}
        memberIds={new Set((members ?? []).map(p => p.id))}
      />

      {isError ? (
        <CardBody className='flex flex-col items-center gap-2 py-8 text-center'>
          <p className='text-sm text-errorDark'>Couldn&apos;t load this collection&apos;s products.</p>
          <Button size='sm' variant='outlined' onClick={() => refetch()}>
            Retry
          </Button>
        </CardBody>
      ) : isLoading ? (
        <CardBody className='flex flex-col gap-3' aria-hidden>
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className='h-10 w-full' />
          ))}
        </CardBody>
      ) : count === 0 ? (
        <CardBody className='flex flex-col items-center gap-2 py-10 text-center'>
          <i aria-hidden className='tabler-stack-2 text-3xl text-textMuted' />
          <p className='text-sm font-medium text-textPrimary'>No products yet</p>
          <p className='max-w-72 text-xs text-textMuted'>Search above to add the first fragrance to this collection.</p>
        </CardBody>
      ) : (
        <CollectionMembersTable collectionId={collectionId} title={title} members={members ?? []} />
      )}
    </Card>
  )
}

export default CollectionProducts
