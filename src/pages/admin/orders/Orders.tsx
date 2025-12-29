// src/pages/admin/orders/Orders.tsx
import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import debounce from 'lodash.debounce'; // or use your own debounce

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
} from 'lucide-react';

import { useAdminOrders } from '@/features/orders/hooks/useOrders';
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
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

  // Read filters from URL (great for sharing & back/forward)
  const currentPage = Number(searchParams.get('page')) || 1;
  const currentStatus = searchParams.get('status') || 'all';
  const currentSearch = searchParams.get('q') || '';

  // Local input state + debounced URL update
  const [searchInput, setSearchInput] = useState(currentSearch);

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
          next.set('page', '1'); // reset pagination on search
          return next;
        },
        { replace: true }
      );
    }, 450);

    handler(searchInput);
    return () => handler.cancel();
  }, [searchInput, setSearchParams]);

  const { data, isLoading, isFetching } = useAdminOrders({
    status: currentStatus === 'all' ? undefined : currentStatus,
    page: currentPage,
    limit: ITEMS_PER_PAGE,
    search: currentSearch || undefined, // ← this is the key change
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

  return (
    <main className="container mx-auto px-4 py-6 md:py-10 max-w-7xl">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Package className="h-9 w-9 text-primary" />
            All Orders
          </h1>
          <p className="text-muted-foreground mt-1.5">
            {pagination ? `${pagination.total.toLocaleString()} orders` : 'Loading...'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search ID, name, phone..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10 h-10"
            />
          </div>

          <Select value={currentStatus} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-full sm:w-56 h-10">
              <SelectValue placeholder="Filter by status" />
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

      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Orders</CardTitle>
        </CardHeader>

        <CardContent>
          {(isLoading || isFetching) && !orders.length ? (
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              <Package className="mx-auto h-16 w-16 mb-4 opacity-40" />
              <p className="text-lg font-medium">No orders found</p>
              {(currentSearch || currentStatus !== 'all') && (
                <p className="mt-2 text-sm">Try changing the filters</p>
              )}
            </div>
          ) : (
            <>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-28">Order</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Placed</TableHead>
                      <TableHead className="text-right pr-6">Actions</TableHead>
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

                      return (
                        <TableRow key={order._id} className="hover:bg-muted/50">
                          <TableCell className="font-medium">
                            <Link
                              to={`/admin/orders/${order._id}`}
                              className="text-primary hover:underline"
                            >
                              #{order.shortId || order._id.slice(-8).toUpperCase()}
                            </Link>
                          </TableCell>

                          <TableCell>
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5">
                                <User className="h-3.5 w-3.5 opacity-70" />
                                <span className="font-medium">{customerName}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Phone className="h-3.5 w-3.5 opacity-70" />
                                {customerPhone}
                              </div>
                            </div>
                          </TableCell>

                          <TableCell>
                            <Badge
                              className={`${
                                ORDER_STATUS_COLORS[order.status] || 'bg-gray-500'
                              } text-white`}
                            >
                              <StatusIcon className="mr-1.5 h-3.5 w-3.5" />
                              {ORDER_STATUS_LABELS[order.status] || order.status}
                            </Badge>
                          </TableCell>

                          <TableCell>{order.items?.length || 0}</TableCell>

                          <TableCell className="font-medium">
                            Rs. {amount.toLocaleString()}
                          </TableCell>

                          <TableCell className="text-sm text-muted-foreground">
                            {order.placedAt
                              ? format(new Date(order.placedAt), 'dd MMM • HH:mm')
                              : '—'}
                          </TableCell>

                          <TableCell className="text-right pr-6">
                            <Button variant="ghost" size="sm" asChild>
                              <Link to={`/admin/orders/${order._id}`}>Details</Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {totalPages > 1 && (
                <div className="flex flex-wrap justify-center items-center gap-4 mt-8">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage <= 1}
                    onClick={() =>
                      setSearchParams((p) => {
                        p.set('page', String(currentPage - 1));
                        return p;
                      })
                    }
                  >
                    Previous
                  </Button>

                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= totalPages}
                    onClick={() =>
                      setSearchParams((p) => {
                        p.set('page', String(currentPage + 1));
                        return p;
                      })
                    }
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </main>
  );
}