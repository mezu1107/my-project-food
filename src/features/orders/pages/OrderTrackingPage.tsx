// src/features/orders/pages/OrderTrackingPage.tsx
// FINAL PRODUCTION — JANUARY 12, 2026
// Modern, guest-friendly real-time tracking page with animations, confetti, sounds
// Full support: live status, rider location, notification center, reorder & review

import { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

import {
  CheckCircle2,
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
  AlertCircle,
} from 'lucide-react';

import { useTrackOrder, useReorder } from '@/features/orders/hooks/useOrders';
import { useOrderSocket } from '@/features/orders/hooks/useOrderSocket';
import { useGlobalOrderNotifications } from '@/features/orders/hooks/useGlobalOrderNotifications';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useNotificationStore, audioManager } from '@/features/notifications/store/notificationStore';

import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  OrderStatus,
} from '@/types/order.types';

import SubmitReviewModal from '@/features/reviews/components/SubmitReviewModal';

const STEPS = [
  { status: 'pending', icon: Clock, label: 'Received' },
  { status: 'confirmed', icon: CheckCircle2, label: 'Confirmed' },
  { status: 'preparing', icon: ChefHat, label: 'Preparing' },
  { status: 'out_for_delivery', icon: Truck, label: 'On the Way' },
  { status: 'delivered', icon: Package, label: 'Delivered' },
] as const;

const formatPrice = (amount: number | undefined): string =>
  typeof amount === 'number' && !isNaN(amount) ? amount.toLocaleString('en-PK') : '0';

