// Chart colours come from the brand's @theme tokens (src/app/globals.css), not
// new hex values. Every dashboard chart is single-series (no categorical
// palette to validate): marks use `primaryInk` — the deepest gold, 5.5:1 on the
// card surface, where the brighter `primary` (1.9:1) would fail the 3:1
// non-text bar. `muted` is the de-emphasis ink for sparklines' context.
export const CHART_COLORS = {
  primary: 'var(--color-primary)',
  primaryInk: 'var(--color-primaryInk)',
  muted: 'var(--color-textMuted)',
  grid: 'var(--color-border)',
  surface: 'var(--color-backgroundPaper)'
} as const

export const AXIS_TICK = { fill: 'var(--color-textMuted)', fontSize: 12 } as const
