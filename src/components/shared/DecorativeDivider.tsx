// Thin gold rule with a centered diamond — the Art Deco divider seen under
// mobile app titles and on the splash screen.
import classnames from 'classnames'

type Props = {
  className?: string
  width?: number | string
}

const DecorativeDivider = ({ className, width = 96 }: Props) => (
  <div className={classnames('flex items-center justify-center gap-4', className)}>
    <span className='h-px bg-primary opacity-60' style={{ width }} />
    <span className='size-1.5 shrink-0 rotate-45 bg-primary' />
    <span className='h-px bg-primary opacity-60' style={{ width }} />
  </div>
)

export default DecorativeDivider
