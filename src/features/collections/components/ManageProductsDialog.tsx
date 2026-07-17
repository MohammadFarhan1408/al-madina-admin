'use client'

// Manage a collection's product membership (doc §7.12 add/remove product).
import { useState } from 'react'

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import ListItemText from '@mui/material/ListItemText'
import Avatar from '@mui/material/Avatar'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'

import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useToast } from '@/contexts/ToastContext'
import { ApiError } from '@/libs/api/types'
import { formatCurrency } from '@/libs/format'
import { useProducts } from '@/features/products/hooks/useProducts'
import type { Product } from '@/features/products/types'
import {
  useAddCollectionProduct,
  useCollectionProducts,
  useRemoveCollectionProduct
} from '../hooks/useCollections'
import type { Collection } from '../types'

type Props = {
  open: boolean
  onClose: () => void
  collection: Collection | null
}

const ManageProductsDialog = ({ open, onClose, collection }: Props) => {
  const { success, error } = useToast()
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Product | null>(null)
  const debouncedSearch = useDebouncedValue(search)

  const { data: members, isLoading } = useCollectionProducts(open ? collection?.id : undefined)
  const { data: searchResults } = useProducts({ q: debouncedSearch || undefined, limit: 10 })
  const addMutation = useAddCollectionProduct()
  const removeMutation = useRemoveCollectionProduct()

  const memberIds = new Set((members ?? []).map(p => p.id))
  const options = (searchResults?.items ?? []).filter(p => !memberIds.has(p.id))

  const handleAdd = async () => {
    if (!collection || !selected) return

    try {
      await addMutation.mutateAsync({ id: collection.id, productId: selected.id })
      success('Product added to collection')
      setSelected(null)
      setSearch('')
    } catch (err) {
      error(err instanceof ApiError ? err.message : 'Failed to add product')
    }
  }

  const handleRemove = async (productId: string) => {
    if (!collection) return

    try {
      await removeMutation.mutateAsync({ id: collection.id, productId })
      success('Product removed')
    } catch (err) {
      error(err instanceof ApiError ? err.message : 'Failed to remove product')
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle>Manage products — {collection?.title}</DialogTitle>
      <DialogContent className='flex flex-col gap-4'>
        <div className='flex items-center gap-3'>
          <Autocomplete
            fullWidth
            options={options}
            value={selected}
            onChange={(_, value) => setSelected(value)}
            getOptionLabel={option => `${option.name} — ${option.brand}`}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            onInputChange={(_, value) => setSearch(value)}
            renderInput={params => <TextField {...params} label='Search products to add' />}
          />
          <Button
            variant='contained'
            onClick={handleAdd}
            disabled={!selected || addMutation.isPending}
            className='shrink-0'
          >
            {addMutation.isPending ? <CircularProgress size={20} color='inherit' /> : 'Add'}
          </Button>
        </div>

        {isLoading ? (
          <div className='flex justify-center p-6'>
            <CircularProgress size={24} />
          </div>
        ) : members?.length ? (
          <List>
            {members.map(product => (
              <ListItem
                key={product.id}
                secondaryAction={
                  <IconButton edge='end' color='error' onClick={() => handleRemove(product.id)}>
                    <i className='tabler-trash' />
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
      </DialogContent>
      <DialogActions>
        <Button variant='tonal' color='secondary' onClick={onClose}>
          Done
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ManageProductsDialog
