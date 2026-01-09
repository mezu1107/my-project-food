// src/features/orders/pages/OrderTrackingPage.tsx
// PRODUCTION-READY — JANUARY 09, 2026
// REVIEW CTA: Only shown to authenticated users (via Zustand auth store)

import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
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
  LogIn,
} from 'lucide-react';

import { useTrackOrder, useReorder } from '@/features/orders/hooks/useOrders';
import { useOrderSocket } from '@/features/orders/hooks/useOrderSocket';
import { useAuthStore } from '@/features/auth/store/authStore'; // ← Correct import

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

const formatPrice = (amount: number | undefined): string => {
  if (typeof amount !== 'number' || isNaN(amount)) return '0';
  return amount.toLocaleString('en-PK');
};

export default function OrderTrackingPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  // Get auth state from Zustand
  const { user, token } = useAuthStore();
  const isAuthenticated = !!user && !!token;

  const { data: response, isLoading, error } = useTrackOrder(orderId);
  const reorderMutation = useReorder();

  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  const order = response?.order;

  // Real-time updates
  useOrderSocket(orderId);

  const handleReorder = async () => {
    if (!orderId) return;
    try {
      await reorderMutation.mutateAsync(orderId);
      toast.success('Items added to cart! 🎉');
      setTimeout(() => navigate('/cart'), 800);
    } catch {
      // Error handled in hook
    }
  };

  if (!orderId) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 py-12 bg-muted/20">
        <Card className="w-full max-w-md text-center p-8 md:p-10">
          <XCircle className="h-16 w-16 text-destructive mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">Invalid Order Link</h2>
          <p className="text-muted-foreground mb-6">The tracking link appears to be broken.</p>
          <Button size="lg" asChild>
            <Link to="/orders">Go to My Orders</Link>
          </Button>
        </Card>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
        <div className="space-y-8">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-96 rounded-2xl" />
          <Skeleton className="h-80 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 py-12 bg-muted/20">
        <Card className="w-full max-w-md text-center p-8 md:p-10">
          <XCircle className="h-16 w-16 text-destructive mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">Order Not Found</h2>
          <p className="text-muted-foreground mb-6">
            We couldn't find this order. It may have been removed or the link is incorrect.
          </p>
          <Button size="lg" asChild>
            <Link to="/orders">My Orders</Link>
          </Button>
        </Card>
      </main>
    );
  }

  const currentStepIndex = STEPS.findIndex((s) => s.status === order.status);
  const isTerminal = ['delivered', 'cancelled', 'rejected'].includes(order.status);
  const isDelivered = order.status === 'delivered';
  const isCancelled = ['cancelled', 'rejected'].includes(order.status);
  const shortId = order.shortId || order._id.slice(-6).toUpperCase();

  // User can review only if: order delivered + no review yet + user is logged in
  const canReview = isDelivered && !order.review && isAuthenticated;

  return (
    <main className="min-h-screen bg-gradient-to-b from-muted/20 to-background py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-4xl space-y-10">
        {/* Header */}
        <header className="text-center">
          <div
            className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-8 shadow-2xl ${
              isCancelled ? 'bg-red-100' : isDelivered ? 'bg-green-100' : 'bg-rose-100'
            }`}
          >
            {isCancelled ? (
              <XCircle className="h-14 w-14 text-red-600" />
            ) : isDelivered ? (
              <CheckCircle className="h-14 w-14 text-green-600" />
            ) : (
              <Clock className="h-14 w-14 text-rose-600" />
            )}
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            {isCancelled
              ? 'Order Cancelled'
              : isDelivered
              ? 'Order Delivered!'
              : 'Order In Progress'}
          </h1>

          <p className="text-xl text-muted-foreground mb-6">
            Order <span className="font-mono font-bold text-rose-600">#{shortId}</span>
          </p>

          <Badge
            className={`text-lg px-8 py-3 ${ORDER_STATUS_COLORS[order.status]} text-white font-medium`}
          >
            {ORDER_STATUS_LABELS[order.status]}
          </Badge>
        </header>

        {/* Review CTA — Only for logged-in users */}
        {canReview && (
          <Card className="border-2 border-orange-500 bg-orange-50/80 shadow-2xl">
            <CardContent className="p-8 text-center space-y-6">
              <Star className="h-20 w-20 text-orange-600 mx-auto" />
              <h3 className="text-3xl font-bold">How Was Your Experience?</h3>
              <p className="text-lg text-muted-foreground max-w-md mx-auto">
                Share your feedback to help us improve and earn loyalty points!
              </p>
              <Button
                size="lg"
                className="h-14 px-8 text-lg bg-orange-600 hover:bg-orange-700"
                onClick={() => setReviewModalOpen(true)}
              >
                <Star className="mr-3 h-6 w-6" />
                Write a Review
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Message for guests on delivered orders */}
        {isDelivered && !isAuthenticated && (
          <Card className="border border-dashed border-muted-foreground/50 bg-muted/30">
            <CardContent className="p-8 text-center space-y-4">
              <LogIn className="h-12 w-12 text-muted-foreground mx-auto" />
              <p className="text-lg text-muted-foreground">
                Want to leave a review?{' '}
                <Link to="/login" className="font-semibold text-rose-600 hover:underline">
                  Log in
                </Link>{' '}
                to your account.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Progress Timeline */}
        {!isTerminal && (
          <Card className="overflow-hidden shadow-2xl">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Order Progress</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="relative">
                <div className="grid grid-cols-5 gap-6">
                  {STEPS.map((step, i) => {
                    const Icon = step.icon;
                    const isActive = i <= currentStepIndex;
                    const isCompleted = i < currentStepIndex;

                    return (
                      <div key={step.status} className="flex flex-col items-center">
                        <div
                          className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-700 shadow-lg ${
                            isCompleted
                              ? 'bg-green-500 text-white'
                              : isActive
                              ? 'bg-rose-600 text-white scale-125'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          <Icon className="h-8 w-8" />
                        </div>
                        <p
                          className={`mt-4 text-sm font-medium text-center ${
                            isActive || isCompleted ? 'text-foreground' : 'text-muted-foreground'
                          }`}
                        >
                          {step.label}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="absolute top-8 left-0 right-0 h-3 bg-muted -z-10 rounded-full">
                  <div
                    className="h-full bg-gradient-to-r from-rose-600 to-rose-500 transition-all duration-1000 ease-out rounded-full"
                    style={{
                      width: `${(currentStepIndex / (STEPS.length - 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Order Items & Summary */}
        <Card className="shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl">Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-6">
              {order.items.map((item, index) => (
                <div
                  key={item._id || index}
                  className="flex justify-between items-center py-4 border-b last:border-0"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600 font-bold text-lg">
                      {item.quantity}
                    </div>
                    <div>
                      <p className="font-semibold text-lg">
                        {item.menuItem?.name || item.name || 'Item Unavailable'}
                      </p>
                      {item.addOns?.length > 0 && (
                        <p className="text-sm text-muted-foreground mt-1">
                          + {item.addOns.map((a) => a.name).join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="font-semibold text-lg">
                    Rs. {formatPrice((item.priceAtOrder ?? 0) * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            <Separator />

            <div className="space-y-4 text-lg">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>Rs. {formatPrice(order.totals?.totalAmount ?? 0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>Rs. {formatPrice(order.totals?.deliveryFee ?? 0)}</span>
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
              <Separator className="my-6" />
              <div className="flex justify-between text-3xl font-bold">
                <span>Total Paid</span>
                <span className="text-rose-600">
                  Rs. {formatPrice(order.totals?.finalAmount ?? 0)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Info */}
        <Card className="shadow-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <MapPin className="h-7 w-7" />
              Delivery Address
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-lg leading-relaxed bg-muted/30 p-5 rounded-xl">
              {order.addressDetails?.fullAddress ||
                order.address?.fullAddress ||
                'Address not available'}
            </div>

            {order.addressDetails?.floor && (
              <p className="text-muted-foreground">
                <strong>Floor/Unit:</strong> {order.addressDetails.floor}
              </p>
            )}

            {(order.instructions ||
              order.addressDetails?.instructions ||
              order.address?.instructions) && (
              <div className="italic text-muted-foreground bg-amber-50 p-4 rounded-lg border border-amber-200">
                <strong>Note:</strong>{' '}
                {order.instructions ||
                  order.addressDetails?.instructions ||
                  order.address?.instructions}
              </div>
            )}

            {order.rider && (
              <>
                <Separator className="my-8" />
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-8">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-full bg-rose-100 flex items-center justify-center shadow-lg">
                      <Truck className="h-12 w-12 text-rose-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{order.rider.name}</p>
                      <p className="text-muted-foreground text-lg">Your Delivery Partner</p>
                    </div>
                  </div>

                  <Button size="lg" variant="secondary" asChild className="h-14 px-8 text-lg">
                    <a href={`tel:${order.rider.phone}`}>
                      <Phone className="mr-3 h-6 w-6" />
                      Call Rider
                    </a>
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-12">
          <Button variant="outline" size="lg" asChild className="h-14 text-lg">
            <Link to="/orders">My Orders</Link>
          </Button>

          <Button
            size="lg"
            onClick={handleReorder}
            disabled={reorderMutation.isPending || isCancelled}
            className="h-14 text-lg bg-rose-600 hover:bg-rose-700"
          >
            {reorderMutation.isPending ? (
              <>
                <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                Adding to Cart...
              </>
            ) : (
              <>
                <RotateCcw className="mr-3 h-6 w-6" />
                Order Again
              </>
            )}
          </Button>
        </div>

        {/* Review Modal — Only mount when user is authenticated */}
        {isAuthenticated && (
          <SubmitReviewModal
            orderId={order._id}
            open={reviewModalOpen}
            onOpenChange={setReviewModalOpen}
          />
        )}
      </div>
    </main>
  );
}