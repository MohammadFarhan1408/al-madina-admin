import Link from 'next/link'

import Button from '@/components/ui/Button'

const NotFound = () => (
  <div className='relative flex min-h-dvh items-center justify-center overflow-x-hidden p-6'>
    <div className='flex flex-col items-center text-center'>
      <div className='mb-6 flex flex-col gap-2'>
        <p className='text-8xl font-medium text-textPrimary'>404</p>
        <h1 className='text-2xl font-semibold'>Page Not Found ⚠️</h1>
        <p className='text-textSecondary'>we couldn&#39;t find the page you are looking for.</p>
      </div>
      <Link href='/dashboard'>
        <Button>Back to Dashboard</Button>
      </Link>
      <img
        alt='error-404-illustration'
        src='/images/illustrations/characters/1.png'
        className='mt-10 h-[400px] object-cover md:mt-14 md:h-[450px] lg:mt-20 lg:h-[500px]'
      />
    </div>
  </div>
)

export default NotFound
