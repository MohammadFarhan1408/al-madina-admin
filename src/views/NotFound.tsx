import Link from 'next/link'

import Button from '@/components/ui/Button'
import DecorativeDivider from '@/components/shared/DecorativeDivider'

/** Route-level 404. Leads with a way back rather than only stating the problem,
 *  and drops the 400–500px stock illustration that used to dominate the page
 *  and push the recovery action off-screen on shorter viewports. */
const NotFound = () => (
  <div className='flex min-h-dvh flex-col items-center justify-center gap-6 px-4 py-12 text-center'>
    <span
      aria-hidden
      className='flex size-16 items-center justify-center rounded-full border border-border bg-backgroundChat/50 text-primaryInk'
    >
      <i className='tabler-map-search text-[30px]' />
    </span>

    <div className='flex flex-col items-center gap-3'>
      <p className='text-2xs font-semibold uppercase tracking-[0.2em] text-primaryInk'>Error 404</p>
      <h1 className='text-2xl font-semibold tracking-[-0.015em] text-textPrimary sm:text-3xl'>Page not found</h1>
      <DecorativeDivider width={32} />
      <p className='max-w-md text-sm text-textMuted'>
        The page you&apos;re looking for may have been moved, renamed, or never existed.
      </p>
    </div>

    <div className='flex flex-wrap items-center justify-center gap-2'>
      <Link href='/dashboard'>
        <Button startIcon={<i className='tabler-layout-dashboard' />}>Back to dashboard</Button>
      </Link>
      <Link href='/products'>
        <Button variant='outlined' color='secondary'>
          Browse products
        </Button>
      </Link>
    </div>
  </div>
)

export default NotFound
