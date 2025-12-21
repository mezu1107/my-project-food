// src/features/analytics/components/PaymentMethodsChart.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { PaymentMethod } from '../types/analytics.types';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

interface PaymentMethodsChartProps {
  data?: PaymentMethod[];
  loading: boolean;
}

export default function PaymentMethodsChart({ data, loading }: PaymentMethodsChartProps) {
  if (loading || !data || data.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle>Payment Methods Breakdown</CardTitle></CardHeader>
        <CardContent><Skeleton className="h-80 w-full rounded-lg" /></CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Methods Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={360}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={120}
              paddingAngle={3}
              dataKey="orders"
              nameKey="method"
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, name: string, props: any) => [
                `${value} orders (${props.payload.percentage})`,
                `PKR ${props.payload.revenue.toLocaleString()} revenue`
              ]}
            />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}