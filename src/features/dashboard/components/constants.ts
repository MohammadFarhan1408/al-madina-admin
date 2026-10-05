// Chart colours come from the brand's @theme tokens (src/app/globals.css), not
// new hex values. Single-series charts use `primaryInk` — the deepest gold,
// which clears 3:1 against the card surface (the brighter `primary` does not).
export const CHART_COLORS = {
  primary: 'var(--color-primary)',
  primaryInk: 'var(--color-primaryInk)'
} as const
