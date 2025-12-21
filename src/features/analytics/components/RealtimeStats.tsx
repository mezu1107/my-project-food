// src/features/analytics/components/RealtimeStats.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Clock, Package, Truck } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

interface RealtimeStatsProps {
  data?: any;
  loading: boolean;
  large?: boolean;
}

export default function RealtimeStats({ data, loading, large = false }: RealtimeStatsProps) {
  if (loading) {
    return large ? (
      <Card className="col-span-2">
        <CardHeader><Skeleton className="h-8 w-48" /></CardHeader>
        <CardContent className="grid grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
        </CardContent>
      </Card>
    ) : (
      <Card>
        <CardHeader><Skeleton className="h-6 w-32" /></CardHeader>
        <CardContent><Skeleton className="h-32 w-full" /></CardContent>
      </Card>
    );
  }

  const live = data?.live || {};
  const active = data?.activeOrders || 0;

  return (
    <Card className={large ? 'col-span-2' : ''}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Live Dashboard</CardTitle>
          <Badge variant="outline" className="flex items-center gap-1">
            <Activity className="h-3 w-3 animate-pulse text-green-500" />
            Updated {format(new Date(data?.updatedAt), 'HH:mm:ss')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className={large ? 'grid grid-cols-2 lg:grid-cols-4 gap-6' : 'grid grid-cols-2 gap-4'}>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Today's Orders</p>
            <p className="text-3xl font-bold">{data?.today.orders}</p>
            <p className="text-sm text-green-600">{data?.today.growth} vs yesterday</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Today's Revenue</p>
            <p className="text-3xl font-bold">PKR {data?.today.revenue.toLocaleString()}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Truck className="h-4 w-4" /> Active Orders
            </p>
            <p className="text-3xl font-bold text-blue-600">{active}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Package className="h-4 w-4" /> Pending / Confirmed
            </p>
            <p className="text-2xl font-bold">{live.pending + live.confirmed}</p>
          </div>
          {large && (
            <>
              <div className="space-y-2"><p className="text-sm text-muted-foreground">Preparing</p><p className="text-2xl font-bold text-orange-600">{live.preparing}</p></div>
              <div className="space-y-2"><p className="text-sm text-muted-foreground">Out for Delivery</p><p className="text-2xl font-bold text-indigo-600">{live.outForDelivery}</p></div>
              <div className="space-y-2"><p className="text-sm text-muted-foreground">Pending Payment</p><p className="text-2xl font-bold text-yellow-600">{live.pendingPayment}</p></div>
              <div className="space-y-2"><p className="text-sm text-muted-foreground">Cancelled Today</p><p className="text-2xl font-bold text-red-600">{live.cancelledToday}</p></div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}