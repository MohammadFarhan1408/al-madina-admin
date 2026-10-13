import classnames from 'classnames'

type CharCountProps = {
  value?: string
  recommended: number
  className?: string
}

/** "42 / 60" under a text field whose length matters for display (search
 *  snippets, card titles). Guidance, not validation: it turns amber past the
 *  recommendation but never blocks saving. */
const CharCount = ({ value = '', recommended, className }: CharCountProps) => {
  const over = value.length > recommended

  return (
    <span className={classnames('tabular-nums', over && 'text-warningInk', className)}>
      {value.length} / {recommended}
      {over && <span className='sr-only'> — over the recommended length</span>}
    </span>
  )
}

export default CharCount
