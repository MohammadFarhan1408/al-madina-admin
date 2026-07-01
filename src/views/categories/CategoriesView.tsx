'use client'

// Categories management — list (all), create/edit dialog, delete confirm.
import { useState } from 'react'

import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Avatar from '@mui/material/Avatar'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import LinearProgress from '@mui/material/LinearProgress'
import Alert from '@mui/material/Alert'

import PageHeader from '@/components/shared/PageHeader'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { useToast } from '@/contexts/ToastContext'
import { ApiError } from '@/libs/api/types'
import { useCategories, useDeleteCategory } from '@/features/categories/hooks/useCategories'
import CategoryFormDialog from '@/features/categories/components/CategoryFormDialog'
import type { Category } from '@/features/categories/types'

const CategoriesView = () => {
  const { data: categories, isLoading, isError, error } = useCategories()
  const deleteMutation = useDeleteCategory()
  const { success, error: toastError } = useToast()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [toDelete, setToDelete] = useState<Category | null>(null)

  const openCreate = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const openEdit = (category: Category) => {
    setEditing(category)
    setFormOpen(true)
  }

  const confirmDelete = async () => {
    if (!toDelete) return

    try {
      await deleteMutation.mutateAsync(toDelete.id)
      success('Category deleted')
      setToDelete(null)
    } catch (err) {
      toastError(err instanceof ApiError ? err.message : 'Failed to delete category')
    }
  }

  return (
    <>
      <PageHeader
        title='Categories'
        subtitle='Organize your fragrance catalogue'
        action={
          <Button variant='contained' startIcon={<i className='tabler-plus' />} onClick={openCreate}>
            Add Category
          </Button>
        }
      />

      {isError && <Alert severity='error' className='mbe-4'>{(error as Error)?.message || 'Failed to load categories.'}</Alert>}

      <Card>
        {isLoading && <LinearProgress />}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Category</TableCell>
                <TableCell>Tagline</TableCell>
                <TableCell align='center'>Products</TableCell>
                <TableCell align='center'>Sort</TableCell>
                <TableCell align='right'>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!isLoading && (!categories || categories.length === 0) ? (
                <TableRow>
                  <TableCell colSpan={5} align='center' sx={{ py: 8 }}>
                    <Typography color='text.secondary'>No categories yet.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                categories?.map(category => (
                  <TableRow key={category.id} hover>
                    <TableCell>
                      <div className='flex items-center gap-3'>
                        <Avatar variant='rounded' src={category.image} />
                        <Typography variant='subtitle2'>{category.name}</Typography>
                      </div>
                    </TableCell>
                    <TableCell>{category.tagline || '—'}</TableCell>
                    <TableCell align='center'>{category.productCount}</TableCell>
                    <TableCell align='center'>{category.sortOrder}</TableCell>
                    <TableCell align='right'>
                      <IconButton size='small' onClick={() => openEdit(category)}>
                        <i className='tabler-edit' />
                      </IconButton>
                      <IconButton size='small' color='error' onClick={() => setToDelete(category)}>
                        <i className='tabler-trash' />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <CategoryFormDialog open={formOpen} onClose={() => setFormOpen(false)} category={editing} />
      <ConfirmDialog
        open={!!toDelete}
        title='Delete category'
        description={`Delete "${toDelete?.name}"? This cannot be undone.`}
        confirmText='Delete'
        loading={deleteMutation.isPending}
        onConfirm={confirmDelete}
        onClose={() => setToDelete(null)}
      />
    </>
  )
}

export default CategoriesView
