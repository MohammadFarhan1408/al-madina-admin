import Link from 'next/link'

import Button from '@/components/ui/Button'
import Card, { CardBody } from '@/components/ui/Card'
import Skeleton from '@/components/ui/Skeleton'

type InventoryAlertCardProps = {
  outOfStock?: number
  isLoading: boolean
}

/** Real-data callout — takes the reference dashboard's marketing-banner slot,
 *  but shows an actionable inventory signal instead of an "Upgrade Account"
 *  pitch that doesn't apply to an internal admin. Occupies no space at all
 *  when there's nothing to flag. */
const InventoryAlertCard = ({ outOfStock, isLoading }: InventoryAlertCardProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardBody className='flex flex-col gap-3'>
          <Skeleton variant='block' className='size-10' />
          <Skeleton className='h-4 w-3/4' />
          <Skeleton className='h-8 w-28' />
        </CardBody>
      </Card>
    )
  }

  if (!outOfStock) return null

  return (
    <Card className='h-full'>
      <CardBody className='flex h-full flex-col gap-3'>
        <span aria-hidden className='flex size-10 shrink-0 items-center justify-center rounded-md bg-warning/18 text-warningInk'>
          <i className='tabler-alert-triangle text-[20px]' />
        </span>
        <div className='flex flex-1 flex-col gap-1'>
          <p className='text-sm font-semibold text-textPrimary'>
            {outOfStock} product{outOfStock === 1 ? '' : 's'} out of stock
          </p>
          <p className='text-sm text-textMuted'>Review inventory to keep your catalogue orderable.</p>
        </div>
        <Link href='/products' className='self-start'>
          <Button size='sm' variant='outlined' color='warning' endIcon={<i className='tabler-arrow-right' />}>
            Review products
          </Button>
        </Link>
      </CardBody>
    </Card>
  )
}

export default InventoryAlertCard