export default function OrderTrackingPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  const { user, isAuthenticated } = useAuthStore();
  const { addNotification } = useNotificationStore();

  const { data: response, isLoading, error } = useTrackOrder(orderId);
  const reorderMutation = useReorder();

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [riderLocation, setRiderLocation] = useState<{ lat: number; lng: number } | null>(null);

  const order = response?.order;
  const shortId = order?.shortId || order?._id?.slice(-6)?.toUpperCase() || '—';

  // Real-time socket + global notifications
  useOrderSocket(orderId);
  useGlobalOrderNotifications();

  // Confetti on delivery + sound
  useEffect(() => {
    if (order?.status === 'delivered') {
      audioManager.play('delivered', { volume: 0.8 });
      confetti({
        particleCount: 180,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#f97316', '#fb923c', '#fdba74', '#fed7aa', '#fef3c7'],
      });
    }
  }, [order?.status]);

  const handleReorder = async () => {
    if (!orderId) return;
    try {
      await reorderMutation.mutateAsync(orderId);
      toast.success('Items added back to cart!', {
        description: 'Head to cart to place the order again.',
      });
      setTimeout(() => navigate('/cart'), 1200);
    } catch {
      // Error already handled in hook
    }
  };

  // Invalid order ID
  if (!orderId) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-red-50/30 to-background px-4 py-12">
        <Card className="w-full max-w-lg text-center p-10 shadow-2xl border-red-200">
          <XCircle className="h-20 w-20 text-red-600 mx-auto mb-6" />
          <h2 className="text-4xl font-bold text-red-700 mb-4">Invalid Tracking Link</h2>
          <p className="text-lg text-muted-foreground mb-8">
            The link you followed seems to be broken or expired.
          </p>
          <Button size="lg" className="h-14 px-10 text-lg" asChild>
            <Link to={isAuthenticated ? '/orders' : '/'}>Go Back</Link>
          </Button>
        </Card>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="container mx-auto px-4 py-8 md:py-12 max-w-5xl">
        <div className="space-y-10">
          <Skeleton className="h-40 rounded-3xl" />
          <Skeleton className="h-96 rounded-3xl" />
          <Skeleton className="h-80 rounded-3xl" />
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-amber-50/30 to-background px-4 py-12">
        <Card className="w-full max-w-lg text-center p-10 shadow-2xl border-amber-200">
          <AlertCircle className="h-20 w-20 text-amber-600 mx-auto mb-6" />
          <h2 className="text-4xl font-bold text-amber-800 mb-4">Order Not Found</h2>
          <p className="text-lg text-muted-foreground mb-8">
            This order doesn't exist or the tracking link is no longer valid.
          </p>
          <Button size="lg" className="h-14 px-10 text-lg" asChild>
            <Link to={isAuthenticated ? '/orders' : '/'}>Go Back</Link>
          </Button>
        </Card>
      </main>
    );
  }

  const currentStepIndex = STEPS.findIndex((s) => s.status === order.status);
  const isTerminal = ['delivered', 'cancelled', 'rejected'].includes(order.status);
  const isDelivered = order.status === 'delivered';
  const isCancelled = ['cancelled', 'rejected'].includes(order.status);
  const canReview = isDelivered && !order.review && isAuthenticated;

  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50/20 to-background py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-5xl space-y-12">
        {/* Header Section */}
        <header className="text-center space-y-6">
          <div
            className={`inline-flex items-center justify-center w-28 h-28 rounded-full mb-4 shadow-2xl transform transition-all duration-700 ${
              isCancelled ? 'bg-red-100 rotate-12' : isDelivered ? 'bg-green-100 scale-110' : 'bg-orange-100'
            }`}
          >
            {isCancelled ? (
              <XCircle className="h-16 w-16 text-red-600" />
            ) : isDelivered ? (
              <CheckCircle2 className="h-16 w-16 text-green-600" />
            ) : (
              <Clock className="h-16 w-16 text-orange-600" />
            )}
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
            {isCancelled
              ? 'Order Cancelled'
              : isDelivered
              ? 'Delivered Successfully!'
              : 'Order In Progress'}
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground">
            Order <span className="font-mono font-bold text-orange-700">#{shortId}</span>
          </p>

          <Badge
            variant="outline"
            className={`text-lg px-8 py-3 font-semibold ${ORDER_STATUS_COLORS[order.status as OrderStatus]} border-2`}
          >
            {ORDER_STATUS_LABELS[order.status as OrderStatus] || 'Processing'}
          </Badge>
        </header>

        {/* Review Prompt (Delivered + Logged In) */}
        {canReview && (
          <Card className="border-2 border-orange-500 bg-gradient-to-br from-orange-50 to-amber-50 shadow-2xl">
            <CardContent className="p-10 text-center space-y-6">
              <Star className="h-24 w-24 text-orange-600 mx-auto animate-pulse" />
              <h3 className="text-4xl font-bold text-orange-800">How Was Your Food?</h3>
              <p className="text-xl text-orange-700/80 max-w-2xl mx-auto">
                Your feedback helps us serve you better and earns you loyalty points!
              </p>
              <Button
                size="lg"
                className="h-16 px-12 text-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 shadow-xl"
                onClick={() => setReviewModalOpen(true)}
              >
                <Star className="mr-4 h-7 w-7" />
                Write a Review
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Guest Review Prompt */}
        {isDelivered && !isAuthenticated && (
          <Card className="border-dashed border-2 border-orange-300 bg-orange-50/40">
            <CardContent className="p-10 text-center space-y-6">
              <LogIn className="h-20 w-20 text-orange-600 mx-auto" />
              <h3 className="text-3xl font-bold text-orange-800">Loved Your Meal?</h3>
              <p className="text-xl text-orange-700/80">
                Log in to leave a review and earn loyalty points next time!
              </p>
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-10 text-lg border-orange-500 text-orange-700 hover:bg-orange-50"
                asChild
              >
                <Link to="/login">Login to Review</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Live Progress Timeline (only when not terminal) */}
        {!isTerminal && (
          <Card className="overflow-hidden shadow-2xl border-orange-200/50">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-gray-900">
              <CardTitle className="text-3xl text-center">Live Progress</CardTitle>
            </CardHeader>
            <CardContent className="p-8 md:p-12">
              <div className="relative">
                {/* Connecting Line */}
                <div className="absolute top-10 left-0 right-0 h-4 bg-orange-100 dark:bg-orange-950 rounded-full -z-10" />

                {/* Progress Fill */}
                <div
                  className="absolute top-10 left-0 h-4 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: `${(currentStepIndex / (STEPS.length - 1)) * 100}%`,
                  }}
                />

                <div className="grid grid-cols-5 gap-4 md:gap-6">
                  {STEPS.map((step, i) => {
                    const Icon = step.icon;
                    const isActive = i <= currentStepIndex;
                    const isCompleted = i < currentStepIndex;

                    return (
                      <div key={step.status} className="flex flex-col items-center relative">
                        <div
                          className={`w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center shadow-xl transition-all duration-700 ${
                            isCompleted
                              ? 'bg-green-500 text-white scale-105'
                              : isActive
                              ? 'bg-orange-600 text-white scale-125 ring-8 ring-orange-300/50 animate-pulse'
                              : 'bg-gray-200 text-gray-500 dark:bg-gray-800'
                          }`}
                        >
                          <Icon className="h-10 w-10 md:h-12 md:w-12" />
                        </div>
                        <p
                          className={`mt-4 text-sm md:text-base font-medium text-center ${
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
            </CardContent>
          </Card>
        )}

        {/* Order Summary */}
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



        {/* Delivery & Rider Info */}
        <Card className="shadow-2xl">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-gray-900">
            <CardTitle className="text-3xl flex items-center gap-4">
              <MapPin className="h-10 w-10 text-orange-600" />
              Delivery Details
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-8 space-y-10">
            <div className="bg-muted/40 p-6 md:p-8 rounded-2xl border border-orange-200/50">
              <p className="text-xl leading-relaxed">
                {order.addressDetails?.fullAddress || 'Address not available'}
              </p>
              {order.addressDetails?.floor && (
                <p className="mt-4 text-lg text-muted-foreground">
                  <strong>Floor/Unit:</strong> {order.addressDetails.floor}
                </p>
              )}
              {(order.instructions || order.addressDetails?.instructions) && (
                <div className="mt-6 p-5 bg-orange-50/50 rounded-xl border border-orange-200">
                  <strong className="block mb-2 text-lg">Special Instructions:</strong>
                  <p className="text-lg italic text-orange-900">
                    {order.instructions || order.addressDetails?.instructions}
                  </p>
                </div>
              )}
            </div>

            {order.rider && (
              <>
                <Separator className="my-12" />
                <div className="flex flex-col md:flex-row items-center justify-between gap-10">
                  <div className="flex items-center gap-8">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-xl">
                      <Truck className="h-14 w-14 text-white" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold">{order.rider.name}</p>
                      <p className="text-xl text-muted-foreground mt-2">Your Delivery Partner</p>
                    </div>
                  </div>

                  <Button
                    size="lg"
                    className="h-16 px-12 text-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    asChild
                  >
                    <a href={`tel:${order.rider.phone}`}>
                      <Phone className="mr-4 h-7 w-7" />
                      Call Rider
                    </a>
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Bottom Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-20">
          <Button
            variant="outline"
            size="lg"
            className="h-16 text-xl border-orange-500 text-orange-700 hover:bg-orange-50"
            asChild
          >
            <Link to={isAuthenticated ? '/orders' : '/'}>Back to Orders</Link>
          </Button>

          <Button
            size="lg"
            disabled={reorderMutation.isPending || isCancelled}
            onClick={handleReorder}
            className="h-16 text-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 shadow-xl"
          >
            {reorderMutation.isPending ? (
              <>
                <Loader2 className="mr-4 h-7 w-7 animate-spin" />
                Adding to Cart...
              </>
            ) : (
              <>
                <RotateCcw className="mr-4 h-7 w-7" />
                Order Again
              </>
            )}
          </Button>
        </div>

        {/* Hidden Review Modal */}
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