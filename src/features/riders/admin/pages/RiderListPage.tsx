// src/features/riders/admin/pages/RiderListPage.tsx
// RESPONSIVE PRODUCTION VERSION — JANUARY 14, 2026
// Added explicit "View Details" link/button in Actions column

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import {
  Search,
  RefreshCw,
  UserPlus,
  AlertTriangle,
  Ban,
  Clock,
  Eye,           // ← new icon for "View Details"
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
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

import {
  useAdminRiders,
  useRiderStats,
  useApproveRider,
  useRejectRider,
  useBlockRider,
  useUnblockRider,
  usePermanentlyBanRider,
  useSoftDeleteRider,
  useRestoreRider,
} from '../../hooks/useAdminRiders';

import { RiderStatusBadge } from '../components/RiderStatusBadge';
import { RiderActionDropdown } from '../components/RiderActionDropdown';
import { RiderStatsCards } from '../components/RiderStatsCards';

export default function RiderListPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [page, setPage] = useState(1);
  const limit = 15;

  const {
    data: response,
    isLoading,
    isFetching,
    refetch,
  } = useAdminRiders({
    search: search.trim() || undefined,
    status: statusFilter,
    page,
    limit,
  });

  const { data: stats, isLoading: statsLoading } = useRiderStats();

  const approve = useApproveRider();
  const reject = useRejectRider();
  const block = useBlockRider();
  const unblock = useUnblockRider();
  const ban = usePermanentlyBanRider();
  const softDelete = useSoftDeleteRider();
  const restore = useRestoreRider();

  const riders = response?.riders ?? [];
  const pagination = response?.pagination;

  const isAnyActionLoading =
    approve.isPending ||
    reject.isPending ||
    block.isPending ||
    unblock.isPending ||
    ban.isPending ||
    softDelete.isPending ||
    restore.isPending;

  return (
    <div className="min-h-screen space-y-6 pb-12 md:space-y-8 lg:space-y-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Riders Management
          </h1>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">
            Approve, monitor, moderate and assign riders
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
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
          <Button asChild size="sm" className="w-full sm:w-auto">
            <Link to="/admin/riders/promote">
              <UserPlus className="mr-2 h-4 w-4" />
              Promote to Rider
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <RiderStatsCards stats={stats} isLoading={statsLoading} />

      {/* Main Table Card */}
      <Card className="overflow-hidden border-border">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-xl">All Riders</CardTitle>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <div className="relative w-full sm:min-w-[300px] md:min-w-[380px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search name, phone, CNIC, vehicle..."
                  className="h-10 w-full pl-9"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                />
              </div>

              <div className="w-full sm:w-auto">
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value as typeof statusFilter);
                    setPage(1);
                  }}
                  className="block w-full sm:w-auto border border-input bg-background text-sm rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="all">All</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 sm:p-6">
          {isLoading ? (
            <div className="space-y-4 px-4 py-6 sm:px-0">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 py-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-6 w-24" />
                </div>
              ))}
            </div>
          ) : riders.length === 0 ? (
            <div className="px-4 py-16 text-center text-muted-foreground sm:py-24">
              <AlertTriangle className="mx-auto h-10 w-10 sm:h-12 sm:w-12 mb-4 opacity-60" />
              <h3 className="text-lg font-medium sm:text-xl">No riders found</h3>
              <p className="mt-2 text-sm sm:text-base">
                {search || statusFilter !== 'all'
                  ? 'Try adjusting your search or filter'
                  : 'No riders registered yet'}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12 min-w-[3rem] sticky left-0 bg-background z-10">
                        Status
                      </TableHead>
                      <TableHead className="min-w-[180px]">Rider</TableHead>
                      <TableHead className="min-w-[140px]">Phone</TableHead>
                      <TableHead className="min-w-[100px]">Deliveries</TableHead>
                      <TableHead className="min-w-[100px]">Rating</TableHead>
                      <TableHead className="min-w-[140px]">Joined</TableHead>
                      <TableHead className="text-right min-w-[160px] pr-4 sm:pr-6">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {riders.map((rider) => (
                      <TableRow
                        key={rider._id}
                        className="hover:bg-muted/50 transition-colors"
                      >
                        <TableCell className="sticky left-0 bg-background z-10">
                          <RiderStatusBadge status={rider.riderStatus} size="sm" />
                        </TableCell>

                        <TableCell>
                          <div className="font-medium">
                            <Link
                              to={`/admin/riders/${rider._id}`}
                              className="hover:underline text-primary transition-colors"
                              title={`View full profile of ${rider.name}`}
                            >
                              {rider.name}
                            </Link>
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {rider._id.slice(-8).toUpperCase()}
                          </div>
                        </TableCell>

                        <TableCell className="font-mono text-sm">
                          {rider.phone}
                        </TableCell>
                        <TableCell>{rider.totalDeliveries ?? 0}</TableCell>
                        <TableCell>{rider.rating.toFixed(1)} ★</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(rider.createdAt), 'dd MMM yyyy')}
                        </TableCell>

                        <TableCell className="text-right flex items-center justify-end gap-2">
                          {/* New explicit View Details button */}
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3 sm:min-w-[90px]"
                            asChild
                          >
                            <Link to={`/admin/riders/${rider._id}`}>
                              <Eye className="h-4 w-4 sm:mr-1.5" />
                              <span className="hidden sm:inline">Details</span>
                            </Link>
                          </Button>

                          {/* Existing dropdown with all moderation actions */}
                          <RiderActionDropdown
                            rider={rider}
                            onApprove={() => approve.mutate(rider._id)}
                            onReject={() => {
                              const reason = prompt(
                                `Rejection reason for ${rider.name} (min 10 chars):`
                              )?.trim();
                              if (reason && reason.length >= 10) {
                                reject.mutate({ id: rider._id, reason });
                              } else if (reason) {
                                toast.error('Reason must be at least 10 characters');
                              }
                            }}
                            onBlock={() => {
                              const reason = prompt(
                                `Block reason for ${rider.name} (min 5 chars):`
                              )?.trim();
                              if (reason && reason.length >= 5) {
                                block.mutate({ id: rider._id, reason });
                              }
                            }}
                            onUnblock={() => unblock.mutate(rider._id)}
                            onPermanentBan={() => {
                              const reason = prompt(
                                `Permanent ban reason for ${rider.name} (min 10 chars):`
                              )?.trim();
                              if (reason && reason.length >= 10) {
                                ban.mutate({ id: rider._id, reason });
                              }
                            }}
                            onSoftDelete={() => softDelete.mutate(rider._id)}
                            onRestore={() => restore.mutate(rider._id)}
                            disabled={isAnyActionLoading}
                          />
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

      {/* Quick Links */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Button
          variant="outline"
          className="h-auto min-h-[100px] p-6 text-left hover:bg-accent/50 transition-colors"
          asChild
        >
          <Link to="/admin/riders/blocked">
            <div className="flex items-start gap-4">
              <Ban className="mt-1 h-6 w-6 text-red-500 flex-shrink-0" />
              <div>
                <div className="font-semibold">Blocked Riders</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Temporarily suspended accounts
                </div>
              </div>
            </div>
          </Link>
        </Button>

        <Button
          variant="outline"
          className="h-auto min-h-[100px] p-6 text-left hover:bg-accent/50 transition-colors"
          asChild
        >
          <Link to="/admin/riders/permanently-banned">
            <div className="flex items-start gap-4">
              <AlertTriangle className="mt-1 h-6 w-6 text-red-600 flex-shrink-0" />
              <div>
                <div className="font-semibold">Permanently Banned</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Irreversible bans
                </div>
              </div>
            </div>
          </Link>
        </Button>

        <Button
          variant="outline"
          className="h-auto min-h-[100px] p-6 text-left hover:bg-accent/50 transition-colors"
          asChild
        >
          <Link to="/admin/riders/assign">
            <div className="flex items-start gap-4">
              <Clock className="mt-1 h-6 w-6 flex-shrink-0" />
              <div>
                <div className="font-semibold">Force Assign Orders</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Manually assign to riders
                </div>
              </div>
            </div>
          </Link>
        </Button>
      </div>
    </div>
  );
}