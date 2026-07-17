'use client'

// Thin gold rule with a centered diamond — the Art Deco divider seen under
// mobile app titles and on the splash screen.
import Box from '@mui/material/Box'

type Props = {
  className?: string
  width?: number | string
}

const DecorativeDivider = ({ className, width = 96 }: Props) => (
  <Box className={className} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
    <Box sx={{ inlineSize: width, blockSize: '1px', backgroundColor: 'primary.main', opacity: 0.6 }} />
    <Box
      sx={{
        inlineSize: 6,
        blockSize: 6,
        backgroundColor: 'primary.main',
        transform: 'rotate(45deg)',
        flexShrink: 0
      }}
    />
    <Box sx={{ inlineSize: width, blockSize: '1px', backgroundColor: 'primary.main', opacity: 0.6 }} />
  </Box>
)

export default DecorativeDivider
