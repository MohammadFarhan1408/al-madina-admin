import type { ReactNode } from 'react'

import SectionEyebrow from './SectionEyebrow'

type PageHeaderProps = {
  title: string
  subtitle?: string

  /** Small-caps gold label rendered above the title (e.g. "Catalogue"). */
  eyebrow?: string
  action?: ReactNode
}

/** Consistent page title + optional gold eyebrow label + right-aligned
 *  action (e.g. "Add" button). */
const PageHeader = ({ title, subtitle, eyebrow, action }: PageHeaderProps) => (
  <div className='mb-6 flex flex-wrap items-center justify-between gap-4'>
    <div className='flex flex-col gap-1'>
      {eyebrow && <SectionEyebrow>{eyebrow}</SectionEyebrow>}
      <h1 className='text-2xl font-semibold tracking-tight text-textPrimary'>{title}</h1>
      {subtitle && <p className='text-textSecondary'>{subtitle}</p>}
    </div>
    {action && <div className='flex items-center gap-3'>{action}</div>}
  </div>
)

export default PageHeader
