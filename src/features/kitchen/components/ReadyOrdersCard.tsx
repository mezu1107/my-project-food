// src/features/kitchen/components/ReadyOrdersCard.tsx
// PRODUCTION-READY — JANUARY 09, 2026
// Real-time card for Admin & Rider to see kitchen-ready orders

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, MapPin, User, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { playSound } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface ReadyOrder {
  _id: string;
  shortId: string;
  customerName: string;
  address: string;
  readyAt: string;
  itemsCount: number;
}

interface Props {
  role: 'admin' | 'rider'; // to customize button text
}

export default function ReadyOrdersCard({ role }: Props) {
  const [readyOrders, setReadyOrders] = useState<ReadyOrder[]>([]);
  const [prevCount, setPrevCount] = useState(0);

  useEffect(() => {
    const socket = global.io || (window as any).socket;

    if (!socket) return;

    const handleReadyOrder = (data: any) => {
      const newOrder: ReadyOrder = {
        _id: data.orderId || data.kitchenOrderId,
        shortId: data.shortId,
        customerName: data.customerName,
        address: data.address || 'Address available on pickup',
        readyAt: data.timestamp || new Date().toISOString(),
        itemsCount: data.itemsCount || 0,
      };

      setReadyOrders((prev) => {
        // Avoid duplicates
        if (prev.some((o) => o._id === newOrder._id)) return prev;
        return [newOrder, ...prev];
      });

      // Play sound and show toast
      playSound('ready');
      toast.success(
        role === 'rider'
          ? `Order ${data.shortId} is READY for pickup!`
          : `Kitchen finished ${data.shortId} — Ready for rider!`,
        { duration: 8000 }
      );
    };

    // Listen to kitchen ready event
    socket.on('orderReadyForPickup', handleReadyOrder);
    socket.on('order-ready-for-delivery', handleReadyOrder);

    return () => {
      socket.off('orderReadyForPickup', handleReadyOrder);
      socket.off('order-ready-for-delivery', handleReadyOrder);
    };
  }, [role]);

  // Sound when count increases
  useEffect(() => {
    if (readyOrders.length > prevCount && prevCount > 0) {
      playSound('ready');
    }
    setPrevCount(readyOrders.length);
  }, [readyOrders.length]);

  if (readyOrders.length === 0) {
    return null; // Hide card when empty
  }

  return (
    <Card className="border-2 border-green-500 shadow-xl bg-gradient-to-br from-green-50 to-emerald-50">
      <CardHeader className="bg-green-600 text-white">
        <CardTitle className="flex items-center gap-3 text-2xl">
          <Package className="h-8 w-8" />
          Ready for Pickup ({readyOrders.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {readyOrders.map((order) => (
          <div
            key={order._id}
            className="p-5 rounded-xl bg-white border border-green-300 shadow-md hover:shadow-lg transition"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-xl font-bold text-green-800">#{order.shortId}</h3>
                <p className="flex items-center gap-2 text-gray-700 mt-1">
                  <User className="h-4 w-4" />
                  {order.customerName}
                </p>
              </div>
              <Badge variant="default" className="bg-green-600 text-white text-lg px-4 py-1">
                READY
              </Badge>
            </div>

            <div className="space-y-2 text-gray-600">
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {order.address}
              </p>
              <p className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4" />
                Ready {formatDistanceToNow(new Date(order.readyAt), { addSuffix: true })}
              </p>
            </div>

            <Button
              size="lg"
              className="w-full mt-5 bg-green-600 hover:bg-green-700 text-lg h-12"
              onClick={() => {
                toast.info(`Rider picking up #${order.shortId}`);
                // Future: Mark as picked up or navigate to delivery
              }}
            >
              {role === 'rider' ? 'I Will Deliver This' : 'Assign Rider Now'}
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}