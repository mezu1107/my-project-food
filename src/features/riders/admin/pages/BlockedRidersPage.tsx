// src/features/riders/admin/pages/BlockedRidersPage.tsx
// RESPONSIVE PRODUCTION VERSION — JANUARY 14, 2026
// Mobile/tablet/desktop friendly: stacking, scrollable table, adaptive layout

import { useState } from 'react';
import { format } from 'date-fns';
import { RefreshCw, Unlock, AlertTriangle } from 'lucide-react';

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
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

import { useBlockedRiders, useUnblockRider } from '../../hooks/useAdminRiders';
import type { AdminRider } from '../../types/adminRider.types';

export default function BlockedRidersPage() {
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, isFetching, refetch } = useBlockedRiders(page, limit);
  const unblockMutation = useUnblockRider();

  const riders = data?.riders ?? [];
  const pagination = data?.pagination;

  const handleUnblock = (riderId: string, riderName: string) => {
    if (!confirm(`Unblock rider ${riderName}?`)) return;
    unblockMutation.mutate(riderId, {
      onSuccess: () => {
        toast.success(`Rider ${riderName} has been unblocked`);
      },
      onError: () => {
        toast.error('Failed to unblock rider');
      },
    });
  };

  return (
    <div className="min-h-screen space-y-6 pb-12 px-4 py-6 md:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Blocked Riders
          </h1>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">
            Temporarily suspended accounts — can be unblocked anytime
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
          Refresh List
        </Button>
      </div>

      <Card className="overflow-hidden border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">
            Blocked Riders ({pagination?.total ?? 0})
          </CardTitle>
          <CardDescription className="text-sm">
            These riders cannot accept orders until unblocked
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0 sm:p-6">
          {isLoading ? (
            <div className="space-y-4 px-4 py-6 sm:px-0">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 py-3">
                  <Skeleton className="h-10 w-48" />
                  <Skeleton className="h-10 w-32" />
                  <Skeleton className="h-10 w-64 flex-1" />
                  <Skeleton className="h-9 w-28" />
                </div>
              ))}
            </div>
          ) : riders.length === 0 ? (
            <div className="px-4 py-16 text-center text-muted-foreground sm:py-24">
              <AlertTriangle className="mx-auto h-10 w-10 sm:h-12 sm:w-12 mb-4 opacity-60" />
              <h3 className="text-lg font-medium sm:text-xl">
                No blocked riders currently
              </h3>
              <p className="mt-2 text-sm sm:text-base">
                All riders are in good standing at the moment.
              </p>
            </div>
          ) : (
            <>
              {/* Scrollable table on mobile */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12 min-w-[3rem] sticky left-0 bg-background z-10">
                        Rider
                      </TableHead>
                      <TableHead className="min-w-[140px]">Phone</TableHead>
                      <TableHead className="min-w-[160px]">Blocked At</TableHead>
                      <TableHead className="min-w-[220px]">Reason</TableHead>
                      <TableHead className="text-right min-w-[120px] pr-4 sm:pr-6">
                        Action
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {riders.map((rider: AdminRider) => (
                      <TableRow
                        key={rider._id}
                        className="hover:bg-muted/50 transition-colors"
                      >
                        <TableCell className="sticky left-0 bg-background z-10">
                          <div className="font-medium">{rider.name}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            ID: {rider._id.slice(-8).toUpperCase()}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {rider.phone}
                        </TableCell>
                        <TableCell className="text-sm">
                          {rider.blockedAt
                            ? format(new Date(rider.blockedAt), 'dd MMM yyyy • HH:mm')
                            : '—'}
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <p className="text-sm line-clamp-2">
                            {rider.blockReason || 'No reason provided'}
                          </p>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUnblock(rider._id, rider.name)}
                            disabled={unblockMutation.isPending}
                            className="min-w-[100px]"
                          >
                            <Unlock className="mr-2 h-4 w-4" />
                            Unblock
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination - sticky on mobile */}
              {pagination && pagination.total > limit && (
                <div className="sticky bottom-0 left-0 right-0 bg-background border-t border-border p-4 sm:static sm:p-0 sm:mt-6 sm:border-t-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <p className="text-sm text-muted-foreground text-center sm:text-left">
                      Showing {(page - 1) * limit + 1}–
                      {Math.min(page * limit, pagination.total)} of {pagination.total}
                    </p>
                    <div className="flex justify-center sm:justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page === 1 || isFetching}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        className="min-w-[100px]"
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page >= pagination.pages || isFetching}
                        onClick={() => setPage((p) => p + 1)}
                        className="min-w-[100px]"
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}