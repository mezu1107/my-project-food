// src/features/orders/pages/OrderTrackingPage.tsx
import { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  CheckCircle,
  Clock,
  MapPin,
  Truck,
  ChefHat,
  Package,
  XCircle,
  Phone,
  User,
  AlertCircle,
  Copy,
  Timer,
  Building2,
  Check,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { useOrder } from '@/features/orders/hooks/useOrders';
import { useOrderSocket } from '@/features/orders/hooks/useOrderSocket';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, type Order } from '@/types/order.types';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { toast } from 'sonner';

// Fix Leaflet icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const STEPS = [
  { status: 'pending', icon: Clock, label: 'Order Received' },
  { status: 'confirmed', icon: CheckCircle, label: 'Confirmed' },
  { status: 'preparing', icon: ChefHat, label: 'Preparing' },
  { status: 'out_for_delivery', icon: Truck, label: 'On the Way' },
  { status: 'delivered', icon: Package, label: 'Delivered' },
] as const;

const BANK_DETAILS = {
  bankName: 'Meezan Bank',
  accountTitle: 'FoodExpress Pvt Ltd',
  accountNumber: '0211-0105678901',
  iban: 'PK36MEZN0002110105678901',
  branch: 'Gulberg Branch, Lahore',
};

const PAYMENT_TIMEOUT_MINUTES = 15;

