// src/features/riders/components/OrderHistoryList.tsx
'use client';

import { format } from 'date-fns';
import { Package, MapPin, DollarSign, Clock, CheckCircle2, XCircle } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

import { useRiderOrders } from '../hooks/useRiders';
import type { RiderOrder } from '../types/rider.types';

export default function OrderHistoryList() {
  const { data: orders = [], isLoading } = useRiderOrders();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <OrderHistorySkeleton key={i} />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="py-16 text-center text-muted-foreground">
        <Package className="mx-auto h-12 w-12 opacity-40 mb-4" />
        <h3 className="text-lg font-medium">No orders yet</h3>
        <p className="mt-2">Orders you've delivered will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <OrderHistoryItem key={order._id} order={order} />
      ))}
    </div>
  );
}

function OrderHistoryItem({ order }: { order: RiderOrder }) {
  const isDelivered = order.status === 'delivered';
  const deliveredDate = order.deliveredAt ? new Date(order.deliveredAt) : null;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="p-5 border-b">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium">Order #{order._id.slice(-6)}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {format(new Date(order.placedAt), 'dd MMM yyyy • hh:mm a')}
              </p>
            </div>

            <div className="flex flex-col items-end gap-2">
              {isDelivered ? (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                  Delivered
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <XCircle className="h-3.5 w-3.5 mr-1" />
                  {formatStatus(order.status)}
                </Badge>
              )}

              {deliveredDate && (
                <span className="text-xs text-muted-foreground">
                  {format(deliveredDate, 'dd MMM • hh:mm a')}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Customer & Address */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Customer</span>
              </div>
              <p className="text-sm">{order.customer.name}</p>
              <p className="text-xs text-muted-foreground">{order.customer.phone}</p>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Area</span>
              </div>
              <p className="text-sm">{order.area.name}</p>
            </div>
          </div>

          {/* Amount & Status */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <span className="font-bold text-lg">
                PKR {order.finalAmount.toLocaleString()}
              </span>
            </div>

            <Badge variant="outline" className="text-sm">
              {order.items.length} item{order.items.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function OrderHistorySkeleton() {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex justify-between">
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>

        <div className="mt-6 grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-28" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>

        <div className="mt-6 pt-4 border-t flex justify-between">
          <Skeleton className="h-7 w-28" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}

function formatStatus(status: string): string {
  if (status === 'out_for_delivery') return 'Out for Delivery';
  return status.charAt(0).toUpperCase() + status.slice(1);
}