import type { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from 'react'

import classnames from 'classnames'

export type TableProps = HTMLAttributes<HTMLTableElement>

export const Table = ({ className, children, ...props }: TableProps) => (
  <div className='w-full overflow-x-auto'>
    <table className={classnames('w-full border-collapse text-sm', className)} {...props}>
      {children}
    </table>
  </div>
)

export type TableHeadProps = HTMLAttributes<HTMLTableSectionElement>

export const TableHead = ({ className, children, ...props }: TableHeadProps) => (
  <thead className={classnames('bg-backgroundChat/60', className)} {...props}>
    {children}
  </thead>
)

export type TableBodyProps = HTMLAttributes<HTMLTableSectionElement>

export const TableBody = ({ className, children, ...props }: TableBodyProps) => (
  <tbody className={classnames('divide-y divide-secondary/15', className)} {...props}>
    {children}
  </tbody>
)

export type TableRowProps = HTMLAttributes<HTMLTableRowElement> & { hover?: boolean }

export const TableRow = ({ hover = false, className, children, ...props }: TableRowProps) => (
  <tr className={classnames(hover && 'transition-colors hover:bg-primary/6', className)} {...props}>
    {children}
  </tr>
)

export type TableCellAlign = 'left' | 'center' | 'right'

export type TableHeaderCellProps = ThHTMLAttributes<HTMLTableCellElement> & { align?: TableCellAlign }

export const TableHeaderCell = ({ align = 'left', className, children, ...props }: TableHeaderCellProps) => (
  <th
    className={classnames(
      'whitespace-nowrap border-b border-secondary/35 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-textPrimary',
      align === 'right' && 'text-right',
      align === 'center' && 'text-center',
      align === 'left' && 'text-left',
      className
    )}
    {...props}
  >
    {children}
  </th>
)

export type TableCellProps = TdHTMLAttributes<HTMLTableCellElement> & { align?: TableCellAlign }

export const TableCell = ({ align = 'left', className, children, ...props }: TableCellProps) => (
  <td
    className={classnames(
      'px-4 py-3 text-textPrimary',
      align === 'right' && 'text-right',
      align === 'center' && 'text-center',
      align === 'left' && 'text-left',
      className
    )}
    {...props}
  >
    {children}
  </td>
)
