// Small-caps gold letter-spaced label used above page/section titles — the
// "AL MADINA" / "Browse" / "EXPLORE BY FAMILY" pattern from the mobile app.
import type { HTMLAttributes } from 'react'

import classnames from 'classnames'

const SectionEyebrow = ({ className, children, ...rest }: HTMLAttributes<HTMLSpanElement>) => (
  <span
    className={classnames('block text-xs font-semibold uppercase leading-tight tracking-widest text-primary', className)}
    {...rest}
  >
    {children}
  </span>
)

export default SectionEyebrow
