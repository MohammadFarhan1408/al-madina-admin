import type { ReactNode } from 'react'

import classnames from 'classnames'

type MobileRowProps = {
  title: ReactNode
  trailing?: ReactNode

  /** Short facts under the title, wrapped inline — name, date, amount. */
  meta?: ReactNode[]
  actions?: ReactNode
  onClick?: () => void
}

/** Card-shaped row for DataTable's `mobileCard`: what a table row says in six
 *  columns, in a title line, a wrapped line of facts and optional actions. The
 *  title area is the tap target for opening the record. */
const MobileRow = ({ title, trailing, meta, actions, onClick }: MobileRowProps) => (
  <div className='flex flex-col gap-2'>
    <div className='flex items-start justify-between gap-3'>
      <div className={classnames('min-w-0 flex-1 text-sm font-medium', onClick && 'cursor-pointer')} onClick={onClick}>
        {title}
      </div>
      {trailing}
    </div>
    {meta && meta.length > 0 && (
      <div className='flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-textSecondary'>
        {meta.map((m, i) => (
          <span key={i}>{m}</span>
        ))}
      </div>
    )}
    {actions && <div className='flex items-center justify-end gap-2'>{actions}</div>}
  </div>
)

export default MobileRow
