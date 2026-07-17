'use client'

// Reviews moderation — server-paginated table, rating filter, delete action.
import { useMemo, useState } from 'react'

import Box from '@mui/material/Box'
import Avatar from '@mui/material/Avatar'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Rating from '@mui/material/Rating'
import Alert from '@mui/material/Alert'
import type { ColumnDef, PaginationState, SortingState } from '@tanstack/react-table'

import PageHeader from '@/components/shared/PageHeader'
import Breadcrumbs from '@/components/shared/Breadcrumbs'
import DataTable from '@/components/shared/DataTable'
import StatusChip from '@/components/shared/StatusChip'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { useFilterReset } from '@/hooks/useFilterReset'
import { useToast } from '@/contexts/ToastContext'
import { getErrorMessage } from '@/libs/api/types'
import { formatDate } from '@/libs/format'
import { useDeleteReview, useReviews } from '@/features/reviews/hooks/useReviews'
import type { Review } from '@/features/reviews/types'

const ReviewsView = () => {
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 20 })
  const [rating, setRating] = useState<number | ''>('')
  const [sorting, setSorting] = useState<SortingState>([])
  const [toDelete, setToDelete] = useState<Review | null>(null)
  const resetOnChange = useFilterReset(setPagination)

  const deleteMutation = useDeleteReview()
  const { success, error: toastError } = useToast()

  const { data, isLoading, isFetching, isError, error } = useReviews({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    rating: rating === '' ? undefined : rating,
    sortBy: (sorting[0]?.id as 'rating' | 'date') || undefined,
    sortOrder: sorting[0] ? (sorting[0].desc ? 'desc' : 'asc') : undefined
  })

  const confirmDelete = async () => {
    if (!toDelete) return

    try {
      await deleteMutation.mutateAsync(toDelete.id)
      success('Review deleted')
      setToDelete(null)
    } catch (err) {
      toastError(getErrorMessage(err, 'Failed to delete review'))
    }
  }

  const columns = useMemo<ColumnDef<Review, any>[]>(
    () => [
      {
        header: 'Author',
        accessorKey: 'author',
        enableSorting: false,
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
        enableSorting: false,
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
        enableSorting: false,
        meta: { align: 'right' },
        cell: ({ row }) => (
          <div className='flex justify-end'>
            <IconButton
              size='small'
              color='error'
              aria-label={`Delete review by ${row.original.author}`}
              onClick={() => setToDelete(row.original)}
            >
              <i className='tabler-trash' />
            </IconButton>
          </div>
        )
      }
    ],
    []
  )

  return (
    <>
      <Breadcrumbs />
      <PageHeader title='Reviews' subtitle='Moderate customer product reviews' />

      {isError && <Alert severity='error' className='mbe-4'>{(error as Error)?.message || 'Failed to load reviews.'}</Alert>}

      <DataTable
        data={data?.items ?? []}
        columns={columns}
        total={data?.total ?? 0}
        pagination={pagination}
        onPaginationChange={setPagination}
        sorting={sorting}
        onSortingChange={setSorting}
        isLoading={isLoading}
        isRefetching={isFetching && !isLoading}
        emptyMessage='No reviews found'
        toolbar={
          <Box className='flex flex-wrap items-center gap-3 p-6'>
            <Typography variant='body2' color='text.secondary'>
              Filter by rating:
            </Typography>
            <Rating
              value={rating || 0}
              onChange={(_, value) => resetOnChange(setRating)(value ?? '')}
            />
            {rating !== '' && (
              <IconButton size='small' aria-label='Clear rating filter' onClick={() => resetOnChange(setRating)('')}>
                <i className='tabler-x text-[16px]' />
              </IconButton>
            )}
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
