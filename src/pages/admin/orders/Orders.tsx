// src/pages/admin/orders/Orders.tsx
// PRODUCTION-READY — DECEMBER 29, 2025
// Admin orders dashboard: search, filter, pagination, unit display
// Fully responsive, mobile-first, professional design

import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import debounce from 'lodash.debounce';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

import {
  Search,
  Package,
  Clock,
  CheckCircle,
  Truck,
  ChefHat,
  XCircle,
  User,
  Phone,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import { useAdminOrders } from '@/features/orders/hooks/useOrders';
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  UNIT_LABELS,
} from '@/types/order.types';

const STATUS_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  pending: Clock,
  pending_payment: Clock,
  confirmed: CheckCircle,
  preparing: ChefHat,
  out_for_delivery: Truck,
  delivered: Package,
  cancelled: XCircle,
  rejected: XCircle,
};

const ITEMS_PER_PAGE = 20;

export default function AdminOrders() {
  const [searchParams, setSearchParams] = useSearchParams();

  const currentPage = Number(searchParams.get('page')) || 1;
  const currentStatus = searchParams.get('status') || 'all';
  const currentSearch = searchParams.get('q') || '';

  const [searchInput, setSearchInput] = useState(currentSearch);

  // Debounced search update
  useEffect(() => {
    const handler = debounce((value: string) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (value.trim()) {
            next.set('q', value.trim());
          } else {
            next.delete('q');
          }
          next.set('page', '1');
          return next;
        },
        { replace: true }
      );
    }, 500);

    handler(searchInput);
    return () => handler.cancel();
  }, [searchInput, setSearchParams]);

  const { data, isLoading, isFetching } = useAdminOrders({
    status: currentStatus === 'all' ? undefined : currentStatus,
    page: currentPage,
    limit: ITEMS_PER_PAGE,
    search: currentSearch || undefined,
  });

  const orders = data?.orders ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination ? Math.ceil(pagination.total / pagination.limit) : 0;

  const handleStatusChange = (value: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value === 'all') next.delete('status');
      else next.set('status', value);
      next.set('page', '1');
      return next;
    });
  };

  const handlePageChange = (page: number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('page', String(page));
      return next;
    });
  };

  return (
    <main className="container mx-auto px-4 py-6 md:py-10 max-w-7xl">
      {/* Header */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-4">
            <Package className="h-10 w-10 text-primary" />
            All Orders
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            {pagination ? `${pagination.total.toLocaleString()} total orders` : 'Loading orders...'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search by ID, name, phone..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-11 h-12 text-base"
            />
          </div>

          <Select value={currentStatus} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-full sm:w-64 h-12">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="pending_payment">Awaiting Payment</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="preparing">Preparing</SelectItem>
              <SelectItem value="out_for_delivery">On the Way</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </header>

      <Card className="shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl">Orders List</CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          {(isLoading || isFetching) && !orders.length ? (
            <div className="space-y-4 p-6">
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-lg" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="py-20 text-center">
              <Package className="mx-auto h-20 w-20 text-muted-foreground/40 mb-6" />
              <p className="text-xl font-medium text-muted-foreground">No orders found</p>
              {(currentSearch || currentStatus !== 'all') && (
                <p className="mt-3 text-base text-muted-foreground">Try adjusting your filters</p>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-32">Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Placed</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => {
                      const StatusIcon = STATUS_ICONS[order.status] || Clock;
                      const customerName =
                        order.guestInfo?.name || order.customer?.name || 'Guest';
                      const customerPhone =
                        order.guestInfo?.phone || order.customer?.phone || '—';
                      const amount = order.finalAmount || 0;
                      const shortId = order.shortId || `#${order._id.slice(-8).toUpperCase()}`;

                      return (
                        <TableRow key={order._id} className="hover:bg-muted/30 transition-colors">
                          <TableCell className="font-bold">
                            <Link
                              to={`/admin/orders/${order._id}`}
                              className="text-primary hover:underline"
                            >
                              {shortId}
                            </Link>
                          </TableCell>

                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 opacity-70" />
                                <span className="font-medium">{customerName}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Phone className="h-4 w-4 opacity-70" />
                                {customerPhone}
                              </div>
                            </div>
                          </TableCell>

                          <TableCell>
                            <Badge
                              className={`${ORDER_STATUS_COLORS[order.status]} text-white font-medium px-3 py-1`}
                            >
                              <StatusIcon className="mr-2 h-4 w-4" />
                              {ORDER_STATUS_LABELS[order.status]}
                            </Badge>
                          </TableCell>

                          <TableCell>
                            <div className="space-y-2">
                              {order.items.slice(0, 3).map((item, i) => (
                                <div key={i} className="text-sm">
                                  <span className="font-medium">
                                    {item.quantity}x {item.name}
                                  </span>
                                  <Badge variant="outline" className="ml-2 text-xs">
                                    {UNIT_LABELS[item.unit] || item.unit}
                                  </Badge>
                                </div>
                              ))}
                              {order.items.length > 3 && (
                                <p className="text-xs text-muted-foreground">
                                  +{order.items.length - 3} more
                                </p>
                              )}
                            </div>
                          </TableCell>

                          <TableCell className="font-bold text-lg">
                            Rs. {amount.toLocaleString()}
                          </TableCell>

                          <TableCell className="text-sm text-muted-foreground">
                            {format(new Date(order.placedAt), 'dd MMM yyyy')}
                            <br />
                            {format(new Date(order.placedAt), 'HH:mm')}
                          </TableCell>

                          <TableCell className="text-right">
                            <Button variant="secondary" size="sm" asChild>
                              <Link to={`/admin/orders/${order._id}`}>
                                View Details
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t px-6 py-4 bg-muted/20">
                  <p className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
                    {Math.min(currentPage * ITEMS_PER_PAGE, pagination?.total || 0)} of{' '}
                    {pagination?.total} orders
                  </p>

                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage <= 1}
                      onClick={() => handlePageChange(currentPage - 1)}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>

                    <span className="text-sm font-medium">
                      Page {currentPage} of {totalPages}
                    </span>

                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage >= totalPages}
                      onClick={() => handlePageChange(currentPage + 1)}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </main>
  );
}