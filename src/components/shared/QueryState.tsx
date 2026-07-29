// The "still loading, or failed to load" block every detail/edit view renders
// before its data arrives.
import Alert from '@/components/ui/Alert'
import Spinner from '@/components/ui/Spinner'

type QueryStateProps = {
  isError?: boolean
  error?: unknown
  fallbackMessage?: string
}

const QueryState = ({ isError, error, fallbackMessage = 'Failed to load.' }: QueryStateProps) =>
  isError ? (
    <Alert severity='error'>{(error as Error)?.message || fallbackMessage}</Alert>
  ) : (
    <div className='flex justify-center p-8'>
      <Spinner size='lg' />
    </div>
  )

export default QueryState
