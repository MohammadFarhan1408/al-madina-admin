'use client'

// Contact form messages sent from the storefront, newest first. Read-only:
// the API has no reply/archive endpoints, so replies go out by email.
import { useMemo, useState } from 'react'

import type { ColumnDef, PaginationState } from '@tanstack/react-table'

import Breadcrumbs from '@/components/shared/Breadcrumbs'
import DataTable from '@/components/shared/DataTable'
import MobileRow from '@/components/shared/MobileRow'
import PageHeader from '@/components/shared/PageHeader'
import { formatDateTime } from '@/libs/format'
import { useContactMessages } from '@/features/contact/hooks/useContactMessages'
import type { ContactMessage } from '@/features/contact/types'

const replyLink = (m: ContactMessage) => (
  <a
    href={`mailto:${m.email}?subject=${encodeURIComponent('Re: your message to Al Madina Ittar')}`}
    className='text-primary hover:underline'
  >
    {m.email}
  </a>
)

const ContactMessagesView = () => {
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 20 })

  const { data, isLoading, isFetching, isError, error, refetch } = useContactMessages({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize
  })

  const columns = useMemo<ColumnDef<ContactMessage, any>[]>(
    () => [
      {
        header: 'Received',
        accessorKey: 'createdAt',
        enableSorting: false,
        cell: ({ getValue }) => <span className='whitespace-nowrap'>{formatDateTime(getValue() as string)}</span>
      },
      { header: 'Name', accessorKey: 'name', enableSorting: false },
      { header: 'Email', accessorKey: 'email', enableSorting: false, cell: ({ row }) => replyLink(row.original) },
      {
        header: 'Message',
        accessorKey: 'message',
        enableSorting: false,
        cell: ({ getValue }) => <p className='max-w-xl whitespace-pre-line text-sm'>{getValue() as string}</p>
      }
    ],
    []
  )

  return (
    <>
      <Breadcrumbs />
      <PageHeader title='Messages' icon='tabler-mail' subtitle='Contact form messages from the storefront' />

      <DataTable
        data={data?.items ?? []}
        columns={columns}
        mobileCard={m => <MobileRow title={m.name} meta={[m.email, formatDateTime(m.createdAt), m.message]} />}
        total={data?.total ?? 0}
        pagination={pagination}
        onPaginationChange={setPagination}
        isLoading={isLoading}
        isRefetching={isFetching && !isLoading}
        isError={isError}
        errorMessage={(error as Error)?.message}
        onRetry={() => refetch()}
        itemLabel={{ one: 'message', other: 'messages' }}
        emptyIcon='tabler-mail'
        emptyMessage='No messages yet'
        emptyDescription='Messages sent through the storefront contact form will appear here.'
      />
    </>
  )
}

export default ContactMessagesView
