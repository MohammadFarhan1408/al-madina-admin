// A single label/value line inside a DetailSection. `value` accepts any
// node so callers can render a StatusChip, a list, an image, etc. — not
// just plain text.
import type { ReactNode } from 'react'

import classnames from 'classnames'

type DetailRowProps = {
  label: string
  value: ReactNode

  /** Stack label above value instead of side-by-side — for longer content (addresses, descriptions). */
  stacked?: boolean
}

/** Renders a `<dt>`/`<dd>` pair (DetailSection provides the `<dl>`), so the
 *  label/value relationship is real markup rather than two spans that merely
 *  look related.
 *
 *  Values are baseline-aligned to their label and allowed to wrap — a long
 *  email or address breaks onto a second line instead of forcing the panel
 *  wider and introducing a horizontal scrollbar. */
const DetailRow = ({ label, value, stacked }: DetailRowProps) => (
  <div className={classnames('min-w-0', stacked ? 'flex flex-col gap-1' : 'flex items-baseline justify-between gap-4')}>
    <dt className={classnames('text-sm text-textMuted', !stacked && 'shrink-0')}>{label}</dt>
    <dd
      className={classnames(
        'min-w-0 text-sm text-textPrimary',
        stacked ? 'wrap-break-word' : 'flex flex-wrap justify-end gap-1 text-right wrap-anywhere'
      )}
    >
      {value === null || value === undefined || value === '' ? <span className='text-textMuted'>—</span> : value}
    </dd>
  </div>
)

export default DetailRow
