'use client'

// Shared read-only key/value layout for Detail pages — a titled section
// containing a stack of DetailRows. Extracted from what OrderDetailDialog /
// CustomerDetailDialog were each hand-rolling slightly differently.
import type { ReactNode } from 'react'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'

type DetailSectionProps = {
  title?: string
  action?: ReactNode
  children: ReactNode
}

export const DetailSection = ({ title, action, children }: DetailSectionProps) => (
  <Card>
    {title && <CardHeader title={title} action={action} />}
    <CardContent className='flex flex-col gap-4'>{children}</CardContent>
  </Card>
)

export default DetailSection
