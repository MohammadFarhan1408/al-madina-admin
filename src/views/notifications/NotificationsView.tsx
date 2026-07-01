'use client'

// Broadcast a push/in-app notification to all customers or a specific tier.
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import PageHeader from '@/components/shared/PageHeader'
import CustomTextField from '@core/components/mui/TextField'
import { useToast } from '@/contexts/ToastContext'
import { ApiError } from '@/libs/api/types'
import { humanize } from '@/libs/format'
import { USER_TIERS } from '@/features/customers/types'
import {
  broadcastSchema,
  defaultBroadcastValues,
  NOTIFICATION_KINDS,
  type BroadcastFormValues
} from '@/features/notifications/schema'
import { useBroadcastNotification } from '@/features/notifications/hooks/useNotifications'

const NotificationsView = () => {
  const { success, error } = useToast()
  const broadcast = useBroadcastNotification()

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<BroadcastFormValues>({
    resolver: zodResolver(broadcastSchema),
    defaultValues: defaultBroadcastValues
  })

  const onSubmit = async (values: BroadcastFormValues) => {
    try {
      await broadcast.mutateAsync(values)
      success('Broadcast queued for delivery')
      reset(defaultBroadcastValues)
    } catch (err) {
      error(err instanceof ApiError ? err.message : 'Failed to send broadcast')
    }
  }

  return (
    <>
      <PageHeader title='Notifications' subtitle='Send an announcement to your customers' />

      <Grid container>
        <Grid size={{ xs: 12, md: 8, lg: 6 }}>
          <Card>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-5'>
                <Controller
                  name='kind'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField {...field} select fullWidth label='Type'>
                      {NOTIFICATION_KINDS.map(kind => (
                        <MenuItem key={kind} value={kind}>
                          {humanize(kind)}
                        </MenuItem>
                      ))}
                    </CustomTextField>
                  )}
                />
                <Controller
                  name='tier'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      select
                      fullWidth
                      label='Audience'
                      helperText='Leave as "All customers" to broadcast to everyone.'
                    >
                      <MenuItem value=''>All customers</MenuItem>
                      {USER_TIERS.map(tier => (
                        <MenuItem key={tier} value={tier}>
                          {tier}
                        </MenuItem>
                      ))}
                    </CustomTextField>
                  )}
                />
                <Controller
                  name='title'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      label='Title'
                      error={!!errors.title}
                      helperText={errors.title?.message}
                    />
                  )}
                />
                <Controller
                  name='body'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      multiline
                      minRows={4}
                      label='Message'
                      error={!!errors.body}
                      helperText={errors.body?.message}
                    />
                  )}
                />
                <div className='flex items-center gap-4'>
                  <Button type='submit' variant='contained' disabled={broadcast.isPending}>
                    {broadcast.isPending ? <CircularProgress size={20} color='inherit' /> : 'Send broadcast'}
                  </Button>
                  <Typography variant='caption' color='text.secondary'>
                    Delivery is queued and processed in the background.
                  </Typography>
                </div>
              </form>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  )
}

export default NotificationsView
