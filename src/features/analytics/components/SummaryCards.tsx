// src/features/analytics/components/SummaryCards.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Users, ShoppingCart, DollarSign, Percent } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface SummaryCardsProps {
  data?: any;
  period?: any;
  loading: boolean;
}

export default function SummaryCards({ data, period, loading }: SummaryCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i}>
            <CardHeader><Skeleton className="h-6 w-32" /></CardHeader>
            <CardContent><Skeleton className="h-10 w-24" /></CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const growthColor = (value: string) => value.startsWith('+') ? 'text-green-600' : 'text-red-600';
  const growthIcon = (value: string) => value.startsWith('+') ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />;

  return (
    <>
      <div className="text-sm text-muted-foreground mb-4">
        Period: <strong>{period?.label.toUpperCase()}</strong> ({period?.start} → {period?.end})
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.totalOrders?.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              {growthIcon(data?.ordersGrowth)}
              <span className={growthColor(data?.ordersGrowth)}>{data?.ordersGrowth}</span> from previous
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">PKR {data?.totalRevenue?.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              {growthIcon(data?.revenueGrowth)}
              <span className={growthColor(data?.revenueGrowth)}>{data?.revenueGrowth}</span> from previous
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">PKR {data?.avgOrderValue?.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Per successful order</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cancellation Rate</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{data?.cancellationRate}</div>
            <p className="text-xs text-muted-foreground">{data?.cancelledOrders} cancelled</p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}