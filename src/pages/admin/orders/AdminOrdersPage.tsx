// src/features/admin/pages/AdminOrdersPage.tsx
// PRODUCTION-READY — January 09, 2026
// Admin orders list with status filter, rider assignment, status update

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
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { useAdminOrders } from '@/features/orders/hooks/useOrders';
import { useUpdateOrderStatus, useAssignRider } from '@/features/orders/hooks/useOrders';
import { useAvailableRidersForAssignment } from '@/features/riders/hooks/useAdminRiders';

import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/types/order.types';

const ITEMS_PER_PAGE = 20;

export default function AdminOrdersPage() {
  const [filters, setFilters] = useState<{ status: string }>({ status: 'all' });
  const [page, setPage] = useState(1);

  // Fetch orders with status filter & pagination
  const { data, isLoading, isFetching } = useAdminOrders({
    status: filters.status === 'all' ? undefined : filters.status,
    page,
    limit: ITEMS_PER_PAGE,
  });

  // Fetch available riders for assignment
  const { data: riders = [], isLoading: ridersLoading, isError: ridersError } =
    useAvailableRidersForAssignment();

  const updateStatus = useUpdateOrderStatus();
  const assignRider = useAssignRider();

  const totalPages = data?.pagination?.total
    ? Math.ceil(data.pagination.total / ITEMS_PER_PAGE)
    : 1;

  const handleStatusChange = (orderId: string, newStatus: string) => {
    updateStatus.mutate(
      { orderId, status: newStatus as any },
      {
        onSuccess: () => toast.success('Status updated successfully'),
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
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-2xl">All Orders</CardTitle>

            {/* Status Filter */}
            <Select
              value={filters.status}
              onValueChange={(val) => {
                setFilters({ status: val });
                setPage(1);
              }}
            >
              <SelectTrigger className="w-64">
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

        <CardContent>
          {(isLoading || isFetching) ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin" />
            </div>
          ) : data?.orders.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              No orders found.
            </div>
          ) : (
            <>
              {/* Orders Table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Rider</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.orders.map((order) => (
                    <TableRow key={order._id}>
                      <TableCell className="font-medium">
                        #{order._id.slice(-6).toUpperCase()}
                      </TableCell>

                      <TableCell>
                        {order.guestInfo?.name || order.customer?.name || 'Guest'}
                      </TableCell>

                      <TableCell>
                        <Badge className={ORDER_STATUS_COLORS[order.status]}>
                          {ORDER_STATUS_LABELS[order.status]}
                        </Badge>
                      </TableCell>

                      <TableCell>Rs. {order.finalAmount.toLocaleString()}</TableCell>

                      <TableCell>
                        {order.rider
                          ? `${order.rider.name} (${order.rider.phone})`
                          : 'Not assigned'}
                      </TableCell>

                      <TableCell className="flex flex-col sm:flex-row gap-2">
                        {/* Status Update */}
                        <Select
                          disabled={updateStatus.isPending}
                          value={order.status} // pre-set current status
                          onValueChange={(val) => handleStatusChange(order._id, val)}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Change Status" />
                          </SelectTrigger>
                          <SelectContent>
                            {['confirmed', 'preparing', 'out_for_delivery', 'delivered', 'rejected'].map(
                              (st) => (
                                <SelectItem
                                  key={st}
                                  value={st}
                                  disabled={order.status === st}
                                >
                                  {ORDER_STATUS_LABELS[st as keyof typeof ORDER_STATUS_LABELS]}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>

                        {/* Assign Rider */}
                        {!order.rider && (
                          <Select
                            disabled={assignRider.isPending || ridersLoading || ridersError}
                            onValueChange={(riderId) => handleAssignRider(order._id, riderId)}
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue
                                placeholder={
                                  ridersLoading
                                    ? 'Loading riders...'
                                    : ridersError
                                    ? 'Error loading riders'
                                    : riders.length === 0
                                    ? 'No riders available'
                                    : 'Assign Rider'
                                }
                              />
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}

              {/* Results Info */}
              <div className="mt-4 text-center text-sm text-muted-foreground">
                Showing {(page - 1) * ITEMS_PER_PAGE + 1} to{' '}
                {Math.min(page * ITEMS_PER_PAGE, data.pagination?.total || 0)} of{' '}
                {data.pagination?.total || 0} orders
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
