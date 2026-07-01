'use client'

// Reviews moderation — server-paginated table, rating filter, delete action.
import { useMemo, useState } from 'react'

import Box from '@mui/material/Box'
import MenuItem from '@mui/material/MenuItem'
import Avatar from '@mui/material/Avatar'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Rating from '@mui/material/Rating'
import Alert from '@mui/material/Alert'
import type { ColumnDef, PaginationState } from '@tanstack/react-table'

import PageHeader from '@/components/shared/PageHeader'
import DataTable from '@/components/shared/DataTable'
import StatusChip from '@/components/shared/StatusChip'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import CustomTextField from '@core/components/mui/TextField'
import { useToast } from '@/contexts/ToastContext'
import { ApiError } from '@/libs/api/types'
import { formatDate } from '@/libs/format'
import { useDeleteReview, useReviews } from '@/features/reviews/hooks/useReviews'
import type { Review } from '@/features/reviews/types'

const ReviewsView = () => {
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 20 })
  const [rating, setRating] = useState<number | ''>('')
  const [toDelete, setToDelete] = useState<Review | null>(null)

  const deleteMutation = useDeleteReview()
  const { success, error: toastError } = useToast()

  const { data, isLoading, isFetching, isError, error } = useReviews({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    rating: rating === '' ? undefined : rating
  })

  const confirmDelete = async () => {
    if (!toDelete) return

    try {
      await deleteMutation.mutateAsync(toDelete.id)
      success('Review deleted')
      setToDelete(null)
    } catch (err) {
      toastError(err instanceof ApiError ? err.message : 'Failed to delete review')
    }
  }

  const columns = useMemo<ColumnDef<Review, any>[]>(
    () => [
      {
        header: 'Author',
        accessorKey: 'author',
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            <Avatar src={row.original.avatar}>{row.original.author?.charAt(0)}</Avatar>
            <div className='flex items-center gap-2'>
              <Typography variant='subtitle2'>{row.original.author}</Typography>
              {row.original.verified && <StatusChip value='verified' />}
            </div>
          </div>
        )
      },
      {
        header: 'Rating',
        accessorKey: 'rating',
        cell: ({ getValue }) => <Rating value={getValue() as number} readOnly size='small' />
      },
      {
        header: 'Review',
        accessorKey: 'title',
        cell: ({ row }) => (
          <div className='flex flex-col max-is-[360px]'>
            <Typography variant='subtitle2'>{row.original.title}</Typography>
            <Typography variant='caption' color='text.secondary' className='truncate'>
              {row.original.body}
            </Typography>
          </div>
        )
      },
      {
        header: 'Date',
        accessorKey: 'date',
        cell: ({ row }) => formatDate(row.original.date || row.original.createdAt)
      },
      {
        header: 'Actions',
        cell: ({ row }) => (
          <IconButton size='small' color='error' onClick={() => setToDelete(row.original)}>
            <i className='tabler-trash' />
          </IconButton>
        )
      }
    ],
    []
  )

  return (
    <>
      <PageHeader title='Reviews' subtitle='Moderate customer product reviews' />

      {isError && <Alert severity='error' className='mbe-4'>{(error as Error)?.message || 'Failed to load reviews.'}</Alert>}

      <DataTable
        data={data?.items ?? []}
        columns={columns}
        total={data?.total ?? 0}
        pagination={pagination}
        onPaginationChange={setPagination}
        isLoading={isLoading || isFetching}
        emptyMessage='No reviews found'
        toolbar={
          <Box className='flex flex-wrap items-center gap-4 p-6'>
            <CustomTextField
              select
              value={rating}
              onChange={e => {
                setRating(e.target.value === '' ? '' : Number(e.target.value))
                setPagination(p => ({ ...p, pageIndex: 0 }))
              }}
              className='min-is-[160px]'
              label='Rating'
            >
              <MenuItem value=''>All ratings</MenuItem>
              {[5, 4, 3, 2, 1].map(r => (
                <MenuItem key={r} value={r}>
                  {r} star{r > 1 ? 's' : ''}
                </MenuItem>
              ))}
            </CustomTextField>
          </Box>
        }
      />

      <ConfirmDialog
        open={!!toDelete}
        title='Delete review'
        description={`Delete the review "${toDelete?.title}" by ${toDelete?.author}?`}
        confirmText='Delete'
        loading={deleteMutation.isPending}
        onConfirm={confirmDelete}
        onClose={() => setToDelete(null)}
      />
    </>
  )
}

export default ReviewsView
