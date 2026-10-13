import { CHART_COLORS } from './constants'

type SparklineProps = {
  values: number[]
  height?: number
}

const WIDTH = 100

/** Shape-only trend for a KPI card: a 1.5px line with a dot on the latest
 *  period. No axes or labels — the card's number and the full charts below
 *  carry the values — so it's hidden from screen readers. Needs at least two
 *  points to say anything; with fewer it renders nothing. */
const Sparkline = ({ values, height = 28 }: SparklineProps) => {
  // An all-zero series is a flat line that says nothing; leave the space empty.
  if (values.length < 2 || values.every(v => v === 0)) return null

  const max = Math.max(...values)
  const min = Math.min(...values, 0)
  const span = max - min || 1
  const pad = 3 // room for the end dot

  const points = values.map((v, i) => {
    const x = (i / (values.length - 1)) * WIDTH
    const y = pad + (1 - (v - min) / span) * (height - pad * 2)

    return [x, y] as const
  })

  const [lastX, lastY] = points[points.length - 1]

  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${WIDTH} ${height}`}
      preserveAspectRatio='none'
      className='block w-full overflow-visible'
      style={{ height }}
    >
      <polyline
        points={points.map(([x, y]) => `${x},${y}`).join(' ')}
        fill='none'
        stroke={CHART_COLORS.muted}
        strokeWidth={1.5}
        strokeLinejoin='round'
        strokeLinecap='round'
        vectorEffect='non-scaling-stroke'
      />
      {/* The current period in the accent, per the stat-tile spec. Drawn as a
          zero-length round-capped line so the non-uniform viewBox scale can't
          squash it into an ellipse. */}
      <line
        x1={lastX}
        y1={lastY}
        x2={lastX}
        y2={lastY}
        stroke={CHART_COLORS.primaryInk}
        strokeWidth={6}
        strokeLinecap='round'
        vectorEffect='non-scaling-stroke'
      />
    </svg>
  )
}

export default Sparkline
