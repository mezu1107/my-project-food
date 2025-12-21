// src/features/analytics/components/DailyTrendChart.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { DailyTrend } from '../types/analytics.types';

interface DailyTrendChartProps {
  data?: DailyTrend[];
  loading: boolean;
}

export default function DailyTrendChart({ data, loading }: DailyTrendChartProps) {
  if (loading || !data) {
    return (
      <Card>
        <CardHeader><CardTitle>Daily Orders & Revenue Trend</CardTitle></CardHeader>
        <CardContent><Skeleton className="h-80 w-full rounded-lg" /></CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Orders & Revenue Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={360}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="4 4" stroke="#e0e0e0" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis yAxisId="left" tick={{ fontSize: 12 }} label={{ value: 'Orders', angle: -90, position: 'insideLeft' }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} label={{ value: 'Revenue (PKR)', angle: 90, position: 'insideRight' }} />
            <Tooltip
              formatter={(value: number, name: string) =>
                name === 'Revenue' ? `PKR ${value.toLocaleString()}` : value
              }
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="orders"
              stroke="#6366f1"
              name="Orders"
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="revenue"
              stroke="#10b981"
              name="Revenue"
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}