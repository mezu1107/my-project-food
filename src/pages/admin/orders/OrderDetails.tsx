// src/pages/admin/orders/OrderDetails.tsx
// FIXED: Slim address type for public tracking response + safe optional chaining
// No more TS2339 on .floor, .fullAddress, etc.
// Displays correct address data instead of N/A

import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';

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

import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  Package,
  Clock,
  CheckCircle,
  Truck,
  ChefHat,
  XCircle,
  Receipt,
  Loader2,
} from 'lucide-react';

import {
  useTrackOrder,
  downloadReceipt,
  useAdminRejectOrder,
} from '@/features/orders/hooks/useOrders';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/types/order.types';

// Local slim type matching public tracking response shape
interface TrackingAddress {
  fullAddress: string;
  label: string;
  floor?: string;      // optional in tracking
}

const STATUS_ICONS = {
  pending: Clock,
  pending_payment: Clock,
  confirmed: CheckCircle,
  preparing: ChefHat,
  out_for_delivery: Truck,
  delivered: Package,
  cancelled: XCircle,
  rejected: XCircle,
};

export default function AdminOrderDetails() {
  const { orderId } = useParams<{ orderId: string }>();
  const { data: response, isLoading } = useTrackOrder(orderId);
  const adminRejectOrder = useAdminRejectOrder();

  const order = response?.order;

  const handleDownloadReceipt = () => {
    if (order?._id) downloadReceipt(order._id);
  };

  if (isLoading) {
    return (
      <main className="container mx-auto px-4 py-8 md:py-12 max-w-5xl">
        <div className="space-y-8">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-96 rounded-2xl" />
          <Skeleton className="h-80 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 py-12 bg-muted/20">
        <Card className="w-full max-w-md text-center p-8 md:p-10">
          <XCircle className="h-14 w-14 md:h-16 md:w-16 text-destructive mx-auto mb-6" />
          <h2 className="text-2xl font-bold md:text-3xl mb-4">Order Not Found</h2>
          <Button size="lg" asChild>
            <Link to="/admin/orders">Back to Orders</Link>
          </Button>
        </Card>
      </main>
    );
  }

  const StatusIcon = STATUS_ICONS[order.status] || Clock;
  const customerName = order.guestInfo?.name || order.customer?.name || 'Guest';
  const customerPhone = order.guestInfo?.phone || order.customer?.phone || 'N/A';
  const shortId = order.shortId || order._id.slice(-6).toUpperCase();

  const totals = order.totals ?? {
    totalAmount: 0,
    deliveryFee: 0,
    discountApplied: 0,
    walletUsed: 0,
    finalAmount: 0,
  };

  const paymentMethod = order.paymentMethod?.toUpperCase() || 'N/A';

  // Use correct nested address from tracking response
  const address: TrackingAddress = order.address ?? {
    fullAddress: '',
    label: '',
    floor: undefined,
  };

  // Instructions (order-level overrides)
  const instructions = order.instructions || '';

  const isRejectable = !['delivered', 'cancelled', 'rejected'].includes(order.status);

  return (
    <main className="container mx-auto px-4 py-8 md:py-12 max-w-5xl">
      {/* Back Button */}
      <Button variant="ghost" asChild className="mb-8">
        <Link to="/admin/orders">
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Orders
        </Link>
      </Button>

      {/* Header */}
      <header className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-4 md:text-4xl lg:text-5xl">Order Details</h1>
        <p className="text-2xl font-mono text-primary mb-4 md:text-3xl">#{shortId}</p>

        <div className="flex flex-wrap justify-center gap-4">
          <Badge className={`text-base md:text-lg px-6 py-2 ${ORDER_STATUS_COLORS[order.status]} text-white`}>
            <StatusIcon className="h-5 w-5 mr-2" />
            {ORDER_STATUS_LABELS[order.status] || order.status}
          </Badge>
          <Badge variant="outline" className="text-base md:text-lg px-4 py-2">
            {paymentMethod}
          </Badge>
        </div>

        <p className="text-base text-muted-foreground mt-4 md:text-lg">
          Placed on {order.placedAt ? format(new Date(order.placedAt), 'dd MMM yyyy • h:mm a') : 'N/A'}
        </p>
      </header>

      {/* Customer Info */}
      <Card className="mb-8 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl md:text-2xl">
            <User className="h-6 w-6" />
            Customer Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div>
            <p className="font-medium text-lg md:text-xl">{customerName}</p>
            <p className="text-muted-foreground flex items-center gap-2 mt-1">
              <Phone className="h-4 w-4" />
              {customerPhone}
            </p>
          </div>
          <div>
            <p className="font-medium text-lg md:text-xl">Order Type</p>
            <p className="text-muted-foreground">
              {order.guestInfo?.isGuest ? 'Guest Order' : 'Registered Customer'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Address – Now reads from correct nested address */}
      <Card className="mb-8 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl md:text-2xl">
            <MapPin className="h-6 w-6" />
            Delivery Address
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-base md:text-lg leading-relaxed">
            {address.fullAddress || 'N/A'}
          </p>

          {address.label && address.label !== 'Work' && (  // optional: hide default label if unwanted
            <p className="text-muted-foreground">Label: {address.label}</p>
          )}

          {address.floor && (
            <p className="text-muted-foreground">Floor: {address.floor}</p>
          )}

          {instructions && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="font-medium mb-1">Special Instructions:</p>
              <p className="italic">"{instructions}"</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rider Info */}
      {order.rider && (
        <Card className="mb-8 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl md:text-2xl">
              <Truck className="h-6 w-6" />
              Assigned Rider
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-9 w-9 text-primary" />
              </div>
              <div>
                <p className="text-xl font-bold md:text-2xl">{order.rider.name || 'N/A'}</p>
                <p className="text-muted-foreground flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {order.rider.phone || 'N/A'}
                </p>
              </div>
            </div>
            {order.rider.phone && (
              <Button size="lg" asChild className="h-12">
                <a href={`tel:${order.rider.phone}`}>
                  <Phone className="mr-2 h-5 w-5" />
                  Call Rider
                </a>
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Order Items & Summary */}
      <Card className="mb-8 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl md:text-2xl">
            <Package className="h-6 w-6" />
            Order Items
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-5">
            {order.items?.map((item, index) => {
              const itemName = item.name || 'Deleted / Unavailable Item';
              const itemTotal = (item.priceAtOrder ?? 0) * (item.quantity ?? 1);

              return (
                <div
                  key={index}
                  className="flex items-center justify-between py-4 border-b last:border-0"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm md:text-base">
                      {item.quantity ?? 1}
                    </div>
                    <p className="font-medium text-base md:text-lg">{itemName}</p>
                  </div>
                  <p className="font-medium text-base md:text-lg">
                    Rs. {itemTotal.toLocaleString()}
                  </p>
                </div>
              );
            })}
          </div>

          <Separator />

          <div className="space-y-4 text-base md:text-lg">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>Rs. {totals.totalAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span>Rs. {totals.deliveryFee.toLocaleString()}</span>
            </div>
            {totals.discountApplied > 0 && (
              <div className="flex justify-between text-green-600 font-medium">
                <span>Discount Applied</span>
                <span>-Rs. {totals.discountApplied.toLocaleString()}</span>
              </div>
            )}
            {totals.walletUsed > 0 && (
              <div className="flex justify-between text-blue-600 font-medium">
                <span>Wallet Used</span>
                <span>-Rs. {totals.walletUsed.toLocaleString()}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between text-2xl font-bold md:text-3xl pt-4">
              <span>Total Paid</span>
              <span className="text-primary">
                Rs. {totals.finalAmount.toLocaleString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Button size="lg" variant="outline" asChild className="h-12">
          <Link to="/admin/orders">Back to Orders List</Link>
        </Button>

        <Button size="lg" onClick={handleDownloadReceipt} className="h-12">
          <Receipt className="mr-2 h-5 w-5" />
          Download Receipt
        </Button>

        {isRejectable && (
          <Button
            variant="destructive"
            size="lg"
            onClick={() => {
              const reason = prompt('Reason for rejection (optional):');
              const note = prompt('Admin note (optional):');
              if (reason !== null || note !== null) {
                adminRejectOrder.mutate({
                  orderId: order._id,
                  reason: reason || undefined,
                  note: note || undefined,
                });
              }
            }}
            disabled={adminRejectOrder.isPending}
            className="h-12"
          >
            {adminRejectOrder.isPending ? (
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            ) : (
              <XCircle className="mr-2 h-5 w-5" />
            )}
            Admin Reject Order
          </Button>
        )}
      </div>
    </main>
  );
}