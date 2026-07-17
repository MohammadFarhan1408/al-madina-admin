'use client'

import type { ReactNode } from 'react'

import Typography from '@mui/material/Typography'

import SectionEyebrow from './SectionEyebrow'

type PageHeaderProps = {
  title: string
  subtitle?: string

  /** Small-caps gold label rendered above the title (e.g. "Catalogue"). */
  eyebrow?: string
  action?: ReactNode
}

/** Consistent page title (serif, via theme's h4 override) + optional
 *  gold eyebrow label + right-aligned action (e.g. "Add" button). */
const PageHeader = ({ title, subtitle, eyebrow, action }: PageHeaderProps) => (
  <div className='flex flex-wrap items-center justify-between gap-4 mbe-6'>
    <div className='flex flex-col gap-1'>
      {eyebrow && <SectionEyebrow>{eyebrow}</SectionEyebrow>}
      <Typography variant='h4'>{title}</Typography>
      {subtitle && <Typography color='text.secondary'>{subtitle}</Typography>}
    </div>
    {action && <div className='flex items-center gap-3'>{action}</div>}
  </div>
)

export default PageHeader
