import Fact from '@/components/shared/Fact'
import StatusChip from '@/components/shared/StatusChip'
import Button from '@/components/ui/Button'
import Card, { CardBody, CardHeader } from '@/components/ui/Card'
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '@/components/ui/Table'
import { formatCurrency, formatDateTime, humanize } from '@/libs/format'
import type { AdminOrder, Transaction } from '@/features/orders/types'
import { PAYMENT_METHOD_LABELS } from './orderDetail'

type OrderPaymentCardProps = {
  order: AdminOrder
  transactions?: Transaction[]

  /** The settled transaction a refund would apply to, if the order has one. */
  refundable?: Transaction
  onRefund: (transactionId: string) => void
}

/** Payment summary from the newest attempt, with every attempt listed below
 *  once there is more than one. */
const OrderPaymentCard = ({ order, transactions, refundable, onRefund }: OrderPaymentCardProps) => {
  const latest = transactions?.[0]

  return (
    <Card className='overflow-hidden'>
      <CardHeader
        title='Payment'
        icon='tabler-credit-card'
        action={
          refundable ? (
            <Button
              size='sm'
              variant='outlined'
              color='error'
              startIcon={<i className='tabler-receipt-refund' />}
              onClick={() => onRefund(refundable.id)}
            >
              Refund payment
            </Button>
          ) : undefined
        }
      />
      <CardBody>
        <dl className='grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4'>
          <Fact label='Method'>{PAYMENT_METHOD_LABELS[order.paymentMethod] ?? humanize(order.paymentMethod)}</Fact>
          <Fact label='Status'>
            <StatusChip value={order.paymentStatus} dot />
          </Fact>
          <Fact label='Amount'>
            <span className='tabular-nums'>
              {latest ? formatCurrency(latest.amount, latest.currency) : formatCurrency(order.total, order.currency)}
            </span>
          </Fact>
          <Fact label='Reference'>
            {latest?.providerReference ? (
              <span className='font-mono text-xs'>{latest.providerReference}</span>
            ) : (
              <span className='text-textMuted'>—</span>
            )}
          </Fact>
        </dl>
        {latest?.failureReason && (
          <p className='mt-4 flex items-start gap-2 rounded-md bg-error/8 px-3 py-2 text-sm text-errorDark'>
            <i aria-hidden className='tabler-alert-circle mt-0.5' />
            {latest.failureReason}
          </p>
        )}
      </CardBody>

      {transactions && transactions.length > 1 && (
        <Table aria-label='Payment attempts' containerClassName='border-t border-border'>
          <TableHead>
            <TableRow>
              <TableHeaderCell className='pl-5'>When</TableHeaderCell>
              <TableHeaderCell>Provider</TableHeaderCell>
              <TableHeaderCell align='right'>Amount</TableHeaderCell>
              <TableHeaderCell className='pr-5'>Status</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map(txn => (
              <TableRow key={txn.id}>
                <TableCell className='pl-5 whitespace-nowrap'>{formatDateTime(txn.createdAt)}</TableCell>
                <TableCell>{txn.provider === 'cod' ? 'Cash on delivery' : humanize(txn.provider)}</TableCell>
                <TableCell align='right' className='tabular-nums'>
                  {formatCurrency(txn.amount, txn.currency)}
                </TableCell>
                <TableCell className='pr-5'>
                  <StatusChip value={txn.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Card>
  )
}

export default OrderPaymentCard
