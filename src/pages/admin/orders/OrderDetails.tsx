// src/pages/admin/orders/OrderDetails.tsx
// PRODUCTION-READY — DECEMBER 29, 2025
// Fixed: validateDOMNesting warning (Badge inside <p>)
// Fixed address type conflict: uses AddressDetails from tracking response
// Full unit support, enriched add-ons, rider info, receipt download, admin reject

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
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  UNIT_LABELS,
} from '@/types/order.types';

// Use AddressDetails from public tracking response
import type { AddressDetails } from '@/types/order.types';

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

  const handleRejectOrder = () => {
    const reason = prompt('Reason for rejection (optional):');
    const note = prompt('Internal note for admin (optional):');

    if (orderId) {
      adminRejectOrder.mutate({
        orderId,
        reason: reason?.trim() || undefined,
        note: note?.trim() || undefined,
      });
    }
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
        <Card className="w-full max-w-md text-center p-8 md:p-10 shadow-xl">
          <XCircle className="h-16 w-16 text-destructive mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">Order Not Found</h2>
          <p className="text-base text-muted-foreground mb-8">
            This order may have been removed or the ID is incorrect.
          </p>
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
  const shortId = order.shortId || `#${order._id.slice(-6).toUpperCase()}`;

  const totals = order.totals ?? {
    totalAmount: 0,
    deliveryFee: 0,
    discountApplied: 0,
    walletUsed: 0,
    finalAmount: 0,
  };

  const paymentMethod = order.paymentMethod?.toUpperCase() || 'N/A';

  // Use AddressDetails from public tracking response — has floor, label, fullAddress
  const address: AddressDetails = order.addressDetails || {
    fullAddress: 'Address not available',
    label: '',
    floor: '',
    instructions: '',
  };

  const instructions = order.instructions || address.instructions || '';

  const isRejectable = !['delivered', 'cancelled', 'rejected'].includes(order.status);

  return (
    <main className="container mx-auto px-4 py-8 md:py-12 max-w-5xl">
      {/* Back Button */}
      <Button variant="ghost" asChild className="mb-8 text-base">
        <Link to="/admin/orders">
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Orders List
        </Link>
      </Button>

      {/* Header */}
      <header className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
          Order Details
        </h1>
        <p className="text-2xl md:text-3xl font-mono text-primary mb-4">
          {shortId}
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <Badge
            className={`text-base md:text-lg px-6 py-3 ${ORDER_STATUS_COLORS[order.status]} text-white font-medium`}
          >
            <StatusIcon className="h-6 w-6 mr-3" />
            {ORDER_STATUS_LABELS[order.status]}
          </Badge>
          <Badge variant="outline" className="text-base md:text-lg px-6 py-3">
            {paymentMethod}
          </Badge>
        </div>

        <p className="text-base md:text-lg text-muted-foreground mt-6">
          Placed on{' '}
          {order.placedAt
            ? format(new Date(order.placedAt), 'dd MMMM yyyy • h:mm a')
            : 'N/A'}
        </p>
      </header>

      {/* Customer Info */}
      <Card className="mb-8 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl md:text-2xl">
            <User className="h-7 w-7" />
            Customer Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <p className="text-xl font-semibold">{customerName}</p>
            <p className="text-muted-foreground flex items-center gap-2">
              <Phone className="h-5 w-5" />
              {customerPhone}
            </p>
          </div>
          <div className="space-y-3">
            <p className="text-xl font-semibold">Order Type</p>
            <p className="text-muted-foreground">
              {order.guestInfo ? 'Guest Order' : 'Registered Customer'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Address */}
      <Card className="mb-8 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl md:text-2xl">
            <MapPin className="h-7 w-7" />
            Delivery Address
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <p className="text-lg md:text-xl leading-relaxed font-medium">
            {address.fullAddress}
          </p>

          {(address.label || address.floor) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 text-muted-foreground">
              {address.label && <p>• Label: {address.label}</p>}
              {address.floor && <p>• Floor/Apartment: {address.floor}</p>}
            </div>
          )}

          {instructions && (
            <div className="mt-6 p-5 bg-muted/50 rounded-xl">
              <p className="font-semibold mb-2">Special Instructions:</p>
              <p className="italic text-base">"{instructions}"</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rider Info */}
      {order.rider && (
        <Card className="mb-8 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl md:text-2xl">
              <Truck className="h-7 w-7" />
              Assigned Rider
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-10 w-10 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{order.rider.name}</p>
                <p className="text-lg text-muted-foreground flex items-center gap-2 mt-1">
                  <Phone className="h-5 w-5" />
                  {order.rider.phone}
                </p>
              </div>
            </div>
            <Button size="lg" asChild className="h-14">
              <a href={`tel:${order.rider.phone}`}>
                <Phone className="mr-3 h-6 w-6" />
                Call Rider
              </a>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Order Items */}
      <Card className="mb-8 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl md:text-2xl">
            <Package className="h-7 w-7" />
            Order Items
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-7">
          {order.items.map((item, index) => {
            const itemTotal = item.priceAtOrder * item.quantity;

            return (
              <div key={item._id || index} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                      {item.quantity}x
                    </div>
                    <div>
                      {/* FIXED: No more <div> inside <p> */}
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-semibold text-lg md:text-xl">
                          {item.name}
                        </span>
                        <Badge variant="outline" className="text-sm py-1 px-3">
                          {UNIT_LABELS[item.unit] || item.unit}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <p className="font-bold text-lg md:text-xl">
                    Rs. {itemTotal.toLocaleString()}
                  </p>
                </div>

                {/* Enriched add-ons */}
                {item.addOns?.length > 0 && (
                  <div className="ml-20 space-y-2 text-base text-muted-foreground">
                    {item.addOns.map((addon) => (
                      <p key={addon.name} className="flex justify-between items-center">
                        <span className="flex items-center gap-3">
                          • {addon.name}
                          {addon.unit && (
                            <Badge variant="outline" className="text-xs py-0 px-2">
                              {UNIT_LABELS[addon.unit] || addon.unit}
                            </Badge>
                          )}
                        </span>
                        {addon.price > 0 && (
                          <span className="text-primary font-medium">
                            +Rs. {addon.price}
                          </span>
                        )}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          <Separator className="my-8" />

          {/* Financial Summary */}
          <div className="space-y-5 text-lg md:text-xl">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>Rs. {totals.totalAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span>Rs. {totals.deliveryFee.toLocaleString()}</span>
            </div>
            {totals.discountApplied > 0 && (
              <div className="flex justify-between text-green-600 dark:text-green-400 font-semibold">
                <span>Discount Applied</span>
                <span>-Rs. {totals.discountApplied.toLocaleString()}</span>
              </div>
            )}
            {totals.walletUsed > 0 && (
              <div className="flex justify-between text-blue-600 dark:text-blue-400 font-semibold">
                <span>Wallet Used</span>
                <span>-Rs. {totals.walletUsed.toLocaleString()}</span>
              </div>
            )}
            <Separator className="my-6" />
            <div className="flex justify-between text-3xl md:text-4xl font-bold pt-4">
              <span>Total Paid</span>
              <span className="text-primary">
                Rs. {totals.finalAmount.toLocaleString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-center gap-5 max-w-4xl mx-auto">
        <Button variant="outline" size="lg" asChild className="h-14 text-base">
          <Link to="/admin/orders">Back to Orders List</Link>
        </Button>

        <Button size="lg" onClick={handleDownloadReceipt} className="h-14 text-base">
          <Receipt className="mr-3 h-6 w-6" />
          Download Receipt
        </Button>

        {isRejectable && (
          <Button
            variant="destructive"
            size="lg"
            onClick={handleRejectOrder}
            disabled={adminRejectOrder.isPending}
            className="h-14 text-base"
          >
            {adminRejectOrder.isPending ? (
              <Loader2 className="mr-3 h-6 w-6 animate-spin" />
            ) : (
              <XCircle className="mr-3 h-6 w-6" />
            )}
            Reject Order
          </Button>
        )}
      </div>
    </main>
  );
}