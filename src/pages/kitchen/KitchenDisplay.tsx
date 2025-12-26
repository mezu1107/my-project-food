// src/features/kitchen/pages/KitchenDisplay.tsx
// FINAL PRODUCTION — DECEMBER 27, 2025

import { useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, ChefHat, Clock } from 'lucide-react';
import { toast } from 'sonner';

import {
  useAdminOrders,
  useUpdateOrderStatus,
} from '@/features/orders/hooks/useOrders';
import { useOrderSocket } from '@/features/orders/hooks/useOrderSocket';

type Order = any;

export default function KitchenDisplay() {
  const { data, isLoading, refetch } = useAdminOrders({
    status: 'pending,confirmed,preparing',
  });

  const updateStatus = useUpdateOrderStatus();
  useOrderSocket();

  const { newOrders, preparingOrders } = useMemo(() => {
    const orders = data?.orders || [];
    return {
      newOrders: orders.filter(
        (o: Order) => o.status === 'pending' || o.status === 'confirmed'
      ),
      preparingOrders: orders.filter((o: Order) => o.status === 'preparing'),
    };
  }, [data]);

  const handleStatusChange = useCallback(
    (orderId: string, nextStatus: 'preparing' | 'out_for_delivery') => {
      updateStatus.mutate(
        { orderId, status: nextStatus },
        {
          onSuccess: () =>
            toast.success(
              nextStatus === 'preparing'
                ? 'Started preparing'
                : 'Marked as ready'
            ),
        }
      );
    },
    [updateStatus]
  );

  useEffect(() => {
    const onVisible = () => !document.hidden && refetch();
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [refetch]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-16 w-16 animate-spin text-rose-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="text-center mb-10">
          <h1 className="text-5xl font-bold text-slate-900 flex items-center justify-center gap-4">
            <ChefHat className="h-12 w-12 text-rose-600" />
            Kitchen Display
          </h1>
          <p className="text-xl text-slate-700 mt-2">
            Live orders • Real-time updates
          </p>
        </header>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* NEW ORDERS */}
          <Section
            title={`New Orders (${newOrders.length})`}
            icon={<Clock className="h-8 w-8 text-orange-600" />}
            emptyTitle="No new orders"
            emptySub="Waiting for customers..."
          >
            {newOrders.map((order: Order) => (
              <OrderCard
                key={order._id}
                order={order}
                headerBg="bg-orange-100"
                actionLabel="Start Preparing"
                actionColor="bg-orange-600 hover:bg-orange-700"
                onAction={() =>
                  handleStatusChange(order._id, 'preparing')
                }
                loading={updateStatus.isPending}
              />
            ))}
          </Section>

          {/* PREPARING */}
          <Section
            title={`Preparing (${preparingOrders.length})`}
            icon={<ChefHat className="h-8 w-8 text-purple-700" />}
            emptyTitle="Nothing preparing"
            emptySub="All caught up!"
          >
            {preparingOrders.map((order: Order) => (
              <OrderCard
                key={order._id}
                order={order}
                headerBg="bg-purple-100"
                actionLabel="Ready for Pickup / Delivery"
                variant="secondary"
                onAction={() =>
                  handleStatusChange(order._id, 'out_for_delivery')
                }
                loading={updateStatus.isPending}
              />
            ))}
          </Section>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------- */
/* Reusable Components                */
/* ---------------------------------- */

function Section({
  title,
  icon,
  emptyTitle,
  emptySub,
  children,
}: any) {
  const isEmpty = !children || children.length === 0;

  return (
    <section>
      <h2 className="text-3xl font-bold mb-6 flex items-center gap-3 text-slate-900">
        {icon}
        {title}
      </h2>

      {isEmpty ? (
        <Card className="border-2 border-dashed bg-white">
          <CardContent className="py-20 text-center">
            <p className="text-2xl font-semibold text-slate-700">
              {emptyTitle}
            </p>
            <p className="text-lg mt-2 text-slate-600">{emptySub}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">{children}</div>
      )}
    </section>
  );
}

function OrderCard({
  order,
  headerBg,
  actionLabel,
  actionColor,
  variant,
  onAction,
  loading,
}: any) {
  return (
    <Card className="rounded-xl overflow-hidden border shadow-sm hover:shadow-md transition bg-gradient-to-br from-white via-slate-50 to-slate-200">
      <CardHeader className={`${headerBg} text-slate-900`}>
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl font-bold text-slate-900">
            #{order._id.slice(-6).toUpperCase()}
          </CardTitle>
          <Badge className="text-lg px-4 py-1 bg-slate-800 text-white">
            {order.items.length} items
          </Badge>
        </div>

        {(order.guestInfo || order.customer) && (
          <p className="text-sm text-slate-700 mt-1">
            {order.guestInfo?.name || order.customer?.name} •{' '}
            {order.guestInfo?.phone || order.customer?.phone}
          </p>
        )}
      </CardHeader>

      <CardContent className="pt-6">
        <div className="space-y-3 mb-6">
          {order.items.map((item: any, idx: number) => (
            <div
              key={item._id || idx}
              className="flex justify-between text-lg text-slate-900 border-b border-slate-300 pb-2"
            >
              <span>
                <strong>{item.quantity}×</strong>{' '}
                {item.menuItem?.name || item.name}
              </span>
            </div>
          ))}
        </div>

        {order.instructions && (
          <div className="bg-yellow-100 border border-yellow-300 p-4 rounded-lg mb-6">
            <p className="font-semibold text-slate-900">
              Special Instructions
            </p>
            <p className="italic text-slate-800">
              "{order.instructions}"
            </p>
          </div>
        )}

        <Button
          size="lg"
          variant={variant}
          className={`w-full text-xl py-6 ${actionColor || ''}`}
          onClick={onAction}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-3 h-6 w-6 animate-spin" />
              Processing...
            </>
          ) : (
            actionLabel
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
