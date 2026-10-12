import Card, { CardBody } from '@/components/ui/Card'
import Skeleton from '@/components/ui/Skeleton'

/** Same box model as the loaded page, so nothing jumps when data lands. */
const OrderDetailSkeleton = () => (
  <div aria-hidden className='flex flex-col gap-5'>
    <Card>
      <CardBody padding='lg'>
        <Skeleton className='h-12 w-full' />
      </CardBody>
    </Card>
    <div className='grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]'>
      <Skeleton variant='block' className='h-72' />
      <Skeleton variant='block' className='h-72' />
    </div>
  </div>
)

export default OrderDetailSkeleton
