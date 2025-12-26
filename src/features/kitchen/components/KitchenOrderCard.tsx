// src/features/kitchen/components/KitchenOrderCard.tsx

import {
  KitchenOrderPopulated,
  KitchenItemPopulated,
} from '../types/types';
import { cn } from '@/lib/utils';
import { getTimeAgo, formatTime } from '@/lib/utils';
import { AlertCircle, Clock, PackageCheck } from 'lucide-react';

interface Props {
  order: KitchenOrderPopulated;
  onStartItem: (kitchenOrderId: string, itemId: string) => void;
  onCompleteItem: (kitchenOrderId: string, itemId: string) => void;
  onCompleteOrder: (kitchenOrderId: string) => void;
}

export default function KitchenOrderCard({
  order,
  onStartItem,
  onCompleteItem,
  onCompleteOrder,
}: Props) {
  const STATUS_CONFIG = {
    new: {
      border: 'border-orange-300',
      badge: 'bg-orange-500 text-white',
      accent: 'from-orange-400 to-amber-500',
      glow: 'ring-1 ring-orange-300/50',
    },
    preparing: {
      border: 'border-blue-300',
      badge: 'bg-blue-500 text-white',
      accent: 'from-blue-400 to-cyan-500',
      glow: 'ring-1 ring-blue-300/50',
    },
    ready: {
      border: 'border-green-300',
      badge: 'bg-green-500 text-white',
      accent: 'from-green-400 to-emerald-500',
      glow: 'ring-1 ring-green-300/50',
    },
    completed: {
      border: 'border-gray-300',
      badge: 'bg-gray-600 text-white',
      accent: 'from-gray-500 to-gray-600',
      glow: '',
    },
  } as const;

  const config = STATUS_CONFIG[order.status];

  return (
    <div
      className={cn(
        'relative rounded-xl border overflow-hidden',
        'bg-gradient-to-br from-white via-gray-50 to-slate-100',
        'shadow-sm hover:shadow-md transition',
        config.border,
        config.glow
      )}
    >
      {/* Top Accent Bar */}
      <div className={cn('h-1 bg-gradient-to-r', config.accent)} />

      <div className="p-4 sm:p-6 space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              #{order.shortId}
            </h2>
            <p className="text-sm font-medium text-gray-700">
              {order.customerName}
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
              <Clock className="w-4 h-4" />
              {getTimeAgo(order.placedAt)} • {formatTime(order.placedAt)}
            </div>
          </div>

          <span
            className={cn(
              'self-start px-3 py-1 rounded-full text-xs font-semibold tracking-wide',
              config.badge
            )}
          >
            {order.status.toUpperCase()}
          </span>
        </div>

        {/* Special Instructions */}
        {order.instructions && (
          <div className="flex items-start gap-2 p-3 rounded-md bg-red-50 border border-red-300 text-red-700 text-sm">
            <AlertCircle className="w-4 h-4 mt-0.5" />
            <span>{order.instructions}</span>
          </div>
        )}

        {/* Items */}
        <div className="space-y-3">
          {order.items.map((item: KitchenItemPopulated) => {
            const ITEM_STATUS = {
              pending: {
                btn: 'bg-orange-500 hover:bg-orange-600',
                label: 'Start',
              },
              preparing: {
                btn: 'bg-blue-600 hover:bg-blue-700',
                label: 'Ready',
              },
              ready: {
                btn: 'bg-gray-500',
                label: 'Done',
              },
            } as const;

            const s = ITEM_STATUS[item.status];

            return (
              <div
                key={item._id}
                className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-lg border bg-white"
              >
                <div className="flex items-center gap-3">
                  {item.menuItem?.image && (
                    <img
                      src={item.menuItem.image}
                      alt={item.name}
                      className="w-12 h-12 rounded-md object-cover"
                    />
                  )}
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {item.name}
                    </p>
                    <p className="text-xs font-bold text-orange-600">
                      × {item.quantity}
                    </p>
                  </div>
                </div>

                {item.status !== 'ready' ? (
                  <button
                    onClick={() =>
                      item.status === 'pending'
                        ? onStartItem(order._id, item._id)
                        : onCompleteItem(order._id, item._id)
                    }
                    className={cn(
                      'px-4 py-2 rounded-md text-sm font-semibold text-white transition',
                      s.btn
                    )}
                  >
                    {s.label}
                  </button>
                ) : (
                  <span className="text-xs font-semibold text-green-700">
                    Completed
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t">
          <div className="text-center sm:text-left">
            <p className="text-xs text-gray-600 uppercase">
              {order.order.paymentMethod} Payment
            </p>
            <p className="text-lg font-bold text-gray-900">
              Rs. {order.order.finalAmount.toLocaleString()}
            </p>
          </div>

          {order.status === 'ready' && (
            <button
              onClick={() => onCompleteOrder(order._id)}
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold transition"
            >
              <PackageCheck className="w-4 h-4" />
              Complete Order
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
