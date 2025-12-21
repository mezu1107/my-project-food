// src/features/cart/pages/CartPage.tsx
import { useEffect, useRef } from 'react'; // ← Add useRef
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ShoppingBag, Minus, Plus, Trash2, ArrowLeft, Package } from 'lucide-react';

import { useAuthStore } from '@/features/auth/store/authStore';
import { useCartStore } from '@/features/cart/hooks/useCartStore';
import {
  useServerCartQuery,
  useUpdateCartQuantity,
  useRemoveFromCart,
  useClearCart,
} from '@/features/cart/hooks/useServerCart';
import type { CartItem } from '@/types/cart.types';

export default function CartPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const guestCart = useCartStore();

  const isGuest = !user;

  const { data: serverData, isLoading } = useServerCartQuery();
  const serverItems: CartItem[] = serverData?.items ?? [];
  const serverTotal = serverData?.total ?? 0;

  const hasSyncedRef = useRef(false);

  useEffect(() => {
    if (!isGuest && serverData?.items && !hasSyncedRef.current) {
      hasSyncedRef.current = true;
      guestCart.syncWithServer(serverData.items);
    }
  }, [isGuest, serverData?.items, guestCart]);

  useEffect(() => {
    if (isGuest) {
      hasSyncedRef.current = false;
    }
  }, [isGuest]);

  const items: CartItem[] = isGuest ? guestCart.items : serverItems;
  const total = isGuest ? guestCart.getTotal() : serverTotal;
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  const updateQty = useUpdateCartQuantity();
  const removeItem = useRemoveFromCart();
  const clearCart = useClearCart();

  const handleQuantityChange = (itemId: string, delta: number) => {
    const item = items.find((i) => i._id === itemId);
    if (!item) return;

    const newQty = item.quantity + delta;

    if (newQty <= 0) {
      handleRemove(itemId);
      return;
    }

    const safeQty = Math.min(newQty, 50);

    if (isGuest) {
      guestCart.updateQuantity(itemId, safeQty);
    } else {
      updateQty.mutate({ itemId, quantity: safeQty });
    }
  };

  const handleRemove = (itemId: string) => {
    if (isGuest) {
      guestCart.removeItem(itemId);
    } else {
      removeItem.mutate(itemId);
    }
  };

  const handleClearCart = () => {
    if (isGuest) {
      guestCart.clearCart();
    } else {
      clearCart.mutate();
    }
  };

  if (isLoading && !isGuest) {
    return (
      <div className="container py-16 text-center">
        <p className="text-lg">Loading your cart...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container max-w-4xl mx-auto py-16 px-4 text-center">
        <Package className="h-24 w-24 text-muted-foreground/30 mx-auto mb-6" />
        <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
        <p className="text-muted-foreground mb-8">
          Looks like you haven't added anything to your cart yet.
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" onClick={() => navigate('/menu/all')}>
            Browse Menu
          </Button>
          <Button variant="outline" size="lg" onClick={() => navigate('/')}>
            Go Home
          </Button>
        </div>
      </div>
    );
  }
  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold">Your Cart</h1>
        <Badge variant="secondary" className="ml-auto text-base px-3 py-1">
          {itemCount} {itemCount === 1 ? 'item' : 'items'}
        </Badge>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" /> Items
              </h2>
              <Button variant="destructive" size="sm" onClick={handleClearCart}>
                Clear All
              </Button>
            </div>

            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item._id}
                    className="flex gap-4 p-5 border rounded-lg hover:bg-muted/50 transition"
                  >
                    {item.menuItem.image ? (
                      <img
                        src={item.menuItem.image}
                        alt={item.menuItem.name}
                        className="w-28 h-28 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="bg-muted border-2 border-dashed rounded-lg w-28 h-28 flex items-center justify-center">
                        <Package className="h-12 w-12 text-muted-foreground/40" />
                      </div>
                    )}

                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">{item.menuItem.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Rs. {item.priceAtAdd.toFixed(2)} each
                      </p>

                      <div className="flex items-center gap-3 mt-4">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => handleQuantityChange(item._id, -1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-12 text-center font-bold text-lg">
                          {item.quantity}
                        </span>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => handleQuantityChange(item._id, +1)}
                          disabled={item.quantity >= 50}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>

                        <Button
                          size="icon"
                          variant="ghost"
                          className="ml-auto text-destructive"
                          onClick={() => handleRemove(item._id)}
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-2xl font-bold">
                        Rs. {(item.priceAtAdd * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-card border rounded-xl p-6 sticky top-24">
            <h2 className="text-xl font-semibold mb-6">Order Summary</h2>

            <div className="space-y-4">
              <div className="flex justify-between text-lg">
                <span>Subtotal ({itemCount} items)</span>
                <span className="font-bold">Rs. {total.toFixed(2)}</span>
              </div>

              <Separator />

              <div className="text-sm text-muted-foreground space-y-2">
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span>Calculated at checkout</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>Included</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between text-2xl font-bold pt-4">
                <span>Total</span>
                <span>Rs. {total.toFixed(2)}</span>
              </div>

              <div className="space-y-3 mt-8">
                <Button
                  size="lg"
                  className="w-full"
                  onClick={() => navigate('/checkout')}
                >
                  Proceed to Checkout
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate('/menu/all')}
                >
                  Continue Shopping
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}