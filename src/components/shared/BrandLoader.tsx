'use client'

// Branded full-area loading state: gold Al Madina mark + spinner + wordmark.
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'

import Logo from '@core/svg/Logo'
import themeConfig from '@configs/themeConfig'

const BrandLoader = ({ label = 'Loading…' }: { label?: string }) => (
  <Box
    className='flex flex-col items-center justify-center gap-4'
    sx={{ minBlockSize: '60vh', inlineSize: '100%' }}
  >
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <CircularProgress size={64} thickness={2} sx={{ color: 'primary.main' }} />
      <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Logo className='text-3xl text-primary' />
      </Box>
    </Box>
    <Typography variant='h6' sx={{ letterSpacing: 1 }}>
      {themeConfig.templateName}
    </Typography>
    <Typography variant='body2' color='text.secondary'>
      {label}
    </Typography>
  </Box>
)

export default BrandLoader
