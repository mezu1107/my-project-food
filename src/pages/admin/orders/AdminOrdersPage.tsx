// src/features/admin/pages/AdminOrdersPage.tsx
// FINAL PRODUCTION — JANUARY 13, 2026
// Role-aware status dropdown + rider assignment
// Safe no-op guards, strict typing, improved UX

import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

import { useAdminOrders, useUpdateOrderStatus, useAssignRider } from '@/features/orders/hooks/useOrders';
import { useAvailableRidersForAssignment } from '@/features/riders/hooks/useAdminRiders';
import { useAuthStore } from '@/features/auth/store/authStore';

import {
  ORDER_STATUS_COLORS,
  ORDER_STATUS_LABELS,
  type OrderStatus,
} from '@/types/order.types';

const ITEMS_PER_PAGE = 20;

export default function AdminOrdersPage() {
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
  const [page, setPage] = useState(1);

  const { user } = useAuthStore();
  const role = user?.role ?? 'unknown';

  const { data, isLoading, isFetching } = useAdminOrders({
    status: statusFilter === 'all' ? undefined : statusFilter,
    page,
    limit: ITEMS_PER_PAGE,
  });

  const { data: riders = [], isLoading: ridersLoading } =
    useAvailableRidersForAssignment();

  const updateStatus = useUpdateOrderStatus();
  const assignRider = useAssignRider();

  const totalOrders = data?.pagination?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalOrders / ITEMS_PER_PAGE));

  // ─────────────────────────────────────────────
  // Role → allowed order statuses
  // ─────────────────────────────────────────────
  const allowedStatuses = useMemo<OrderStatus[]>(() => {
    switch (role) {
      case 'kitchen':
        return ['confirmed', 'preparing'];
      case 'rider':
        return ['out_for_delivery', 'delivered'];
      case 'admin':
      case 'delivery_manager':
      case 'support':
      case 'finance':
        return [
          'confirmed',
          'preparing',
          'out_for_delivery',
          'delivered',
          'rejected',
        ];
      default:
        return ['confirmed', 'preparing'];
    }
  }, [role]);

  const canAssignRider = role === 'admin' || role === 'delivery_manager';

  // ─────────────────────────────────────────────
  // Handlers
  // ─────────────────────────────────────────────
  const handleStatusChange = (
    orderId: string,
    newStatus: OrderStatus,
    currentStatus: OrderStatus
  ) => {
    if (newStatus === currentStatus) return;

    updateStatus.mutate(
      { orderId, status: newStatus },
      {
        onSuccess: () =>
          toast.success(
            `Status updated to ${ORDER_STATUS_LABELS[newStatus]}`
          ),
        onError: (err: any) =>
          toast.error(
            err?.response?.data?.message ??
              `Failed to update order status`,
            { duration: 7000 }
          ),
      }
    );
  };

  const handleAssignRider = (orderId: string, riderId: string) => {
    if (!riderId || riderId === 'none') return;

    assignRider.mutate(
      { orderId, riderId },
      {
        onSuccess: () => toast.success('Rider assigned successfully'),
        onError: (err: any) =>
          toast.error(
            err?.response?.data?.message ??
              'Failed to assign rider'
          ),
      }
    );
  };

  // ─────────────────────────────────────────────
  // UI
  // ─────────────────────────────────────────────
  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="shadow-2xl border-orange-200/50">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-gray-900">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-2xl md:text-3xl font-bold">
              All Orders
            </CardTitle>

            <Select
              value={statusFilter}
              onValueChange={(val) => {
                setStatusFilter(val as any);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-56 h-11 rounded-xl">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {Object.entries(ORDER_STATUS_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          {isLoading || isFetching ? (
            <div className="space-y-6">
              <Skeleton className="h-12 w-full rounded-lg" />
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-xl" />
              ))}
            </div>
          ) : !data?.orders?.length ? (
            <div className="text-center py-20">
              <AlertCircle className="h-16 w-16 text-orange-600 mx-auto mb-6" />
              <h3 className="text-2xl font-bold mb-4">
                No orders found
              </h3>
              <p className="text-muted-foreground">
                {statusFilter === 'all'
                  ? 'No orders in the system yet'
                  : `No orders with status "${ORDER_STATUS_LABELS[statusFilter]}"`}
              </p>
            </div>
          ) : (
            <>
              {/* TABLE */}
              <div className="overflow-x-auto rounded-xl border border-orange-200/50">
                <Table>
                  <TableHeader className="bg-orange-50 dark:bg-orange-950/30">
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Rider</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {data.orders.map((order) => (
                      <TableRow key={order._id}>
                        <TableCell className="font-medium">
                          <Link
                            to={`/admin/orders/${order._id}`}
                            className="hover:text-orange-600 hover:underline"
                          >
                            #{order._id.slice(-6).toUpperCase()}
                          </Link>
                        </TableCell>

                        <TableCell>
                          {order.guestInfo?.name ||
                            order.customer?.name ||
                            'Guest'}
                        </TableCell>

                        <TableCell>
                          <Badge
                            className={`text-white ${
                              ORDER_STATUS_COLORS[order.status]
                            }`}
                          >
                            {ORDER_STATUS_LABELS[order.status]}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          Rs. {order.finalAmount?.toLocaleString('en-PK')}
                        </TableCell>

                        <TableCell>
                          {order.rider ? (
                            <>
                              <div>{order.rider.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {order.rider.phone}
                              </div>
                            </>
                          ) : (
                            <span className="text-muted-foreground">
                              Not assigned
                            </span>
                          )}
                        </TableCell>

                        <TableCell className="text-right space-x-3">
                          {/* STATUS */}
                          <Select
                            value={order.status}
                            disabled={updateStatus.isPending}
                            onValueChange={(val) =>
                              handleStatusChange(
                                order._id,
                                val as OrderStatus,
                                order.status
                              )
                            }
                          >
                            <SelectTrigger className="w-44">
                              <SelectValue />
                              {updateStatus.isPending && (
                                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                              )}
                            </SelectTrigger>
                            <SelectContent>
                              {allowedStatuses.map((st) => (
                                <SelectItem
                                  key={st}
                                  value={st}
                                  disabled={st === order.status}
                                >
                                  {ORDER_STATUS_LABELS[st]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          {/* ASSIGN RIDER */}
                          {canAssignRider && !order.rider && (
                            <Select
                              disabled={
                                assignRider.isPending || ridersLoading
                              }
                              onValueChange={(id) =>
                                handleAssignRider(order._id, id)
                              }
                            >
                              <SelectTrigger className="w-48">
                                <SelectValue
                                  placeholder={
                                    ridersLoading
                                      ? 'Loading riders...'
                                      : riders.length === 0
                                      ? 'No riders available'
                                      : 'Assign rider'
                                  }
                                />
                              </SelectTrigger>
                              <SelectContent>
                                {riders.map((r) => (
                                  <SelectItem
                                    key={r._id}
                                    value={r._id}
                                  >
                                    {r.name} ({r.phone.slice(-10)}){' '}
                                    {r.isOnline ? '🟢' : '⚫'}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* PAGINATION */}
              <div className="flex justify-between items-center mt-8">
                <p className="text-sm text-muted-foreground">
                  Showing {(page - 1) * ITEMS_PER_PAGE + 1}–
                  {Math.min(page * ITEMS_PER_PAGE, totalOrders)} of{' '}
                  {totalOrders}
                </p>

                {totalPages > 1 && (
                  <div className="flex gap-3">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={page === 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      Previous
                    </Button>
                    <span className="text-sm font-medium">
                      Page {page} of {totalPages}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={page === totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
