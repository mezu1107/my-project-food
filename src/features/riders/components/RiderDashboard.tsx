// src/features/riders/components/CurrentOrderCard.tsx
// PRODUCTION-READY — JANUARY 2026
// Live order card for riders: shows current order details, status, items, and rider info
// Uses live tracking via useTrackOrder

import { useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

import {
  CheckCircle2,
  Clock,
  ChefHat,
  Truck,
  Package,
  XCircle,
  MapPin,
  Phone,
} from 'lucide-react';

import { useTrackOrder } from '@/features/orders/hooks/useOrders';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, OrderStatus } from '@/types/order.types';

interface CurrentOrderCardProps {
  orderId: string;
}

const STEPS = [
  { status: 'pending', icon: Clock, label: 'Received' },
  { status: 'confirmed', icon: CheckCircle2, label: 'Confirmed' },
  { status: 'preparing', icon: ChefHat, label: 'Preparing' },
  { status: 'out_for_delivery', icon: Truck, label: 'On the Way' },
  { status: 'delivered', icon: Package, label: 'Delivered' },
] as const;

const formatPrice = (amount: number | undefined) =>
  typeof amount === 'number' && !isNaN(amount) ? amount.toLocaleString('en-PK') : '0';

export default function CurrentOrderCard({ orderId }: CurrentOrderCardProps) {
  const { data: response, isLoading, error } = useTrackOrder(orderId);
  const order = response?.order;

  const currentStepIndex = useMemo(
    () => STEPS.findIndex((s) => s.status === order?.status),
    [order?.status]
  );

  const isDelivered = order?.status === 'delivered';
  const isCancelled = order?.status === 'cancelled' || order?.status === 'rejected';

  if (isLoading || !order) {
    return (
      <Card className="w-full shadow-lg p-6">
        <Skeleton className="h-24 rounded-xl mb-6" />
        <Skeleton className="h-12 rounded-lg mb-4" />
        <Skeleton className="h-40 rounded-2xl" />
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full shadow-lg p-6 border-red-200">
        <CardHeader>
          <CardTitle className="text-xl text-red-600">Failed to load order</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            There was a problem fetching this order. Please try again later.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-2xl border-orange-200">
      <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50">
        <CardTitle className="text-2xl flex items-center justify-between">
          Order #{order.shortId || order._id.slice(-6).toUpperCase()}
          <Badge
            className={`text-lg px-4 py-2 font-semibold ${ORDER_STATUS_COLORS[order.status as OrderStatus]}`}
          >
            {ORDER_STATUS_LABELS[order.status as OrderStatus] || 'Processing'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Progress Timeline */}
        <div className="relative mb-6">
          <div className="absolute top-10 left-0 right-0 h-2 bg-orange-100 rounded-full -z-10" />
          <div
            className="absolute top-10 left-0 h-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-700"
            style={{ width: `${(currentStepIndex / (STEPS.length - 1)) * 100}%` }}
          />
          <div className="grid grid-cols-5 gap-4">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              const isActive = i <= currentStepIndex;
              const isCompleted = i < currentStepIndex;

              return (
                <div key={step.status} className="flex flex-col items-center relative">
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center shadow-xl transition-all duration-700 ${
                      isCompleted
                        ? 'bg-green-500 text-white scale-105'
                        : isActive
                        ? 'bg-orange-600 text-white scale-110 ring-4 ring-orange-300/50 animate-pulse'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    <Icon className="h-7 w-7" />
                  </div>
                  <p
                    className={`mt-2 text-sm text-center ${
                      isActive || isCompleted ? 'text-foreground font-semibold' : 'text-muted-foreground'
                    }`}
                  >
                    {step.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Items */}
        <div className="space-y-4">
          {order.items.map((item, idx) => (
            <div key={item._id || idx} className="flex justify-between items-center">
              <div>
                <p className="font-semibold">{item.menuItem?.name || item.name || 'Item Unavailable'}</p>
                {item.addOns?.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    + {item.addOns.map((a) => a.name).join(', ')}
                  </p>
                )}
              </div>
              <p className="font-semibold">Rs. {formatPrice((item.priceAtOrder ?? 0) * item.quantity)}</p>
            </div>
          ))}
        </div>

        <Separator />

        {/* Totals */}
        <div className="space-y-2 text-lg">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>Rs. {formatPrice(order.totals?.totalAmount)}</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery Fee</span>
            <span>Rs. {formatPrice(order.totals?.deliveryFee)}</span>
          </div>
          {order.totals?.discountApplied > 0 && (
            <div className="flex justify-between text-green-600 font-semibold">
              <span>Discount</span>
              <span>-Rs. {formatPrice(order.totals.discountApplied)}</span>
            </div>
          )}
          {order.totals?.walletUsed > 0 && (
            <div className="flex justify-between text-blue-600 font-semibold">
              <span>Wallet Used</span>
              <span>-Rs. {formatPrice(order.totals.walletUsed)}</span>
            </div>
          )}
          <Separator className="my-2" />
          <div className="flex justify-between text-2xl font-bold">
            <span>Total Paid</span>
            <span className="text-rose-600">Rs. {formatPrice(order.totals?.finalAmount)}</span>
          </div>
        </div>

        {/* Rider Info */}
        {order.rider && (
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg">
                <Truck className="h-8 w-8 text-white" />
              </div>
              <div>
                <p className="text-lg font-bold">{order.rider.name}</p>
                <p className="text-sm text-muted-foreground">Delivery Partner</p>
              </div>
            </div>
            <Button
              size="sm"
              className="h-10 px-4 bg-green-600 hover:bg-green-700 text-white"
              asChild
            >
              <a href={`tel:${order.rider.phone}`}>
                <Phone className="mr-2 h-5 w-5" /> Call
              </a>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
