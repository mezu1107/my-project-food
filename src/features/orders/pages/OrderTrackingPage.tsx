// src/features/orders/pages/OrderTrackingPage.tsx
// FINAL PRODUCTION — DECEMBER 21, 2025
// Now with review CTA when order is delivered

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Timer,
  Star,
} from 'lucide-react';
import { format, differenceInMinutes, isValid, parseISO } from 'date-fns';
import { useTrackOrder, useCustomerRejectOrder } from '@/features/orders/hooks/useOrders';
import { useOrderSocket } from '@/features/orders/hooks/useOrderSocket';
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
} from '@/types/order.types';
import type { AddressDetails } from '@/types/order.types';
import type { Address } from '@/features/address/types/address.types';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import SubmitReviewModal from '@/features/reviews/components/SubmitReviewModal';

/* =======================
   LEAFLET ICON FIX
   ======================= */
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

/* =======================
   HELPERS
   ======================= */

const PAYMENT_TIMEOUT_MINUTES = 15;

const safeFormatDate = (dateInput?: string | null): string => {
  if (!dateInput) return 'Date unavailable';
  try {
    const date = parseISO(dateInput);
    if (isValid(date)) {
      return format(date, 'dd MMM yyyy • h:mm a');
    }
  } catch {}
  return 'Invalid date';
};

const isGuestAddress = (
  address: Address | AddressDetails | undefined
): address is AddressDetails => {
  return !!address && 'floor' in address;
};

/* =======================
   COMPONENT
   ======================= */

export default function OrderTrackingPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const { data: order, isLoading, isError } = useTrackOrder(orderId);
  const customerRejectOrder = useCustomerRejectOrder();

  const [riderLocation, setRiderLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [minutesLeft, setMinutesLeft] = useState<number | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  useOrderSocket(orderId);

  /* Rider location */
  useEffect(() => {
    const handler = (e: Event) => {
      const payload = (e as CustomEvent<{ riderLocation: { lat: number; lng: number } }>).detail;
      if (payload?.riderLocation) {
        setRiderLocation(payload.riderLocation);
      }
    };

    window.addEventListener('riderLocationUpdate', handler);
    return () => window.removeEventListener('riderLocationUpdate', handler);
  }, []);

  /* Payment countdown */
  useEffect(() => {
    if (!order || order.status !== 'pending_payment') {
      setMinutesLeft(null);
      return;
    }

    const placedAt = parseISO(order.placedAt);
    if (!isValid(placedAt)) return;

    const deadline = new Date(placedAt);
    deadline.setMinutes(deadline.getMinutes() + PAYMENT_TIMEOUT_MINUTES);

    const update = () => {
      const diff = differenceInMinutes(deadline, new Date());
      setMinutesLeft(Math.max(0, diff));
    };

    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [order]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Skeleton className="h-96 rounded-2xl mb-6" />
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-10 text-center">
          <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Order Not Found</h2>
          <Button asChild>
            <Link to="/orders">My Orders</Link>
          </Button>
        </Card>
      </div>
    );
  }

  const isPendingPayment = order.status === 'pending_payment';
  const showMap = order.status === 'out_for_delivery' && riderLocation;
  const isDeliveredAndNotReviewed = order.status === 'delivered' && !order.review;

  const deliveryAddress: Address | AddressDetails | undefined =
    order.address ?? order.addressDetails;

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto max-w-4xl space-y-8">

        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold">Order Tracking</h1>
          <p className="font-mono text-primary mt-2">#{order.shortId}</p>
          <div className="mt-4">
            <Badge className={`${ORDER_STATUS_COLORS[order.status]} text-white`}>
              {ORDER_STATUS_LABELS[order.status]}
            </Badge>
            {isDeliveredAndNotReviewed && (
              <Badge variant="outline" className="ml-3 border-orange-600 text-orange-600">
                <Star className="h-4 w-4 mr-1" />
                Review Pending
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Placed on {safeFormatDate(order.placedAt)}
          </p>
        </div>

        {/* Review CTA */}
        {isDeliveredAndNotReviewed && (
          <Card className="border-orange-500 bg-orange-50">
            <CardContent className="p-8 text-center">
              <Star className="h-16 w-16 text-orange-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-4">How was your experience?</h3>
              <p className="text-muted-foreground mb-6">
                Your feedback helps us improve and rewards you with loyalty points!
              </p>
              <Button size="lg" onClick={() => setReviewModalOpen(true)}>
                <Star className="mr-2 h-5 w-5" />
                Rate & Review Now
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Payment Pending */}
        {isPendingPayment && (
          <Card className="border-orange-500 border-2">
            <CardContent className="p-8 text-center space-y-4">
              <Timer className="h-16 w-16 mx-auto text-orange-600" />
              <p>
                Complete payment within{' '}
                <strong>{minutesLeft ?? 15} minutes</strong>
              </p>
            </CardContent>
          </Card>
        )}

        {/* Live Map */}
        {showMap && riderLocation && (
          <Card>
            <CardHeader>
              <CardTitle className="flex gap-2 items-center">
                <Truck /> Rider on the way
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-96">
                <MapContainer center={riderLocation} zoom={15} style={{ height: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={riderLocation}>
                    <Popup>Delivering your order</Popup>
                  </Marker>
                </MapContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Delivery Address */}
        <Card>
          <CardHeader>
            <CardTitle className="flex gap-2 items-center">
              <MapPin /> Delivery Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg">
              {deliveryAddress?.fullAddress || 'Address not available'}
            </p>

            {isGuestAddress(deliveryAddress) && deliveryAddress.floor && (
              <p className="text-muted-foreground mt-1">
                Floor: {deliveryAddress.floor}
              </p>
            )}

            {deliveryAddress?.instructions && (
              <p className="mt-2 italic text-muted-foreground">
                Note: "{deliveryAddress.instructions}"
              </p>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="grid md:grid-cols-2 gap-4">
          <Button asChild variant="outline">
            <Link to="/orders">View All Orders</Link>
          </Button>
          <Button asChild>
            <Link to="/menu">Order Again</Link>
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