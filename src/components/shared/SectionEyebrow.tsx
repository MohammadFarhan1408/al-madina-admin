'use client'

// Small-caps gold letter-spaced label used above page/section titles — the
// "AL MADINA" / "Browse" / "EXPLORE BY FAMILY" pattern from the mobile app.
import Typography from '@mui/material/Typography'
import type { TypographyProps } from '@mui/material/Typography'

const SectionEyebrow = ({ children, ...rest }: TypographyProps) => (
  <Typography
    variant='overline'
    color='primary.main'
    {...rest}
    sx={{ display: 'block', lineHeight: 1.2, ...rest.sx }}
  >
    {children}
  </Typography>
)

export default SectionEyebrow
