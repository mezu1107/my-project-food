// src/features/orders/pages/OrderTrackingPage.tsx
// FINAL PRODUCTION — DECEMBER 26, 2025
// Live tracking + Reorder + Review CTA + ZERO TypeScript errors

import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

import {
  CheckCircle,
  Clock,
  ChefHat,
  Truck,
  Package,
  XCircle,
  MapPin,
  Phone,
  RotateCcw,
  Star,
  Loader2,
} from 'lucide-react';

import confetti from 'canvas-confetti';

import { useTrackOrder, useReorder } from '@/features/orders/hooks/useOrders';
import { useOrderSocket } from '@/features/orders/hooks/useOrderSocket';

import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
} from '@/types/order.types';

import SubmitReviewModal from '@/features/reviews/components/SubmitReviewModal';

const STEPS = [
  { status: 'pending', icon: Clock, label: 'Order Received' },
  { status: 'confirmed', icon: CheckCircle, label: 'Confirmed' },
  { status: 'preparing', icon: ChefHat, label: 'Preparing' },
  { status: 'out_for_delivery', icon: Truck, label: 'On the Way' },
  { status: 'delivered', icon: Package, label: 'Delivered' },
] as const;

export default function OrderTrackingPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  const { data: order, isLoading, error } = useTrackOrder(orderId);
  const reorderMutation = useReorder();

  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  // Real-time socket updates
  useOrderSocket(orderId);

  // Confetti celebration on delivery
  useEffect(() => {
    if (order?.status === 'delivered') {
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 },
      });
    }
  }, [order?.status]);

  if (!orderId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-10">
          <XCircle className="h-16 w-16 text-destructive mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-4">Invalid Order Link</h2>
          <Button asChild>
            <Link to="/orders">Go to My Orders</Link>
          </Button>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Skeleton className="h-96 rounded-2xl mb-6" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-10">
          <XCircle className="h-16 w-16 text-destructive mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-4">Order Not Found</h2>
          <Button asChild>
            <Link to="/orders">My Orders</Link>
          </Button>
        </Card>
      </div>
    );
  }

  const currentStepIndex = STEPS.findIndex((s) => s.status === order.status);
  const isTerminal = ['delivered', 'cancelled', 'rejected'].includes(order.status);
  const isDelivered = order.status === 'delivered';
  const isCancelled = ['cancelled', 'rejected'].includes(order.status);
  const shortId = order.shortId || order._id.slice(-6).toUpperCase();

  const handleReorder = async () => {
    try {
      await reorderMutation.mutateAsync(order._id);
      toast.success('Items added back to your cart!');
      setTimeout(() => navigate('/checkout'), 1200);
    } catch {
      // Error toast already handled in hook
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/20 to-background py-8">
      <div className="container mx-auto px-4 max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center">
          <div
            className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-6 shadow-lg ${
              isCancelled
                ? 'bg-red-100'
                : isDelivered
                ? 'bg-green-100'
                : 'bg-rose-100'
            }`}
          >
            {isCancelled ? (
              <XCircle className="h-14 w-14 text-red-600" />
            ) : isDelivered ? (
              <CheckCircle className="h-14 w-14 text-green-600" />
            ) : (
              <CheckCircle className="h-14 w-14 text-rose-600" />
            )}
          </div>

          <h1 className="text-4xl font-bold mb-3">
            {isCancelled
              ? 'Order Cancelled'
              : isDelivered
              ? 'Order Delivered!'
              : 'Order In Progress'}
          </h1>

          <p className="text-xl text-muted-foreground mb-4">
            Order <span className="font-mono font-bold text-rose-600">#{shortId}</span>
          </p>

          <Badge
            className={`text-lg px-6 py-2 ${ORDER_STATUS_COLORS[order.status]} text-white`}
          >
            {ORDER_STATUS_LABELS[order.status]}
          </Badge>
        </div>

        {/* Review CTA — only when delivered and no review yet */}
        {isDelivered && !order.review && (
          <Card className="border-orange-500 bg-orange-50 shadow-lg">
            <CardContent className="p-8 text-center space-y-4">
              <Star className="h-16 w-16 text-orange-600 mx-auto" />
              <h3 className="text-2xl font-bold">How Was Your Order?</h3>
              <p className="text-muted-foreground">
                Your feedback helps us improve and earns you loyalty points!
              </p>
              <Button
                size="lg"
                className="bg-orange-600 hover:bg-orange-700"
                onClick={() => setReviewModalOpen(true)}
              >
                <Star className="mr-2 h-5 w-5" />
                Write a Review
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Progress Timeline */}
        {!isTerminal && (
          <Card className="overflow-hidden shadow-xl">
            <CardHeader>
              <CardTitle>Order Progress</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="relative">
                <div className="flex justify-between items-center">
                  {STEPS.map((step, i) => {
                    const Icon = step.icon;
                    const isActive = i <= currentStepIndex;
                    const isCompleted = i < currentStepIndex;

                    return (
                      <div
                        key={step.status}
                        className="flex-1 flex flex-col items-center relative z-10"
                      >
                        <div
                          className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 ${
                            isCompleted
                              ? 'bg-green-500 text-white'
                              : isActive
                              ? 'bg-rose-600 text-white scale-110 shadow-lg'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          <Icon className="h-8 w-8" />
                        </div>
                        <p
                          className={`text-sm mt-3 font-medium text-center ${
                            isActive || isCompleted ? 'text-foreground' : 'text-muted-foreground'
                          }`}
                        >
                          {step.label}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Progress bar */}
                <div className="absolute top-8 left-0 right-0 h-2 bg-muted -z-10">
                  <div
                    className="h-full bg-rose-600 transition-all duration-700 ease-out rounded-full"
                    style={{
                      width: `${(currentStepIndex / (STEPS.length - 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Order Items + Summary */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div
                  key={item._id || index}
                  className="flex justify-between items-center py-3 border-b last:border-0"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {item.quantity}
                    </div>
                    <div>
                      <p className="font-medium">{item.menuItem.name}</p>
                    </div>
                  </div>
                  <p className="font-medium">
                    Rs. {(item.priceAtOrder * item.quantity).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex justify-between text-lg">
                <span>Subtotal</span>
                <span>Rs. {order.totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-lg">
                <span>Delivery Fee</span>
                <span>Rs. {order.deliveryFee.toLocaleString()}</span>
              </div>
              {order.discountApplied > 0 && (
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Discount</span>
                  <span>-Rs. {order.discountApplied.toLocaleString()}</span>
                </div>
              )}
              {order.walletUsed > 0 && (
                <div className="flex justify-between text-blue-600 font-medium">
                  <span>Wallet Used</span>
                  <span>-Rs. {order.walletUsed.toLocaleString()}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-2xl font-bold">
                <span>Total</span>
                <span className="text-rose-600">
                  Rs. {order.finalAmount.toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Info */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Delivery Address
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-lg">
              {order.addressDetails?.fullAddress ||
                order.address?.fullAddress ||
                'N/A'}
            </p>

            {/* Floor — only exists in addressDetails (guest orders) */}
            {order.addressDetails?.floor && (
              <p className="text-muted-foreground">
                Floor: {order.addressDetails.floor}
              </p>
            )}

            {/* Instructions — prefer order-level, then addressDetails, then address */}
            {(order.instructions ||
              order.addressDetails?.instructions ||
              order.address?.instructions) && (
              <p className="italic text-muted-foreground">
                Note: "
                {order.instructions ||
                  order.addressDetails?.instructions ||
                  order.address?.instructions}
                "
              </p>
            )}

            {/* Rider Info */}
            {order.rider && (
              <>
                <Separator />
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                      <Truck className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-lg">{order.rider.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Your Delivery Partner
                      </p>
                    </div>
                  </div>

                  <Button size="lg" variant="secondary" asChild>
                    <a href={`tel:${order.rider.phone}`}>
                      <Phone className="mr-2 h-5 w-5" />
                      Call Rider
                    </a>
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="grid sm:grid-cols-2 gap-4 pb-12">
          <Button variant="outline" size="lg" asChild>
            <Link to="/orders">My Orders</Link>
          </Button>

          <Button
            size="lg"
            onClick={handleReorder}
            disabled={reorderMutation.isPending}
            className="bg-rose-600 hover:bg-rose-700"
          >
            {reorderMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Reordering...
              </>
            ) : (
              <>
                <RotateCcw className="mr-2 h-5 w-5" />
                Order Again
              </>
            )}
          </Button>
        </div>

        {/* Review Modal */}
        <SubmitReviewModal
          orderId={order._id}
          open={reviewModalOpen}
          onOpenChange={setReviewModalOpen}
        />
      </div>
    </div>
  );
}