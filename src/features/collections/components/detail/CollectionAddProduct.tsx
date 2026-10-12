'use client'

import { useState } from 'react'

import Button from '@/components/ui/Button'
import SearchSelect from '@/components/ui/form/SearchSelect'
import { useToast } from '@/contexts/ToastContext'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { getErrorMessage } from '@/libs/api/types'
import { useAddCollectionProduct } from '@/features/collections/hooks/useCollections'
import { useProducts } from '@/features/products/hooks/useProducts'
import type { Product } from '@/features/products/types'

type CollectionAddProductProps = {
  collectionId: string
  title: string

  /** Products already in the collection — hidden from the search results. */
  memberIds: Set<string>
}

/** Add-by-search: type to find a product, pick it, press Add. */
const CollectionAddProduct = ({ collectionId, title, memberIds }: CollectionAddProductProps) => {
  const { success, error: toastError } = useToast()
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Product | null>(null)
  const debouncedSearch = useDebouncedValue(search)

  const { data: searchResults, isFetching: searching } = useProducts({ q: debouncedSearch || undefined, limit: 10 })
  const addMutation = useAddCollectionProduct()
  const options = (searchResults?.items ?? []).filter(p => !memberIds.has(p.id))

  const handleAdd = async () => {
    if (!selected) return

    try {
      await addMutation.mutateAsync({ id: collectionId, productId: selected.id })
      success(`${selected.name} added to ${title}`)
      setSelected(null)
      setSearch('')
    } catch (err) {
      toastError(getErrorMessage(err, 'Failed to add product'))
    }
  }

  return (
    <form
      className='flex flex-col gap-2 border-b border-border bg-surfaceSunken/25 px-5 py-4 sm:flex-row sm:items-end'
      onSubmit={e => {
        e.preventDefault()
        void handleAdd()
      }}
    >
      <SearchSelect
        containerClassName='flex-1 min-w-0'
        label='Add a product'
        options={options}
        value={selected}
        loading={searching}
        emptyText={debouncedSearch ? 'No matching products (or already in this collection)' : 'Type to search products'}
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
      <Button
        type='submit'
        disabled={!selected}
        loading={addMutation.isPending}
        startIcon={<i className='tabler-plus' />}
        className='shrink-0'
      >
        Add
      </Button>
    </form>
  )
}

export default CollectionAddProduct
