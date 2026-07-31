// Shared read-only key/value layout for Detail pages — a titled section
// containing a stack of DetailRows. Extracted from what OrderDetailDialog /
// CustomerDetailDialog were each hand-rolling slightly differently.
import type { ReactNode } from 'react'

import classnames from 'classnames'

import Card, { CardBody, CardHeader } from '@/components/ui/Card'

type DetailSectionProps = {
  title?: string
  description?: string
  action?: ReactNode

  /** Render rows in two columns from `sm` up — for sections with many short
   *  values, where a single column leaves a column of dead space. */
  columns?: 1 | 2

  /** Set false when the body holds arbitrary content rather than DetailRows,
   *  so it isn't wrapped in a description list. */
  asList?: boolean
  children: ReactNode
  className?: string
}

/** The `<dl>` lives here rather than in DetailRow, so a section of rows forms
 *  one description list instead of a series of unrelated single-item lists. */
export const DetailSection = ({
  title,
  description,
  action,
  columns = 1,
  asList = true,
  children,
  className
}: DetailSectionProps) => {
  const bodyClasses = classnames(
    columns === 2 ? 'grid grid-cols-1 gap-x-8 gap-y-3.5 sm:grid-cols-2' : 'flex flex-col gap-3.5'
  )

  return (
    <Card className={className}>
      {(title || action) && <CardHeader title={title} description={description} action={action} />}
      <CardBody>
        {asList ? <dl className={bodyClasses}>{children}</dl> : <div className={bodyClasses}>{children}</div>}
      </CardBody>
    </Card>
  )
}

export default DetailSection
