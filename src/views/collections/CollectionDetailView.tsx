'use client'

// Read-only collection detail — image, accent, sort order, SEO, and the
// product-membership editor (folded in from the former ManageProductsDialog).
import { useState } from 'react'

import { useRouter } from 'next/navigation'

import PageHeader from '@/components/shared/PageHeader'
import Breadcrumbs from '@/components/shared/Breadcrumbs'
import DetailSection from '@/components/shared/DetailSection'
import DetailRow from '@/components/shared/DetailRow'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import ZoomableImage from '@/components/shared/ZoomableImage'
import QueryState from '@/components/shared/QueryState'
import Button from '@/components/ui/Button'
import IconButton from '@/components/ui/IconButton'
import SearchSelect from '@/components/ui/form/SearchSelect'
import Spinner from '@/components/ui/Spinner'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useToast } from '@/contexts/ToastContext'
import { getErrorMessage } from '@/libs/api/types'
import { formatCurrency, humanize } from '@/libs/format'
import { useProducts } from '@/features/products/hooks/useProducts'
import type { Product } from '@/features/products/types'
import {
  useAddCollectionProduct,
  useCollection,
  useCollectionProducts,
  useDeleteCollection,
  useRemoveCollectionProduct
} from '@/features/collections/hooks/useCollections'

type Props = { id: string }

const CollectionDetailView = ({ id }: Props) => {
  const router = useRouter()
  const { data: collection, isLoading, isError, error, refetch } = useCollection(id)
  const deleteMutation = useDeleteCollection()
  const { success, error: toastError } = useToast()
  const [confirmDelete, setConfirmDelete] = useState(false)

  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Product | null>(null)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const debouncedSearch = useDebouncedValue(search)

  const { data: members, isLoading: membersLoading } = useCollectionProducts(id)
  const { data: searchResults, isFetching: searching } = useProducts({ q: debouncedSearch || undefined, limit: 10 })
  const addMutation = useAddCollectionProduct()
  const removeMutation = useRemoveCollectionProduct()

  const memberIds = new Set((members ?? []).map(p => p.id))
  const options = (searchResults?.items ?? []).filter(p => !memberIds.has(p.id))

  const handleAdd = async () => {
    if (!selected) return

    try {
      await addMutation.mutateAsync({ id, productId: selected.id })
      success('Product added to collection')
      setSelected(null)
      setSearch('')
    } catch (err) {
      toastError(getErrorMessage(err, 'Failed to add product'))
    }
  }

  const handleRemove = async (productId: string) => {
    setRemovingId(productId)

    try {
      await removeMutation.mutateAsync({ id, productId })
      success('Product removed')
    } catch (err) {
      toastError(getErrorMessage(err, 'Failed to remove product'))
    } finally {
      setRemovingId(null)
    }
  }

  const handleDelete = async () => {
    if (!collection) return

    try {
      await deleteMutation.mutateAsync(collection.id)
      success('Collection deleted')
      router.push('/collections')
    } catch (err) {
      toastError(getErrorMessage(err, 'Failed to delete collection'))
      setConfirmDelete(false)
    }
  }

  if (isLoading || !collection) {
    return (
      <>
        <Breadcrumbs />
        <PageHeader title='Collection' />
        <QueryState isError={isError} error={error} onRetry={() => refetch()} fallbackMessage='Failed to load collection.' />
      </>
    )
  }

  return (
    <>
      <Breadcrumbs extra={[{ label: collection.title }]} />
      <PageHeader
        title={collection.title}
        subtitle={collection.subtitle}
        action={
          <div className='flex items-center gap-3'>
            <Button variant='outlined' color='secondary' onClick={() => router.push('/collections')}>
              Back
            </Button>
            <Button
              variant='outlined'
              startIcon={<i className='tabler-edit' />}
              onClick={() => router.push(`/collections/${id}/edit`)}
            >
              Edit
            </Button>
            <Button
              variant='outlined'
              color='error'
              startIcon={<i className='tabler-trash' />}
              onClick={() => setConfirmDelete(true)}
            >
              Delete
            </Button>
          </div>
        }
      />

      <div className='flex flex-col gap-4'>
        <DetailSection title='Overview'>
          <DetailRow
            label='Image'
            stacked
            value={
              <ZoomableImage src={collection.image} alt={collection.title}>
                <img src={collection.image} alt='' className='size-24 rounded-md object-cover' />
              </ZoomableImage>
            }
          />
          <DetailRow label='Accent' value={humanize(collection.accent)} />
          <DetailRow label='Sort order' value={collection.sortOrder} />
        </DetailSection>

        <DetailSection title='Products in this collection'>
          <div className='flex items-end gap-3'>
            <SearchSelect
              containerClassName='flex-1'
              label='Search products to add'
              options={options}
              value={selected}
              loading={searching}
              emptyText={
                debouncedSearch ? 'No matching products (or already in this collection)' : 'Type to search products'
              }
              onChange={setSelected}
              onInputChange={setSearch}
              getOptionKey={option => option.id}
              getOptionLabel={option => `${option.name} — ${option.brand}`}
              renderOption={option => (
                <span className='flex items-center gap-3'>
                  <img src={option.images?.[0]} alt='' className='size-8 rounded object-cover' />
                  <span className='flex flex-col'>
                    <span>{option.name}</span>
                    <span className='text-xs text-textSecondary'>{option.brand}</span>
                  </span>
                </span>
              )}
            />
            <Button onClick={handleAdd} disabled={!selected} loading={addMutation.isPending} className='shrink-0'>
              Add
            </Button>
          </div>

          {membersLoading ? (
            <div className='flex justify-center p-6'>
              <Spinner />
            </div>
          ) : members?.length ? (
            <ul className='divide-y divide-border'>
              {members.map(product => (
                <li key={product.id} className='flex items-center gap-3 py-2'>
                  <img src={product.images?.[0]} alt='' className='size-10 shrink-0 rounded-md object-cover' />
                  <div className='flex flex-1 flex-col'>
                    <span className='text-sm'>{product.name}</span>
                    <span className='text-xs text-textSecondary'>
                      {formatCurrency(product.price, product.currency)}
                    </span>
                  </div>
                  <IconButton
                    size='sm'
                    color='error'
                    loading={removingId === product.id}
                    aria-label={`Remove ${product.name} from collection`}
                    onClick={() => handleRemove(product.id)}
                  >
                    {removingId === product.id ? <Spinner size='sm' /> : <i className='tabler-trash' />}
                  </IconButton>
                </li>
              ))}
            </ul>
          ) : (
            <p className='p-4 text-center text-textSecondary'>No products in this collection yet.</p>
          )}
        </DetailSection>

        {(collection.slug || collection.metaTitle || collection.metaDescription || collection.metaKeywords?.length) && (
          <DetailSection title='SEO'>
            <DetailRow label='Slug' value={collection.slug || '—'} />
            <DetailRow label='Meta title' value={collection.metaTitle || '—'} />
            <DetailRow label='Meta description' value={collection.metaDescription || '—'} stacked />
            <DetailRow
              label='Meta keywords'
              value={collection.metaKeywords?.length ? collection.metaKeywords.join(', ') : '—'}
              stacked
            />
          </DetailSection>
        )}
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title='Delete collection'
        description={`Delete "${collection.title}"? This cannot be undone.`}
        confirmText='Delete'
        loading={deleteMutation.isPending}
        onConfirm={handleDelete}
        onClose={() => setConfirmDelete(false)}
      />
    </>
  )
}

export default CollectionDetailView
