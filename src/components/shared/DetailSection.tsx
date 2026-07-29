// Shared read-only key/value layout for Detail pages — a titled section
// containing a stack of DetailRows. Extracted from what OrderDetailDialog /
// CustomerDetailDialog were each hand-rolling slightly differently.
import type { ReactNode } from 'react'

import Card, { CardBody, CardHeader } from '@/components/ui/Card'

type DetailSectionProps = {
  title?: string
  action?: ReactNode
  children: ReactNode
}

export const DetailSection = ({ title, action, children }: DetailSectionProps) => (
  <Card>
    {title && (
      <CardHeader>
        <h2 className='text-base font-semibold text-textPrimary'>{title}</h2>
        {action}
      </CardHeader>
    )}
    <CardBody className='flex flex-col gap-4'>{children}</CardBody>
  </Card>
)

export default DetailSection
