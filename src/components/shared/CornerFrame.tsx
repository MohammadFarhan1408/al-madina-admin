'use client'

// Wraps an image/card with 4 gold Art Deco corner brackets — matches the
// mobile app's "Collection" grid card treatment. Purely decorative overlay;
// does not affect the layout of `children`.
import type { ReactNode } from 'react'

import classnames from 'classnames'

const CornerFrame = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={classnames('am-corner-frame', className)}>
    {children}
    <span className='am-corner am-corner-tl' />
    <span className='am-corner am-corner-tr' />
    <span className='am-corner am-corner-bl' />
    <span className='am-corner am-corner-br' />
  </div>
)

export default CornerFrame
