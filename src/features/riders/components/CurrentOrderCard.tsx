// src/features/riders/components/CurrentOrderCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { MapPin, Phone, Package, Clock, DollarSign } from 'lucide-react';
import {
  useAcceptOrder,
  usePickupOrder,
  useDeliverOrder,
  useCollectCash,
} from '../hooks/useRiders';
import type { CurrentOrder } from '../types/rider.types';

interface CurrentOrderCardProps {
  order: CurrentOrder;
}

export default function CurrentOrderCard({ order }: CurrentOrderCardProps) {
  const acceptOrder = useAcceptOrder();
  const pickupOrder = usePickupOrder();
  const deliverOrder = useDeliverOrder();
  const collectCash = useCollectCash();

  const isPending = ['pending', 'confirmed'].includes(order.status);
  const isOutForDelivery = order.status === 'out_for_delivery';
  const isCashOrder = order.paymentMethod === 'cash';

  const handleCollectCash = () => {
    const amountStr = prompt(
      `Enter collected amount (≈ PKR ${order.finalAmount?.toLocaleString() || 0}):`
    );
    if (!amountStr) return;

    const amount = Number(amountStr);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    collectCash.mutate(
      { orderId: order._id, amount },
      { onError: () => alert('Failed to record cash collection') }
    );
  };

  return (
    <Card className="border-primary/30 shadow-lg overflow-hidden">
      <CardHeader className="bg-primary/5 pb-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">Order #{order._id.slice(-6)}</CardTitle>
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              {order.placedAt
                ? new Date(order.placedAt).toLocaleString('en-PK', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })
                : 'N/A'}
            </div>
          </div>
          <Badge
            variant={
              order.status === 'delivered'
                ? 'outline'
                : order.status === 'out_for_delivery'
                ? 'default'
                : 'secondary'
            }
            className="text-base px-4 py-1"
          >
            {formatOrderStatus(order.status)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        {/* Customer */}
        <InfoRow
          icon={<Phone className="h-5 w-5" />}
          label="Customer"
          content={
            <div>
              <p className="font-medium">{order.customer?.name || 'Guest'}</p>
              <p className="text-sm text-muted-foreground">
                {order.customer?.phone || 'N/A'}
              </p>
            </div>
          }
        />

        {/* Address */}
        <InfoRow
          icon={<MapPin className="h-5 w-5" />}
          label="Delivery To"
          content={
            <div>
              <p className="font-medium">{order.address?.label || 'Delivery Address'}</p>
              <p className="text-sm">{order.address?.fullAddress || 'N/A'}</p>
              {order.address?.floor && (
                <p className="text-sm text-muted-foreground">Floor: {order.address.floor}</p>
              )}
              {order.address?.instructions && (
                <p className="text-sm italic mt-1 border-l-2 border-primary/30 pl-2">
                  {order.address.instructions}
                </p>
              )}
            </div>
          }
        />

        <Separator />

        {/* Items Summary */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-3 rounded-full">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">
                {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
              </h3>
              <p className="text-sm text-muted-foreground">
                {order.items?.map((item) => item.name).join(', ') || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Payment & Amount */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-3 rounded-full dark:bg-green-950">
              <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Amount</p>
              <p className="text-2xl font-bold">
                PKR {order.finalAmount?.toLocaleString() || 0}
              </p>
            </div>
          </div>

          {isCashOrder && (
            <Badge variant="outline" className="text-base px-4 py-1">
              CASH ON DELIVERY
            </Badge>
          )}
        </div>

        {/* Main Action Buttons */}
        <div className="pt-4 space-y-3">
          {isPending && (
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                size="lg"
                className="h-14 text-base"
                onClick={() => {
                  const reason = prompt('Reason for rejection (optional):');
                  acceptOrder.mutate({ orderId: order._id, reason: reason || undefined });
                }}
                disabled={acceptOrder.isPending}
              >
                Reject
              </Button>
            </div>
          )}

          {isOutForDelivery && (
            <>
              <Button
                variant="default"
                size="lg"
                className="w-full h-14 text-base"
                onClick={() => pickupOrder.mutate(order._id)}
                disabled={pickupOrder.isPending}
              >
                {pickupOrder.isPending ? 'Processing...' : "I've Picked Up the Order"}
              </Button>

              <Button
                size="lg"
                className="w-full h-14 text-base bg-green-600 hover:bg-green-700"
                onClick={() => {
                  if (isCashOrder) handleCollectCash();
                  else if (confirm('Confirm order delivery?')) deliverOrder.mutate(order._id);
                }}
                disabled={deliverOrder.isPending || collectCash.isPending}
              >
                {deliverOrder.isPending || collectCash.isPending
                  ? 'Processing...'
                  : isCashOrder
                  ? 'Collect Cash & Complete'
                  : 'Complete Delivery'}
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function InfoRow({ icon, label, content }: { icon: React.ReactNode; label: string; content: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4">
      <div className="bg-primary/10 p-3 rounded-full mt-0.5">{icon}</div>
      <div className="flex-1">
        <p className="text-sm font-medium text-muted-foreground mb-1">{label}</p>
        {content}
      </div>
    </div>
  );
}

function formatOrderStatus(status: string): string {
  return status
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
