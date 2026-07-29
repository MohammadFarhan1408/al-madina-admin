'use client'

// Broadcast a push/in-app notification to all customers or a specific tier,
// plus a history of past broadcasts (read from the admin audit trail).
import { useMemo, useState } from 'react'

import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { ColumnDef, PaginationState } from '@tanstack/react-table'

import PageHeader from '@/components/shared/PageHeader'
import Breadcrumbs from '@/components/shared/Breadcrumbs'
import DataTable from '@/components/shared/DataTable'
import StatusChip from '@/components/shared/StatusChip'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import Button from '@/components/ui/Button'
import Card, { CardBody, CardHeader } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Textarea from '@/components/ui/Textarea'
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

      <div className='flex flex-col gap-6'>
        <div className='md:w-2/3 lg:w-1/2'>
          <Card>
            <CardBody>
              <form onSubmit={handleSubmit(values => setPending(values))} className='flex flex-col gap-5'>
                <Controller
                  name='kind'
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label='Type'
                      error={errors.kind?.message}
                      options={NOTIFICATION_KINDS.map(kind => ({ label: humanize(kind), value: kind }))}
                    />
                  )}
                />
                <Controller
                  name='tier'
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label='Audience'
                      error={errors.tier?.message}
                      helperText='Leave as "All customers" to broadcast to everyone.'
                      options={[
                        { label: 'All customers', value: '' },
                        ...USER_TIERS.map(tier => ({ label: tier, value: tier }))
                      ]}
                    />
                  )}
                />
                <Controller
                  name='title'
                  control={control}
                  render={({ field }) => <Input {...field} required label='Title' error={errors.title?.message} />}
                />
                <Controller
                  name='body'
                  control={control}
                  render={({ field }) => (
                    <Textarea {...field} required rows={4} label='Message' error={errors.body?.message} />
                  )}
                />
                <div className='flex items-center gap-4'>
                  <Button type='submit' loading={broadcast.isPending}>
                    Send broadcast
                  </Button>
                  <span className='text-xs text-textSecondary'>Delivery is queued and processed in the background.</span>
                </div>
              </form>
            </CardBody>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <div className='flex flex-col'>
                <h2 className='text-base font-semibold text-textPrimary'>Broadcast history</h2>
                <span className='text-sm text-textSecondary'>Past announcements sent from this panel</span>
              </div>
            </CardHeader>
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
        </div>
      </div>

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
