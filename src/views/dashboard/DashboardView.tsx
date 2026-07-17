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
import Breadcrumbs from '@/components/shared/Breadcrumbs'
import StatCard from '@/components/shared/StatCard'
import StatusChip from '@/components/shared/StatusChip'
import { useDashboard } from '@/features/dashboard/hooks/useDashboard'
import { ORDER_STATUSES } from '@/features/orders/types'
import { formatCurrency, formatDate } from '@/libs/format'

const KpiSkeleton = () => (
  <Card>
    <CardContent className='flex items-center gap-4'>
      <Skeleton variant='rounded' width={44} height={44} />
      <div className='flex flex-col gap-1'>
        <Skeleton variant='text' width={80} height={28} />
        <Skeleton variant='text' width={100} />
      </div>
    </CardContent>
  </Card>
)

const DashboardView = () => {
  const { data, isLoading, isError, error } = useDashboard()

  if (isError) {
    return (
      <>
        <Breadcrumbs />
        <PageHeader title='Dashboard' />
        <Alert severity='error'>{(error as Error)?.message || 'Failed to load dashboard data.'}</Alert>
      </>
    )
  }

  const revenue = data?.revenue
  const ordersByStatus = data?.orders?.byStatus

  return (
    <>
      <Breadcrumbs />
      <PageHeader title='Dashboard' subtitle='Store performance at a glance' />

      <Grid container spacing={6}>
        {isLoading || !data ? (
          [...Array(4)].map((_, i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
              <KpiSkeleton />
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
              <StatCard title='Customers' value={data.customers ?? 0} icon='tabler-users' color='warning' />
            </Grid>
          </>
        )}

        {/* Orders by status */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card className='bs-full'>
            <CardHeader title='Orders by Status' />
            <CardContent className='flex flex-col gap-4'>
              {isLoading || !data
                ? ORDER_STATUSES.map(status => (
                    <div key={status} className='flex items-center justify-between'>
                      <Skeleton variant='rounded' width={90} height={24} />
                      <Skeleton variant='text' width={30} />
                    </div>
                  ))
                : ORDER_STATUSES.map(status => (
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
              {isLoading || !data ? (
                <List disablePadding>
                  {[...Array(3)].map((_, i) => (
                    <ListItem key={i} disableGutters>
                      <ListItemAvatar>
                        <Skeleton variant='rounded' width={40} height={40} />
                      </ListItemAvatar>
                      <ListItemText
                        primary={<Skeleton variant='text' width='60%' />}
                        secondary={<Skeleton variant='text' width='30%' />}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : data.topProducts?.length ? (
                <List disablePadding>
                  {data.topProducts.map((product, index) => (
                    <ListItem
                      key={index}
                      disableGutters
                      secondaryAction={<Typography variant='subtitle2'>{formatCurrency(product.revenue)}</Typography>}
                    >
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
              {isLoading || !data ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className='flex flex-wrap items-center justify-between gap-2 plb-3'>
                    <Skeleton variant='text' width={120} />
                    <Skeleton variant='text' width={80} />
                  </div>
                ))
              ) : data.recentOrders?.length ? (
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
