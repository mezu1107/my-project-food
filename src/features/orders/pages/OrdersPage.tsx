// src/features/orders/pages/OrdersPage.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingBag, Clock, Package, Search, ChevronRight, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useMyOrders, useTrackOrderByPhone } from '@/features/orders/hooks/useOrders';
import { useOrderSocket } from '@/features/orders/hooks/useOrderSocket';
import { 
  ORDER_STATUS_LABELS, 
  ORDER_STATUS_COLORS, 
  type Order,
  type OrderItem 
} from '@/types/order.types';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

const OrderCard = ({ order }: { order: Order }) => {
  const items = order.items || []; // default to empty array if undefined

  return (
    <Link to={`/order/${order._id}`}>
      <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer border">
        <CardContent className="p-5">
          {/* Header: Order ID and Status */}
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="font-bold text-lg">#{order._id.slice(-6).toUpperCase()}</p>
              <p className="text-sm text-muted-foreground">
                {order.placedAt
                  ? format(new Date(order.placedAt), 'dd MMM yyyy • h:mm a')
                  : 'Date unavailable'}
              </p>
            </div>
            <Badge className={ORDER_STATUS_COLORS[order.status] || 'bg-gray-300'}>
              {ORDER_STATUS_LABELS[order.status] || 'Unknown'}
            </Badge>
          </div>

          {/* Summary: Items count and Total */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{items.length} item{items.length !== 1 ? 's' : ''}</span>
            <span>•</span>
            <span className="font-semibold text-foreground">
              Rs. {order.finalAmount ?? '0'}
            </span>
          </div>

          {/* Items Avatars */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex -space-x-3">
              {items.slice(0, 4).map((item, i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full bg-primary/10 border-2 border-background flex items-center justify-center text-xs font-bold text-primary"
                  title={item.menuItem?.name || 'Item'}
                >
                  {item.menuItem?.name?.[0] || '?'}
                </div>
              ))}
              {items.length > 4 && (
                <div className="w-10 h-10 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs">
                  +{items.length - 4}
                </div>
              )}
            </div>
            <ChevronRight className="h-6 w-6 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};


const GuestTracker = () => {
  const [phone, setPhone] = useState('');
  const mutation = useTrackOrderByPhone();
  const isValidPhone = /^03\d{9}$/.test(phone);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">Track Order Without Login</h3>
          <div className="flex gap-3">
            <Input
              placeholder="03XXXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
              maxLength={11}
            />
            <Button 
              onClick={() => mutation.mutate({ phone })} 
              disabled={!isValidPhone || mutation.isPending}
            >
              {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {mutation.data?.orders?.length === 0 && (
        <p className="text-center text-muted-foreground">No orders found</p>
      )}

      {mutation.data?.orders?.map((order: Order) => (
        <OrderCard key={order._id} order={order} />
      ))}
    </div>
  );
};

export default function OrdersPage() {
  const { isAuthenticated } = useAuthStore();
  const { data: orders = [], isLoading } = useMyOrders();
  useOrderSocket();

  const active = orders.filter(o => !['delivered', 'cancelled', 'rejected'].includes(o.status));
  const past = orders.filter(o => ['delivered', 'cancelled', 'rejected'].includes(o.status));

  if (!isAuthenticated) return <GuestTracker />;

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="bg-background border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <ShoppingBag className="h-8 w-8 text-primary" />
            My Orders
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-40 rounded-xl" />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="h-20 w-20 text-muted-foreground/30 mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-3">No Orders Yet</h2>
            <Button asChild size="lg">
              <Link to="/menu">Order Now</Link>
            </Button>
          </div>
        ) : (
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="active">
                <Clock className="h-4 w-4 mr-2" />
                Active ({active.length})
              </TabsTrigger>
              <TabsTrigger value="past">
                <Package className="h-4 w-4 mr-2" />
                Past ({past.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-4">
              {active.map(order => <OrderCard key={order._id} order={order} />)}
            </TabsContent>

            <TabsContent value="past" className="space-y-4">
              {past.map(order => <OrderCard key={order._id} order={order} />)}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}