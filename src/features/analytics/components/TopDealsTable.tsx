// src/features/analytics/components/TopDealsTable.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { TopDeal } from '../types/analytics.types';

interface TopDealsTableProps {
  data?: TopDeal[];
  loading: boolean;
}

export default function TopDealsTable({ data, loading }: TopDealsTableProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader><CardTitle>Top Performing Deals</CardTitle></CardHeader>
        <CardContent><Skeleton className="h-96 w-full rounded-lg" /></CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle>Top Performing Deals</CardTitle></CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-12">
            No deals were applied during this period.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Performing Deals</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Title</TableHead>
                <TableHead className="text-right">Uses</TableHead>
                <TableHead className="text-right">Discount Given</TableHead>
                <TableHead className="text-right">Revenue Generated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((deal) => (
                <TableRow key={deal.code}>
                  <TableCell className="font-medium">{deal.code}</TableCell>
                  <TableCell>{deal.title}</TableCell>
                  <TableCell className="text-right font-semibold">{deal.uses}</TableCell>
                  <TableCell className="text-right text-red-600">
                    -PKR {deal.discountGiven.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right text-green-600">
                    PKR {deal.revenueGenerated.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}