export default function OrderTrackingPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const { data: order, isLoading } = useOrder(orderId!);

  useOrderSocket(orderId);

  const [riderLocation, setRiderLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  // Live payment countdown
  useEffect(() => {
    if (!order?.placedAt || order.status !== 'pending_payment') {
      setSecondsLeft(null);
      return;
    }

    const deadline = new Date(order.placedAt);
    deadline.setMinutes(deadline.getMinutes() + PAYMENT_TIMEOUT_MINUTES);

    const tick = () => {
      const diff = Math.max(0, Math.floor((deadline.getTime() - Date.now()) / 1000));
      setSecondsLeft(diff);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [order?.placedAt, order?.status]);

  // Copy to clipboard helper
  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success(`${field} copied!`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const isCancelled = order && ['cancelled', 'rejected'].includes(order.status);
  const isPendingPayment = order?.status === 'pending_payment';
  const showProgress = order && !isCancelled && !isPendingPayment;
  const currentStep = order ? STEPS.findIndex((s) => s.status === order.status) : -1;
  const showMap = order?.status === 'out_for_delivery' && riderLocation;

  if (isLoading) return <Skeleton className="h-96 w-full mx-auto mt-8 rounded-xl" />;

  if (!order) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-8">
          <AlertCircle className="h-16 w-16 text-destructive/50 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-3">Order Not Found</h2>
          <p className="text-muted-foreground mb-6">
            This order doesn't exist or has been removed.
          </p>
          <Button asChild>
            <Link to="/orders">View Orders</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container mx-auto px-4 max-w-4xl space-y-6">
        {/* Header */}
        <div className="text-center py-6">
          <h1 className="text-3xl font-bold mb-2">Order Tracking</h1>
          <p className="text-lg text-muted-foreground">
            #{order._id.slice(-6).toUpperCase()}
          </p>
          <Badge
            className={`mt-3 text-lg px-4 py-1 ${ORDER_STATUS_COLORS[order.status]}`}
          >
            {ORDER_STATUS_LABELS[order.status] || order.status.replace(/_/g, ' ')}
          </Badge>
          {order.placedAt && (
            <p className="text-sm text-muted-foreground mt-2">
              Placed {format(new Date(order.placedAt), 'dd MMM yyyy • h:mm a')}
            </p>
          )}
        </div>

        {/* PENDING PAYMENT */}
        {isPendingPayment && (
          <Card className="border-2 border-orange-500 bg-orange-50">
            <CardContent className="p-8 text-center">
              <Timer className="h-16 w-16 text-orange-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-3 text-orange-800">
                Payment Pending
              </h3>

              {secondsLeft !== null && (
                <p className="text-3xl font-bold text-orange-600 mb-2">
                  {`${Math.floor(secondsLeft / 60)
                    .toString()
                    .padStart(2, '0')}:${(secondsLeft % 60)
                    .toString()
                    .padStart(2, '0')}`}
                </p>
              )}
              <p className="text-sm text-muted-foreground mb-6">
                Complete payment to confirm your order • Auto-cancels in 15 minutes
              </p>

              {order.paymentMethod === 'bank' ? (
                <div className="max-w-md mx-auto space-y-6">
                  <p className="text-lg">
                    Transfer{' '}
                    <strong className="text-2xl">Rs. {order.finalAmount.toLocaleString()}</strong>
                  </p>

                  <div className="bg-white rounded-xl p-6 shadow-sm space-y-4 text-left">
                    {[
                      { label: 'Bank', value: BANK_DETAILS.bankName },
                      { label: 'Account Title', value: BANK_DETAILS.accountTitle },
                      { label: 'Account Number', value: BANK_DETAILS.accountNumber },
                      { label: 'IBAN', value: BANK_DETAILS.iban },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="flex justify-between items-center py-2 border-b last:border-0"
                      >
                        <div>
                          <p className="text-sm text-muted-foreground">{item.label}</p>
                          <p className="font-medium font-mono">{item.value}</p>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => copyToClipboard(item.value, item.label)}
                        >
                          {copiedField === item.label ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    ))}

                    <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200 mt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Reference Code (Required)</p>
                          <p className="text-xl font-bold text-green-700 font-mono">
                            {order.bankTransferReference}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() =>
                            copyToClipboard(order.bankTransferReference!, 'Reference')
                          }
                        >
                          {copiedField === 'Reference' ? (
                            <Check className="h-5 w-5" />
                          ) : (
                            <Copy className="h-5 w-5" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Button asChild className="w-full">
                    <Link to={`/checkout/bank-transfer/${order._id}`}>
                      <Building2 className="mr-2 h-5 w-5" />
                      View Full Transfer Instructions
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <Clock className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                  <p className="text-lg">Completing your card payment...</p>
                  <Button asChild className="mt-4">
                    <Link to="/checkout/card">Continue Payment</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Progress Steps */}
        {showProgress && (
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
                          className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold transition-all ${
                            active
                              ? 'bg-primary scale-110 ring-4 ring-primary/30'
                              : 'bg-muted'
                          }`}
                        >
                          <Icon className="h-7 w-7" />
                        </div>
                        <p
                          className={`text-xs mt-3 ${
                            active ? 'font-semibold' : 'text-muted-foreground'
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
                    className="h-full bg-primary transition-all duration-700"
                    style={{
                      width: `${currentStep >= 0 ? (currentStep / (STEPS.length - 1)) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              {order.estimatedDelivery && (
                <p className="text-center mt-8 text-lg font-medium">
                  Estimated Delivery:{' '}
                  <span className="text-primary text-2xl">{order.estimatedDelivery}</span>
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Live Map */}
        {showMap && (
          <Card>
            <CardContent className="p-0">
              <div className="h-96 rounded-xl overflow-hidden">
                <MapContainer
                  center={[riderLocation!.lat, riderLocation!.lng]}
                  zoom={15}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={[riderLocation!.lat, riderLocation!.lng]}>
                    <Popup>
                      <div className="text-center">
                        <Truck className="h-6 w-6 text-primary mx-auto mb-1" />
                        <p className="font-medium">{order.rider?.name || 'Your Rider'}</p>
                        <p className="text-xs">Delivering your order</p>
                      </div>
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
              <div className="p-4 bg-primary/5 text-center font-medium">Rider is on the way!</div>
            </CardContent>
          </Card>
        )}

        {/* Rider Info */}
        {order.rider && order.status === 'out_for_delivery' && (
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-lg">{order.rider.name}</p>
                  <p className="text-sm text-muted-foreground">Your Delivery Rider</p>
                </div>
              </div>
              <Button size="lg" asChild>
                <a href={`tel:${order.rider.phone}`}>
                  <Phone className="h-5 w-5 mr-2" />
                  Call Rider
                </a>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Order Items */}
        <Card>
          <CardContent className="p-6 space-y-6">
            <h3 className="font-bold text-lg">Order Items</h3>
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between py-2">
                <span>
                  {item.quantity} × {item.menuItem.name}
                </span>
                <span className="font-medium">Rs. {item.priceAtOrder * item.quantity}</span>
              </div>
            ))}
            <Separator />
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>Rs. {order.totalAmount}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>Rs. {order.deliveryFee}</span>
              </div>
              {order.discountApplied > 0 && (
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Discount</span>
                  <span>-Rs. {order.discountApplied}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-xl pt-4 border-t">
                <span>Total</span>
                <span className="text-primary">Rs. {order.finalAmount}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Address */}
        <Card>
          <CardContent className="p-6">
            <div className="flex gap-3">
              <MapPin className="h-5 w-5 text-primary mt-1" />
              <div>
                <p className="font-medium">Delivery Address</p>
                <p className="text-sm text-muted-foreground">{order.addressDetails?.fullAddress}</p>
                {order.addressDetails?.instructions && (
                  <p className="text-xs italic text-muted-foreground mt-2">
                    "{order.addressDetails.instructions}"
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4 pb-8">
          <Button asChild variant="outline" className="flex-1">
            <Link to="/orders">All Orders</Link>
          </Button>
          <Button asChild className="flex-1">
            <Link to="/menu">Order Again</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
