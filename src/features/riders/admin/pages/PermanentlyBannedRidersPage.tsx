// src/features/riders/admin/pages/PermanentlyBannedRidersPage.tsx
// RESPONSIVE PRODUCTION VERSION — JANUARY 14, 2026
// Read-only list of permanently banned riders — mobile/tablet/desktop optimized

import { useState } from 'react';
import { format } from 'date-fns';
import { AlertTriangle, RefreshCw } from 'lucide-react';

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

import { usePermanentlyBannedRiders } from '../../hooks/useAdminRiders';
import type { AdminRider } from '../../types/adminRider.types';

export default function PermanentlyBannedRidersPage() {
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, isFetching, refetch } = usePermanentlyBannedRiders(page, limit);

  const riders = data?.riders ?? [];
  const pagination = data?.pagination;

  return (
    <div className="min-h-screen space-y-6 pb-12 px-4 py-6 md:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Permanently Banned Riders
          </h1>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">
            Irreversible bans — accounts permanently removed from the system
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
          Refresh
        </Button>
      </div>

      <Card className="overflow-hidden border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">
            Permanently Banned ({pagination?.total ?? 0})
          </CardTitle>
          <CardDescription className="text-sm">
            These riders can no longer use the platform or re-apply
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0 sm:p-6">
          {isLoading ? (
            <div className="space-y-4 px-4 py-6 sm:px-0">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 py-3">
                  <Skeleton className="h-10 w-48" />
                  <Skeleton className="h-10 w-32" />
                  <Skeleton className="h-10 w-80 flex-1" />
                  <Skeleton className="h-10 w-44" />
                </div>
              ))}
            </div>
          ) : riders.length === 0 ? (
            <div className="px-4 py-16 text-center text-muted-foreground sm:py-24">
              <AlertTriangle className="mx-auto h-10 w-10 sm:h-12 sm:w-12 mb-4 opacity-60" />
              <h3 className="text-lg font-medium sm:text-xl">
                No permanently banned riders
              </h3>
              <p className="mt-2 text-sm sm:text-base">
                No irreversible bans have been issued yet.
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
                      <TableHead className="min-w-[160px]">Banned At</TableHead>
                      <TableHead className="min-w-[300px]">Reason</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {riders.map((rider: AdminRider) => (
                      <TableRow key={rider._id} className="hover:bg-muted/50">
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
                          {rider.bannedAt
                            ? format(new Date(rider.bannedAt), 'dd MMM yyyy • HH:mm')
                            : '—'}
                        </TableCell>
                        <TableCell>
                          <p className="text-sm line-clamp-3">
                            {rider.banReason || 'No detailed reason recorded'}
                          </p>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
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