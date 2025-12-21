// src/features/analytics/components/TopAreasChart.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { TopArea } from '../types/analytics.types';

interface TopAreasChartProps {
  data?: TopArea[];
  loading: boolean;
}

export default function TopAreasChart({ data, loading }: TopAreasChartProps) {
  if (loading || !data) {
    return (
      <Card>
        <CardHeader><CardTitle>Top 10 Delivery Areas</CardTitle></CardHeader>
        <CardContent><Skeleton className="h-80 w-full rounded-lg" /></CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 10 Delivery Areas by Orders</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={360}>
          <BarChart data={data} layout="horizontal" margin={{ top: 20, right: 30, left: 80, bottom: 20 }}>
            <CartesianGrid strokeDasharray="4 4" stroke="#e0e0e0" />
            <XAxis type="number" />
            <YAxis dataKey="area" type="category" width={120} tick={{ fontSize: 12 }} />
            <Tooltip formatter={(value: number) => `${value} orders • PKR ${value.toLocaleString()}`} />
            <Bar dataKey="orders" fill="#6366f1" radius={[0, 8, 8, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}