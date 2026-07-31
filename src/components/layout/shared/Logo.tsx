import classnames from 'classnames'

type LogoProps = {
  className?: string
}

/** Explicit intrinsic dimensions reserve the box before the bitmap decodes, so
 *  the header doesn't reflow on first paint. The alt text is empty because
 *  every Logo is wrapped in a link that already carries an accessible name —
 *  labelling both would announce the brand twice. */
const Logo = ({ className }: LogoProps) => (
  <img
    src='/images/al-madina-logo.png'
    alt=''
    width={160}
    height={40}
    decoding='async'
    className={classnames('h-9 w-auto max-w-full object-contain object-left', className)}
  />
)

export default Logo
