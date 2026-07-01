'use client'

// Admin dashboard — KPI cards + recent orders + top products, all from
// GET /admin/dashboard (doc §7.12). Reuses shared StatCard / StatusChip.

import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import Skeleton from '@mui/material/Skeleton'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import ListItemText from '@mui/material/ListItemText'
import Avatar from '@mui/material/Avatar'
import Divider from '@mui/material/Divider'

import PageHeader from '@/components/shared/PageHeader'
import StatCard from '@/components/shared/StatCard'
import StatusChip from '@/components/shared/StatusChip'
import { useDashboard } from '@/features/dashboard/hooks/useDashboard'
import { ORDER_STATUSES } from '@/features/orders/types'
import { formatCurrency, formatDate } from '@/libs/format'

const DashboardView = () => {
  const { data, isLoading, isError, error } = useDashboard()

  if (isError) {
    return (
      <>
        <PageHeader title='Dashboard' />
        <Alert severity='error'>{(error as Error)?.message || 'Failed to load dashboard data.'}</Alert>
      </>
    )
  }

  const revenue = data?.revenue
  const ordersByStatus = data?.ordersByStatus

  return (
    <>
      <PageHeader title='Dashboard' subtitle='Store performance at a glance' />

      <Grid container spacing={6}>
        {isLoading || !data ? (
          [...Array(4)].map((_, i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
              <Skeleton variant='rounded' height={92} />
            </Grid>
          ))
        ) : (
          <>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                title="Today's Revenue"
                value={formatCurrency(revenue?.today)}
                icon='tabler-currency-dirham'
                color='primary'
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                title='This Week'
                value={formatCurrency(revenue?.week)}
                icon='tabler-calendar-week'
                color='info'
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                title='This Month'
                value={formatCurrency(revenue?.month)}
                icon='tabler-chart-line'
                color='success'
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                title='Customers'
                value={data.customerCount ?? 0}
                icon='tabler-users'
                color='warning'
                subtitle={`${data.productCount ?? 0} products`}
              />
            </Grid>
          </>
        )}

        {/* Orders by status */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card className='bs-full'>
            <CardHeader title='Orders by Status' />
            <CardContent className='flex flex-col gap-4'>
              {ORDER_STATUSES.map(status => (
                <div key={status} className='flex items-center justify-between'>
                  <StatusChip value={status} />
                  <Typography variant='h6'>{ordersByStatus?.[status] ?? 0}</Typography>
                </div>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Top products */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card className='bs-full'>
            <CardHeader title='Top Products' />
            <CardContent>
              {data?.topProducts?.length ? (
                <List disablePadding>
                  {data.topProducts.map(product => (
                    <ListItem key={product.productId} disableGutters secondaryAction={
                      <Typography variant='subtitle2'>{formatCurrency(product.revenue)}</Typography>
                    }>
                      <ListItemAvatar>
                        <Avatar variant='rounded' src={product.image} />
                      </ListItemAvatar>
                      <ListItemText primary={product.name} secondary={`${product.unitsSold} sold`} />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography color='text.secondary'>No sales data yet.</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent orders */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardHeader title='Recent Orders' />
            <CardContent>
              {data?.recentOrders?.length ? (
                data.recentOrders.map((order, idx) => (
                  <div key={order.id}>
                    <div className='flex flex-wrap items-center justify-between gap-2 plb-3'>
                      <div className='flex flex-col'>
                        <Typography variant='subtitle2'>{order.reference}</Typography>
                        <Typography variant='caption' color='text.secondary'>
                          {order.shippingAddress?.fullName} · {formatDate(order.placedAt)}
                        </Typography>
                      </div>
                      <div className='flex items-center gap-4'>
                        <StatusChip value={order.status} />
                        <Typography variant='subtitle2'>{formatCurrency(order.total, order.currency)}</Typography>
                      </div>
                    </div>
                    {idx < data.recentOrders.length - 1 && <Divider />}
                  </div>
                ))
              ) : (
                <Typography color='text.secondary'>No recent orders.</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  )
}

export default DashboardView
