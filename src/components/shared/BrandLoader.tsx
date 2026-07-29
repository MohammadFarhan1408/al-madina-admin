// Branded full-area loading state: gold Al Madina mark + spinner + wordmark.
import BrandMark from './BrandMark'

const BrandLoader = ({ label = 'Loading…' }: { label?: string }) => (
  <div className='flex min-h-[60vh] w-full flex-col items-center justify-center gap-4'>
    <div className='relative inline-flex size-16 items-center justify-center'>
      <span className='absolute inset-0 animate-spin rounded-full border-2 border-primary/20 border-t-primary' />
      <BrandMark className='text-3xl text-primary' />
    </div>
    <p className='text-lg font-semibold tracking-wide text-textPrimary'>Al Madina</p>
    <p className='text-sm text-textSecondary'>{label}</p>
  </div>
)

export default BrandLoader
