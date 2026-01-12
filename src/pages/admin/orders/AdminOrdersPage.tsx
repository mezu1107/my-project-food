// src/features/admin/pages/AdminOrdersPage.tsx
// FINAL PRODUCTION — JANUARY 12, 2026
// Modern admin orders list: filter, rider assignment, status update, real-time feel

import { useState } from 'react';
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
import { Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

import { useAdminOrders } from '@/features/orders/hooks/useOrders';
import { useUpdateOrderStatus, useAssignRider } from '@/features/orders/hooks/useOrders';
import { useAvailableRidersForAssignment } from '@/features/riders/hooks/useAdminRiders';
import { Link } from 'react-router-dom';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/types/order.types';

const ITEMS_PER_PAGE = 20;

export default function AdminOrdersPage() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } = useAdminOrders({
    status: statusFilter === 'all' ? undefined : statusFilter,
    page,
    limit: ITEMS_PER_PAGE,
  });

  const { data: riders = [], isLoading: ridersLoading } = useAvailableRidersForAssignment();

  const updateStatus = useUpdateOrderStatus();
  const assignRider = useAssignRider();

  const totalPages = data?.pagination?.total
    ? Math.ceil(data.pagination.total / ITEMS_PER_PAGE)
    : 1;

  const handleStatusChange = (orderId: string, newStatus: string) => {
    updateStatus.mutate(
      { orderId, status: newStatus as any },
      {
        onSuccess: () => toast.success(`Order status updated to ${ORDER_STATUS_LABELS[newStatus] || newStatus}`),
        onError: () => toast.error('Failed to update status'),
      }
    );
  };

  const handleAssignRider = (orderId: string, riderId: string) => {
    if (!riderId) return;
    assignRider.mutate(
      { orderId, riderId },
      {
        onSuccess: () => toast.success('Rider assigned successfully'),
        onError: () => toast.error('Failed to assign rider'),
      }
    );
  };

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
                setStatusFilter(val);
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
              <h3 className="text-2xl font-bold mb-4">No orders found</h3>
              <p className="text-muted-foreground">
                {statusFilter !== 'all'
                  ? `No orders with status "${ORDER_STATUS_LABELS[statusFilter] || statusFilter}"`
                  : 'No orders in the system yet'}
              </p>
            </div>
          ) : (
            <>
              {/* Responsive Table */}
              <div className="overflow-x-auto rounded-xl border border-orange-200/50">
                <Table>
                  <TableHeader className="bg-orange-50 dark:bg-orange-950/30">
                    <TableRow>
                      <TableHead className="font-semibold">Order ID</TableHead>
                      <TableHead className="font-semibold">Customer</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold">Total</TableHead>
                      <TableHead className="font-semibold">Rider</TableHead>
                      <TableHead className="font-semibold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.orders.map((order) => (
                      <TableRow
                        key={order._id}
                        className="hover:bg-orange-50/50 dark:hover:bg-orange-950/20 transition-colors"
                      >
                        <TableCell className="font-medium">
                          <Link
                            to={`/admin/orders/${order._id}`}
                            className="hover:text-orange-600 hover:underline"
                          >
                            #{order._id.slice(-6).toUpperCase()}
                          </Link>
                        </TableCell>

                        <TableCell className="font-medium">
                          {order.guestInfo?.name || order.customer?.name || 'Guest'}
                        </TableCell>

                        <TableCell>
                          <Badge
                            className={`font-medium ${ORDER_STATUS_COLORS[order.status]} text-white px-4 py-1.5`}
                          >
                            {ORDER_STATUS_LABELS[order.status] || order.status}
                          </Badge>
                        </TableCell>

                        <TableCell className="font-medium">
                          Rs. {order.finalAmount?.toLocaleString('en-PK') ?? '—'}
                        </TableCell>

                        <TableCell>
                          {order.rider ? (
                            <div className="flex flex-col">
                              <span>{order.rider.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {order.rider.phone}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Not assigned</span>
                          )}
                        </TableCell>

                        <TableCell className="text-right space-x-2">
                          {/* Status Dropdown */}
                          <Select
                            disabled={updateStatus.isPending}
                            value={order.status}
                            onValueChange={(val) => handleStatusChange(order._id, val)}
                          >
                            <SelectTrigger className="w-40 inline-flex">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {['confirmed', 'preparing', 'out_for_delivery', 'delivered', 'rejected'].map((st) => (
                                <SelectItem key={st} value={st} disabled={order.status === st}>
                                  {ORDER_STATUS_LABELS[st]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          {/* Rider Assignment */}
                          {!order.rider && (
                            <Select
                              disabled={assignRider.isPending || ridersLoading}
                              onValueChange={(riderId) => handleAssignRider(order._id, riderId)}
                            >
                              <SelectTrigger className="w-44 inline-flex">
                                <SelectValue placeholder={ridersLoading ? 'Loading...' : 'Assign Rider'} />
                              </SelectTrigger>
                              <SelectContent>
                                {riders.map((rider) => (
                                  <SelectItem key={rider._id} value={rider._id}>
                                    {rider.name} ({rider.phone}) {rider.isOnline ? '🟢' : '⚫'}
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

              {/* Pagination & Info */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mt-8">
                <p className="text-sm text-muted-foreground">
                  Showing {(page - 1) * ITEMS_PER_PAGE + 1}–
                  {Math.min(page * ITEMS_PER_PAGE, data.pagination?.total || 0)} of{' '}
                  {data.pagination?.total || 0} orders
                </p>

                {totalPages > 1 && (
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      Previous
                    </Button>
                    <span className="text-sm font-medium">
                      Page {page} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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