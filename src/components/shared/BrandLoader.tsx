// Branded full-area loading state: favicon mark + spinner + wordmark.
const BrandLoader = ({ label = 'Loading…' }: { label?: string }) => (
  <div className='flex min-h-[60vh] w-full flex-col items-center justify-center gap-4'>
    <div className='relative inline-flex size-16 items-center justify-center'>
      <span className='absolute inset-0 animate-spin rounded-full border-2 border-primary/20 border-t-primary' />
      <img src='/icon.png' alt='' width={32} height={32} className='size-8 rounded-sm object-contain' />
    </div>
    <p className='text-lg font-semibold tracking-wide text-textPrimary'>Al Madina</p>
    <p className='text-sm text-textSecondary'>{label}</p>
  </div>
)

export default BrandLoader
