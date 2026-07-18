'use client'

// Read-only collection detail — image, accent, sort order, SEO, and the
// product-membership editor (folded in from the former ManageProductsDialog).
import { useState } from 'react'

import { useRouter } from 'next/navigation'

import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Avatar from '@mui/material/Avatar'
import Autocomplete from '@mui/material/Autocomplete'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import ListItemText from '@mui/material/ListItemText'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'

import CustomTextField from '@core/components/mui/TextField'
import PageHeader from '@/components/shared/PageHeader'
import Breadcrumbs from '@/components/shared/Breadcrumbs'
import DetailSection from '@/components/shared/DetailSection'
import DetailRow from '@/components/shared/DetailRow'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import ZoomableImage from '@/components/shared/ZoomableImage'
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
  const { data: collection, isLoading, isError, error } = useCollection(id)
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
        {isError ? (
          <Alert severity='error'>{(error as Error)?.message || 'Failed to load collection.'}</Alert>
        ) : (
          <div className='flex justify-center p-8'>
            <CircularProgress />
          </div>
        )}
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
            <Button variant='tonal' color='secondary' onClick={() => router.push('/collections')}>
              Back
            </Button>
            <Button variant='tonal' startIcon={<i className='tabler-edit' />} onClick={() => router.push(`/collections/${id}/edit`)}>
              Edit
            </Button>
            <Button variant='tonal' color='error' startIcon={<i className='tabler-trash' />} onClick={() => setConfirmDelete(true)}>
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
                <Avatar variant='rounded' src={collection.image} sx={{ width: 96, height: 96 }} />
              </ZoomableImage>
            }
          />
          <DetailRow label='Accent' value={humanize(collection.accent)} />
          <DetailRow label='Sort order' value={collection.sortOrder} />
        </DetailSection>

        <DetailSection title='Products in this collection'>
          <div className='flex items-center gap-3'>
            <Autocomplete
              fullWidth
              options={options}
              value={selected}
              loading={searching}
              loadingText='Searching…'
              noOptionsText={debouncedSearch ? 'No matching products (or already in this collection)' : 'Type to search products'}
              onChange={(_, value) => setSelected(value)}
              getOptionLabel={option => `${option.name} — ${option.brand}`}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              onInputChange={(_, value) => setSearch(value)}
              renderOption={(props, option) => (
                <li {...props} key={option.id}>
                  <div className='flex items-center gap-3'>
                    <Avatar variant='rounded' src={option.images?.[0]} sx={{ width: 32, height: 32 }} />
                    <div className='flex flex-col'>
                      <Typography variant='body2'>{option.name}</Typography>
                      <Typography variant='caption' color='text.secondary'>
                        {option.brand}
                      </Typography>
                    </div>
                  </div>
                </li>
              )}
              renderInput={params => <CustomTextField {...params} label='Search products to add' />}
            />
            <Button variant='contained' onClick={handleAdd} disabled={!selected || addMutation.isPending} className='shrink-0'>
              {addMutation.isPending ? <CircularProgress size={20} color='inherit' /> : 'Add'}
            </Button>
          </div>

          {membersLoading ? (
            <div className='flex justify-center p-6'>
              <CircularProgress size={24} />
            </div>
          ) : members?.length ? (
            <List>
              {members.map(product => (
                <ListItem
                  key={product.id}
                  secondaryAction={
                    <IconButton
                      edge='end'
                      color='error'
                      aria-label={`Remove ${product.name} from collection`}
                      disabled={removingId === product.id}
                      onClick={() => handleRemove(product.id)}
                    >
                      {removingId === product.id ? <CircularProgress size={18} /> : <i className='tabler-trash' />}
                    </IconButton>
                  }
                >
                  <ListItemAvatar>
                    <Avatar variant='rounded' src={product.images?.[0]} />
                  </ListItemAvatar>
                  <ListItemText primary={product.name} secondary={formatCurrency(product.price, product.currency)} />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography color='text.secondary' className='p-4 text-center'>
              No products in this collection yet.
            </Typography>
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
