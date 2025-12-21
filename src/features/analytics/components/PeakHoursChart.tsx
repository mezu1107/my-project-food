// src/features/analytics/components/PeakHoursChart.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { PeakHour } from '../types/analytics.types';

interface PeakHoursChartProps {
  data?: PeakHour[];
  loading: boolean;
}

export default function PeakHoursChart({ data, loading }: PeakHoursChartProps) {
  if (loading || !data) {
    return (
      <Card>
        <CardHeader><CardTitle>Peak Order Hours</CardTitle></CardHeader>
        <CardContent><Skeleton className="h-80 w-full rounded-lg" /></CardContent>
      </Card>
    );
  }

  const sortedData = [...data].sort((a, b) => a.hour - b.hour);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Peak Order Hours (Top 8)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={360}>
          <BarChart data={sortedData} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
            <CartesianGrid strokeDasharray="4 4" stroke="#e0e0e0" />
            <XAxis dataKey="label" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="orders" fill="#f97316" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}