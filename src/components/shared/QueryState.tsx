// The "still loading, or failed to load" block every detail/edit view renders
// before its data arrives.
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Skeleton, { SkeletonText } from '@/components/ui/Skeleton'

type QueryStateProps = {
  isError?: boolean
  error?: unknown
  fallbackMessage?: string

  /** Wire to the query's `refetch` so a failure has a way out instead of
   *  forcing a full page reload. */
  onRetry?: () => void
}

/** A failed load gets an error with a retry path; a pending load gets a
 *  skeleton shaped like the detail panel that's coming, rather than a spinner
 *  floating in empty space. */
const QueryState = ({ isError, error, fallbackMessage = 'Failed to load.', onRetry }: QueryStateProps) =>
  isError ? (
    <Alert
      severity='error'
      title='Could not load this record'
      action={
        onRetry && (
          <Button
            size='sm'
            variant='outlined'
            color='error'
            startIcon={<i className='tabler-refresh' />}
            onClick={onRetry}
          >
            Try again
          </Button>
        )
      }
    >
      {(error as Error)?.message || fallbackMessage}
    </Alert>
  ) : (
    <div aria-busy aria-live='polite' aria-label='Loading' className='flex flex-col gap-4'>
      <Card>
        <div className='flex flex-col gap-4 px-5 py-4'>
          <div className='flex items-center gap-3'>
            <Skeleton variant='block' className='size-11' />
            <div className='flex flex-1 flex-col gap-2'>
              <Skeleton className='h-4 w-48' />
              <Skeleton className='h-3 w-28' />
            </div>
          </div>
          <SkeletonText lines={4} />
        </div>
      </Card>
      <Card>
        <div className='px-5 py-4'>
          <SkeletonText lines={3} />
        </div>
      </Card>
    </div>
  )

export default QueryState
