// src/features/orders/pages/OrderSuccessPage.tsx
import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Clock, MapPin, Truck, ChefHat, Package, XCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useOrder } from '@/features/orders/hooks/useOrders';
import { useOrderSocket } from '@/features/orders/hooks/useOrderSocket';
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  type Order,
} from '@/types/order.types';
import { Skeleton } from '@/components/ui/skeleton';

const STEPS = [
  { status: 'pending', icon: Clock, label: 'Received' },
  { status: 'confirmed', icon: CheckCircle, label: 'Confirmed' },
  { status: 'preparing', icon: ChefHat, label: 'Preparing' },
  { status: 'out_for_delivery', icon: Truck, label: 'On the Way' },
  { status: 'delivered', icon: Package, label: 'Delivered' },
] as const;

export default function OrderSuccessPage() {
  const { orderId } = useParams<{ orderId: string }>();

  if (!orderId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-8">
          <XCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-3">Invalid Order</h2>
          <p className="text-muted-foreground mb-6">
            No order ID provided in the URL.
          </p>
          <Button asChild>
            <Link to="/orders">View Orders</Link>
          </Button>
        </Card>
      </div>
    );
  }

  // Fetch order using custom hook
  const { data: order, isLoading } = useOrder(orderId);

  // Subscribe to real-time updates
  useOrderSocket(orderId);

  // Trigger confetti on delivery
  useEffect(() => {
    if (order?.status === 'delivered') {
      confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });
    }
  }, [order?.status]);

  if (isLoading) {
    return <Skeleton className="h-96 w-full mx-auto mt-8 rounded-xl" />;
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-8">
          <XCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-3">Order Not Found</h2>
          <p className="text-muted-foreground mb-6">
            We couldn't find this order. It may have been removed or the link is invalid.
          </p>
          <Button asChild>
            <Link to="/orders">View Orders</Link>
          </Button>
        </Card>
      </div>
    );
  }

  const currentStep = STEPS.findIndex((s) => s.status === order.status);
  const isCancelled = ['cancelled', 'rejected'].includes(order.status);

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container mx-auto px-4 max-w-2xl space-y-6">

        {/* Header */}
        <div className="text-center py-8">
          <div
            className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
              isCancelled
                ? 'bg-red-100'
                : order.status === 'delivered'
                ? 'bg-green-100'
                : 'bg-primary/10'
            }`}
          >
            {isCancelled ? (
              <XCircle className="h-12 w-12 text-red-600" />
            ) : order.status === 'delivered' ? (
              <CheckCircle className="h-12 w-12 text-green-600" />
            ) : (
              <CheckCircle className="h-12 w-12 text-primary" />
            )}
          </div>
          <h1 className="text-3xl font-bold">
            {isCancelled
              ? 'Order Cancelled'
              : order.status === 'delivered'
              ? 'Delivered!'
              : 'Order Confirmed!'}
          </h1>
          <p className="text-muted-foreground mt-2">#{order._id.slice(-6).toUpperCase()}</p>
          <Badge className={`mt-4 text-lg px-4 py-1 ${ORDER_STATUS_COLORS[order.status]}`}>
            {ORDER_STATUS_LABELS[order.status]}
          </Badge>
        </div>

        {/* Progress Steps */}
        {!isCancelled && (
          <Card>
            <CardContent className="p-8">
              <div className="relative">
                <div className="flex justify-between">
                  {STEPS.map((step, i) => {
                    const Icon = step.icon;
                    const active = i <= currentStep;
                    return (
                      <div key={step.status} className="flex flex-col items-center">
                        <div
                          className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold ${
                            active ? 'bg-primary' : 'bg-muted'
                          }`}
                        >
                          <Icon className="h-7 w-7" />
                        </div>
                        <p
                          className={`text-xs mt-2 ${
                            active ? 'font-medium' : 'text-muted-foreground'
                          }`}
                        >
                          {step.label}
                        </p>
                      </div>
                    );
                  })}
                </div>
                <div className="absolute top-7 left-0 right-0 h-1 bg-muted -z-10">
                  <div
                    className="h-full bg-primary transition-all duration-500"
                    style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
                  />
                </div>
              </div>
              {order.estimatedDelivery && currentStep < STEPS.length - 1 && (
                <p className="text-center mt-6 text-sm">
                  Estimated Delivery: <strong>{order.estimatedDelivery}</strong>
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Items Summary */}
        <Card>
          <CardContent className="p-6 space-y-6">
            <div>
              <h3 className="font-bold mb-3">Order Items</h3>
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between py-2">
                  <span>
                    {item.quantity} × {item.menuItem.name}
                  </span>
                  <span>Rs. {item.priceAtOrder * item.quantity}</span>
                </div>
              ))}
            </div>
            <Separator />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>Rs. {order.totalAmount}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>Rs. {order.deliveryFee}</span>
              </div>
              {order.discountApplied > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-Rs. {order.discountApplied}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg pt-3 border-t">
                <span>Total Paid</span>
                <span>Rs. {order.finalAmount}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Address */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex gap-3">
              <MapPin className="h-5 w-5 text-primary mt-1" />
              <div>
                <p className="font-medium">Delivery Address</p>
                <p className="text-sm text-muted-foreground">
                  {order.addressDetails?.fullAddress || 'Not available'}
                </p>
              </div>
            </div>

            {/* Rider Info */}
            {order.rider && (
              <>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Truck className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-medium">{order.rider.name}</p>
                      <p className="text-sm text-muted-foreground">Your Rider</p>
                    </div>
                  </div>
                  <Button size="sm" asChild>
                    <a href={`tel:${order.rider.phone}`}>Call Rider</a>
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button asChild variant="outline" className="flex-1">
            <Link to="/orders">View All Orders</Link>
          </Button>
          <Button asChild className="flex-1">
            <Link to="/menu">Order Again</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
