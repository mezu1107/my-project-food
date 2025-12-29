// src/features/orders/pages/OrdersPage.tsx
// PRODUCTION-READY — DECEMBER 29, 2025
// Full unit display, enriched add-ons, review CTA, real-time updates
// Fixed: validateDOMNesting warning (Badge inside <p>)
// Responsive, mobile-first, professional design

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

import {
  ShoppingBag,
  Clock,
  Package,
  Search,
  ChevronRight,
  Loader2,
  PackageOpen,
  Star,
} from 'lucide-react';

import { useAuthStore } from '@/features/auth/store/authStore';
import { useMyOrders, useTrackOrdersByPhone } from '@/features/orders/hooks/useOrders';
import { useOrderSocket } from '@/features/orders/hooks/useOrderSocket';

import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  UNIT_LABELS,
  type Order,
} from '@/types/order.types';

import SubmitReviewModal from '@/features/reviews/components/SubmitReviewModal';

// ------------------------------
// Order Card Component
// ------------------------------
const OrderCard: React.FC<{ order: Order }> = ({ order }) => {
  const items = order.items || [];
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const isDeliveredAndNotReviewed = order.status === 'delivered' && !order.review;

  const shortId = order.shortId || `#${order._id.slice(-6).toUpperCase()}`;

  return (
    <>
      <Link to={`/track/${order._id}`} className="block">
        <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer border rounded-2xl overflow-hidden">
          <CardContent className="p-5 sm:p-6 md:p-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
              <div>
                <p className="font-bold text-xl sm:text-2xl md:text-3xl">{shortId}</p>
                <p className="text-sm sm:text-base text-muted-foreground mt-1">
                  {format(new Date(order.placedAt), 'dd MMM yyyy • h:mm a')}
                </p>
              </div>
              <div className="flex flex-col sm:items-end gap-3">
                <Badge
                  className={`text-sm sm:text-base px-5 py-2 ${ORDER_STATUS_COLORS[order.status]} text-white font-medium`}
                >
                  {ORDER_STATUS_LABELS[order.status]}
                </Badge>
                {isDeliveredAndNotReviewed && (
                  <Badge variant="outline" className="border-orange-600 text-orange-600 flex items-center gap-1.5">
                    <Star className="h-4 w-4" /> Review Pending
                  </Badge>
                )}
              </div>
            </div>

            <Separator className="my-5" />

            {/* Items Summary */}
            <div className="space-y-5">
              {items.slice(0, 3).map((item) => (
                <div key={item._id} className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-base shrink-0 mt-1">
                      {item.quantity}x
                    </div>
                    <div className="space-y-2">
                      {/* FIXED: No more <div> inside <p> */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-base md:text-lg">
                          {item.name}
                        </span>
                        <Badge variant="outline" className="text-xs py-0 px-2">
                          {UNIT_LABELS[item.unit] || item.unit}
                        </Badge>
                      </div>

                      {/* Enriched add-ons with units */}
                      {item.addOns?.length > 0 && (
                        <div className="mt-1 space-y-1 text-xs sm:text-sm text-muted-foreground">
                          {item.addOns.map((addon) => (
                            <p key={addon.name} className="flex items-center gap-2">
                              • {addon.name}
                              {addon.unit && (
                                <Badge variant="outline" className="text-xs py-0 px-1.5">
                                  {UNIT_LABELS[addon.unit] || addon.unit}
                                </Badge>
                              )}
                              {addon.price > 0 && <span className="text-primary">+Rs. {addon.price}</span>}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="font-medium text-base md:text-lg shrink-0">
                    Rs. {(item.priceAtOrder * item.quantity).toLocaleString()}
                  </p>
                </div>
              ))}

              {items.length > 3 && (
                <p className="text-center text-sm text-muted-foreground pt-2">
                  +{items.length - 3} more item{items.length - 3 > 1 ? 's' : ''}
                </p>
              )}
            </div>

            <Separator className="my-6" />

            {/* Total & Arrow */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Paid</p>
                <p className="text-2xl sm:text-3xl font-bold text-primary">
                  Rs. {order.finalAmount.toLocaleString()}
                </p>
              </div>
              <ChevronRight className="h-7 w-7 text-muted-foreground" />
            </div>

            {/* Review Button */}
            {isDeliveredAndNotReviewed && (
              <div className="mt-6">
                <Button
                  className="w-full bg-orange-600 hover:bg-orange-700 text-base"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setReviewModalOpen(true);
                  }}
                >
                  <Star className="mr-2 h-5 w-5" />
                  Rate & Review This Order
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </Link>

      <SubmitReviewModal
        orderId={order._id}
        open={reviewModalOpen}
        onOpenChange={setReviewModalOpen}
      />
    </>
  );
};

// ------------------------------
// Guest Tracker Component
// ------------------------------
const GuestTracker: React.FC = () => {
  const [phone, setPhone] = useState('');
  const mutation = useTrackOrdersByPhone();

  const cleanedPhone = phone.replace(/\D/g, '');
  const isValidPhone = /^03\d{9}$/.test(cleanedPhone);

  const handleTrack = () => {
    if (isValidPhone) {
      mutation.mutate({ phone: cleanedPhone });
    }
  };

  return (
    <div className="space-y-8">
      <Card className="max-w-lg mx-auto shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl sm:text-3xl">Track Your Order</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-center text-base text-muted-foreground">
            Enter the phone number used for your order
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="03XXXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
              onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
              maxLength={11}
              className="text-lg"
            />
            <Button
              onClick={handleTrack}
              disabled={!isValidPhone || mutation.isPending}
              size="lg"
              className="w-full sm:w-auto"
            >
              {mutation.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Search className="h-5 w-5 mr-2" />
                  Track Orders
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {mutation.isSuccess && mutation.data.orders.length === 0 && (
        <Card className="max-w-lg mx-auto text-center py-16">
          <PackageOpen className="h-20 w-20 text-muted-foreground/40 mx-auto mb-6" />
          <p className="text-xl text-muted-foreground">No orders found for this number</p>
        </Card>
      )}

      {mutation.isSuccess &&
        mutation.data.orders.map((order: Order) => (
          <OrderCard key={order._id} order={order} />
        ))}
    </div>
  );
};

// ------------------------------
// Main Orders Page
// ------------------------------
const OrdersPage: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const { data: orders = [], isLoading } = useMyOrders();
  useOrderSocket();

  const activeOrders = orders.filter(
    (o) => !['delivered', 'cancelled', 'rejected'].includes(o.status)
  );
  const pastOrders = orders.filter((o) =>
    ['delivered', 'cancelled', 'rejected'].includes(o.status)
  );

  // Guest View
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-muted/20 to-background py-8 px-4">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center space-y-6">
            <ShoppingBag className="h-20 w-20 text-primary mx-auto" />
            <h1 className="text-4xl sm:text-5xl font-bold">My Orders</h1>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              Log in to see your full order history and faster reordering
            </p>
          </div>
          <GuestTracker />
        </div>
      </div>
    );
  }

  // Authenticated User View
  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/20 to-background">
      <div className="bg-background/95 backdrop-blur border-b py-6">
        <div className="max-w-5xl mx-auto px-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold flex items-center gap-4">
            <ShoppingBag className="h-10 w-10 sm:h-12 sm:w-12 text-primary" />
            My Orders
          </h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {isLoading ? (
          <div className="space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-48 sm:h-56 rounded-2xl w-full" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <Card className="text-center py-20 shadow-xl">
            <CardContent className="space-y-8">
              <PackageOpen className="h-24 w-24 text-muted-foreground/40 mx-auto" />
              <h2 className="text-3xl sm:text-4xl font-bold">No Orders Yet</h2>
              <p className="text-lg text-muted-foreground max-w-md mx-auto">
                Your delicious journey starts here!
              </p>
              <Button asChild size="lg" className="w-full sm:w-auto h-14 text-lg">
                <Link to="/menu/all">Browse Menu</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-10">
              <TabsTrigger value="active" className="text-base py-3">
                <Clock className="h-5 w-5 mr-2" />
                Active ({activeOrders.length})
              </TabsTrigger>
              <TabsTrigger value="past" className="text-base py-3">
                <Package className="h-5 w-5 mr-2" />
                Past ({pastOrders.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-6">
              {activeOrders.length === 0 ? (
                <Card className="text-center py-16">
                  <p className="text-xl text-muted-foreground">No active orders right now</p>
                </Card>
              ) : (
                activeOrders.map((order) => <OrderCard key={order._id} order={order} />)
              )}
            </TabsContent>

            <TabsContent value="past" className="space-y-6">
              {pastOrders.map((order) => <OrderCard key={order._id} order={order} />)}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;