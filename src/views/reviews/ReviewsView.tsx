'use client'

// Reviews moderation — server-paginated table, rating filter, delete action.
import { useMemo, useState } from 'react'

import type { ColumnDef, PaginationState, SortingState } from '@tanstack/react-table'

import PageHeader from '@/components/shared/PageHeader'
import Breadcrumbs from '@/components/shared/Breadcrumbs'
import DataTable from '@/components/shared/DataTable'
import StatusChip from '@/components/shared/StatusChip'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import Alert from '@/components/ui/Alert'
import IconButton from '@/components/ui/IconButton'
import Rating from '@/components/ui/Rating'
import { useFilterReset } from '@/hooks/useFilterReset'
import { useToast } from '@/contexts/ToastContext'
import { getErrorMessage } from '@/libs/api/types'
import { formatDate } from '@/libs/format'
import ReviewsFilterBar from '@/features/reviews/components/ReviewsFilterBar'
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
            {row.original.avatar ? (
              <img
                src={row.original.avatar}
                alt=''
                className='size-10 shrink-0 rounded-full border border-border object-cover'
              />
            ) : (
              <span className='flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/16 text-sm font-semibold text-primaryInk'>
                {row.original.author?.charAt(0)?.toUpperCase()}
              </span>
            )}
            <div className='flex items-center gap-2'>
              <span className='text-sm font-medium'>{row.original.author}</span>
              {row.original.verified && <StatusChip value='verified' />}
            </div>
          </div>
        )
      },
      {
        header: 'Rating',
        accessorKey: 'rating',
        cell: ({ getValue }) => <Rating value={getValue() as number} size='sm' />
      },
      {
        header: 'Review',
        accessorKey: 'title',
        enableSorting: false,
        cell: ({ row }) => (
          <div className='flex max-w-90 flex-col'>
            <span className='text-sm font-medium'>{row.original.title}</span>
            <span className='truncate text-xs text-textMuted'>{row.original.body}</span>
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
              size='sm'
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

      {isError && (
        <Alert severity='error' className='mb-4'>
          {(error as Error)?.message || 'Failed to load reviews.'}
        </Alert>
      )}

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
        emptyIcon='tabler-star-off'
        emptyMessage={rating === '' ? 'No reviews yet' : `No ${rating}-star reviews`}
        emptyDescription={
          rating === ''
            ? 'Customer reviews appear here once they start rating your fragrances.'
            : 'Clear the rating filter to see all reviews.'
        }
        toolbar={<ReviewsFilterBar rating={rating} onRatingChange={resetOnChange(setRating)} />}
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
