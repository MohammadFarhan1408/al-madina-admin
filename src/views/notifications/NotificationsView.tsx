'use client'

// Broadcast a push/in-app notification to all customers or a specific tier,
// plus a history of past broadcasts (read from the admin audit trail).
import { useMemo, useState } from 'react'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { ColumnDef, PaginationState } from '@tanstack/react-table'

import PageHeader from '@/components/shared/PageHeader'
import Breadcrumbs from '@/components/shared/Breadcrumbs'
import DataTable from '@/components/shared/DataTable'
import StatusChip from '@/components/shared/StatusChip'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import CustomTextField from '@core/components/mui/TextField'
import { useToast } from '@/contexts/ToastContext'
import { getErrorMessage } from '@/libs/api/types'
import { formatDateTime, humanize } from '@/libs/format'
import { USER_TIERS } from '@/features/customers/types'
import {
  broadcastSchema,
  defaultBroadcastValues,
  NOTIFICATION_KINDS,
  type BroadcastFormValues
} from '@/features/notifications/schema'
import { useBroadcastNotification, useNotificationHistory } from '@/features/notifications/hooks/useNotifications'
import type { BroadcastHistoryEntry } from '@/features/notifications/types'

const NotificationsView = () => {
  const { success, error } = useToast()
  const broadcast = useBroadcastNotification()
  const [pending, setPending] = useState<BroadcastFormValues | null>(null)
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<BroadcastFormValues>({
    resolver: zodResolver(broadcastSchema),
    defaultValues: defaultBroadcastValues
  })

  const { data: history, isLoading: historyLoading, isFetching: historyFetching } = useNotificationHistory({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize
  })

  const confirmSend = async () => {
    if (!pending) return

    try {
      await broadcast.mutateAsync(pending)
      success('Broadcast queued for delivery')
      reset(defaultBroadcastValues)
    } catch (err) {
      error(getErrorMessage(err, 'Failed to send broadcast'))
    } finally {
      setPending(null)
    }
  }

  const columns = useMemo<ColumnDef<BroadcastHistoryEntry, any>[]>(
    () => [
      { header: 'Kind', accessorKey: 'kind', cell: ({ getValue }) => <StatusChip value={getValue() as string} /> },
      { header: 'Title', accessorKey: 'title' },
      {
        header: 'Audience',
        accessorKey: 'tier',
        cell: ({ getValue }) => (getValue() as string) || 'All customers'
      },
      { header: 'Sent by', accessorKey: 'actorEmail', cell: ({ getValue }) => (getValue() as string) || '—' },
      {
        header: 'Sent',
        accessorKey: 'createdAt',
        cell: ({ getValue }) => formatDateTime(getValue() as string)
      }
    ],
    []
  )

  return (
    <>
      <Breadcrumbs />
      <PageHeader title='Notifications' subtitle='Send an announcement to your customers' />

      <Grid container spacing={6}>
        <Grid size={{ xs: 12, md: 8, lg: 6 }}>
          <Card>
            <CardContent>
              <form onSubmit={handleSubmit(values => setPending(values))} className='flex flex-col gap-5'>
                <Controller
                  name='kind'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField {...field} select fullWidth label='Type' error={!!errors.kind} helperText={errors.kind?.message}>
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
                      error={!!errors.tier}
                      helperText={errors.tier?.message ?? 'Leave as "All customers" to broadcast to everyone.'}
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
                      required
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
                      required
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

        <Grid size={{ xs: 12 }}>
          <Card>
            <CardHeader title='Broadcast history' subheader='Past announcements sent from this panel' />
            <DataTable
              data={history?.items ?? []}
              columns={columns}
              total={history?.total ?? 0}
              pagination={pagination}
              onPaginationChange={setPagination}
              isLoading={historyLoading}
              isRefetching={historyFetching && !historyLoading}
              pageSizeOptions={[10, 20, 50]}
              emptyMessage='No broadcasts sent yet.'
            />
          </Card>
        </Grid>
      </Grid>

      <ConfirmDialog
        open={!!pending}
        title='Send broadcast'
        description={`Send "${pending?.title}" to ${pending?.tier || 'all customers'}? This reaches every matching customer immediately and can't be recalled.`}
        confirmText='Send'
        confirmColor='primary'
        loading={broadcast.isPending}
        onConfirm={confirmSend}
        onClose={() => setPending(null)}
      />
    </>
  )
}

export default NotificationsView
