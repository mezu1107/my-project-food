// src/features/riders/admin/pages/ForceAssignRiderPage.tsx
// RESPONSIVE PRODUCTION VERSION — JANUARY 14, 2026
// Critical assignment tool — fully mobile/tablet/desktop friendly

import { useState } from 'react';
import { Search, RefreshCw, Truck, AlertTriangle, Loader2 } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

import {
  useAvailableRidersForAssignment,
  useAdminAssignRider,
} from '../../hooks/useAdminRiders';
import type { AdminRider } from '../../types/adminRider.types';

export default function ForceAssignRiderPage() {
  const [orderId, setOrderId] = useState('');
  const [areaFilter, setAreaFilter] = useState('');

  const {
    data: riders = [],
    isLoading,
    isFetching,
    refetch,
  } = useAvailableRidersForAssignment({
    area: areaFilter.trim() || undefined,
  });

  const assignMutation = useAdminAssignRider();

  const handleAssign = (riderId: string, riderName: string) => {
    if (!orderId.trim()) {
      toast.error('Please enter a valid Order ID first');
      return;
    }

    if (!confirm(`Assign order ${orderId.trim()} to ${riderName}?`)) {
      return;
    }

    assignMutation.mutate(
      { orderId: orderId.trim(), riderId },
      {
        onSuccess: (data) => {
          if (data.forcedAvailable) {
            toast.warning(
              `${riderName} was forced online for this assignment`,
              { duration: 6000 }
            );
          } else {
            toast.success(`Order assigned to ${riderName}`);
          }
        },
        onError: () => {
          toast.error('Failed to assign rider');
        },
      }
    );
  };

  return (
    <div className="min-h-screen space-y-6 pb-12 px-4 py-6 md:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Force Assign Rider
          </h1>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">
            Manually assign an order to any currently available rider
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="w-full sm:w-auto"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh Available Riders
        </Button>
      </div>

      <Card className="overflow-hidden border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">Assign Order to Rider</CardTitle>
          <CardDescription className="text-sm">
            Only approved, active, non-blocked, currently available riders appear here.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 p-4 sm:p-6">
          {/* Inputs - stack on mobile */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:max-w-3xl">
            <div className="flex-1 space-y-2">
              <label htmlFor="orderId" className="text-sm font-medium block">
                Order ID <span className="text-red-500">*</span>
              </label>
              <Input
                id="orderId"
                placeholder="Enter full order ID (e.g. 64a1b2c3d4e5f6a7b8c9d0e1)"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="h-10"
              />
            </div>

            <div className="space-y-2 sm:w-64">
              <label htmlFor="area" className="text-sm font-medium block">
                Area Filter (optional)
              </label>
              <Input
                id="area"
                placeholder="e.g. Rawalpindi, Satellite Town"
                value={areaFilter}
                onChange={(e) => setAreaFilter(e.target.value)}
                className="h-10"
              />
            </div>
          </div>

          {/* Results / Table */}
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 py-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-56" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                  <Skeleton className="h-9 w-28" />
                </div>
              ))}
            </div>
          ) : riders.length === 0 ? (
            <div className="py-16 text-center border rounded-lg bg-muted/30">
              <AlertTriangle className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-amber-500 mb-4" />
              <h3 className="text-lg font-medium sm:text-xl">
                No available riders right now
              </h3>
              <p className="mt-2 text-sm sm:text-base">
                {areaFilter
                  ? `No riders available in area: "${areaFilter}"`
                  : 'All riders are currently busy or offline'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12 min-w-[3rem] sticky left-0 bg-background z-10">
                      Rider
                    </TableHead>
                    <TableHead className="min-w-[140px]">Phone</TableHead>
                    <TableHead className="min-w-[110px]">Rating</TableHead>
                    <TableHead className="min-w-[110px]">Deliveries</TableHead>
                    <TableHead className="min-w-[160px]">Vehicle</TableHead>
                    <TableHead className="text-right min-w-[140px] pr-4 sm:pr-6">
                      Assign
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {riders.map((rider: AdminRider) => {
                    const vehicle = rider.riderDocuments?.vehicleType
                      ? `${rider.riderDocuments.vehicleType}${
                          rider.riderDocuments.vehicleNumber
                            ? ` (${rider.riderDocuments.vehicleNumber})`
                            : ''
                        }`
                      : '—';

                    const isAssigning = assignMutation.variables?.riderId === rider._id;

                    return (
                      <TableRow
                        key={rider._id}
                        className="hover:bg-muted/50 transition-colors"
                      >
                        <TableCell className="sticky left-0 bg-background z-10">
                          <div className="font-medium">{rider.name}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {rider._id.slice(-8).toUpperCase()}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {rider.phone}
                        </TableCell>
                        <TableCell>{rider.rating.toFixed(1)} ★</TableCell>
                        <TableCell>{rider.totalDeliveries ?? 0}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-normal">
                            {vehicle}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            onClick={() => handleAssign(rider._id, rider.name)}
                            disabled={
                              assignMutation.isPending ||
                              !orderId.trim() ||
                              isAssigning
                            }
                            className="min-w-[110px]"
                          >
                            {isAssigning ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Assigning...
                              </>
                            ) : (
                              <>
                                <Truck className="mr-2 h-4 w-4" />
                                Assign
                              </>
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}