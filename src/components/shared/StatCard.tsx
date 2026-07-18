'use client'

import MuiCard from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { styled } from '@mui/material/styles'
import type { CardProps } from '@mui/material/Card'

import CustomAvatar from '@core/components/mui/Avatar'
import type { ThemeColor } from '@core/types'

type StatCardProps = {
  title: string
  value: string | number
  icon: string
  color?: ThemeColor
  subtitle?: string
}

// Colored bottom-border + hover elevation, adapted from Theme's
// card-statistics/HorizontalWithBorder.tsx (trend-number feature not
// adopted — no week-over-week metric exists in our data to show it).
const Card = styled(MuiCard)<CardProps & { color: ThemeColor }>(({ color }) => ({
  transition: 'border 0.3s ease-in-out, box-shadow 0.3s ease-in-out, margin 0.3s ease-in-out',
  borderBlockEndWidth: '2px',
  borderBlockEndColor: `var(--mui-palette-${color}-darkerOpacity)`,
  '&:hover': {
    borderBlockEndWidth: '3px',
    borderBlockEndColor: `var(--mui-palette-${color}-main) !important`,
    boxShadow: 'var(--mui-customShadows-lg)',
    marginBlockEnd: '-1px'
  }
}))

/** Compact KPI card used on the dashboard (reuses the shared CustomAvatar). */
const StatCard = ({ title, value, icon, color = 'primary', subtitle }: StatCardProps) => (
  <Card color={color}>
    <CardContent className='flex items-center gap-4'>
      <CustomAvatar variant='rounded' skin='light' color={color} size={44}>
        <i className={`${icon} text-[26px]`} />
      </CustomAvatar>
      <div className='flex flex-col'>
        <Typography variant='h5'>{value}</Typography>
        <Typography variant='body2' color='text.secondary'>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant='caption' color='text.disabled'>
            {subtitle}
          </Typography>
        )}
      </div>
    </CardContent>
  </Card>
)

export default StatCard
