'use client'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

import CustomAvatar from '@core/components/mui/Avatar'
import type { ThemeColor } from '@core/types'

type StatCardProps = {
  title: string
  value: string | number
  icon: string
  color?: ThemeColor
  subtitle?: string
}

/** Compact KPI card used on the dashboard (reuses the shared CustomAvatar). */
const StatCard = ({ title, value, icon, color = 'primary', subtitle }: StatCardProps) => (
  <Card>
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
