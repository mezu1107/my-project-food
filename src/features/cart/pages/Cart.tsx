// src/features/cart/pages/CartPage.tsx
import { useEffect, useRef } from 'react';
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
  useUpdateCartItem,
  useRemoveFromCart,
  useClearCart,
} from '@/features/cart/hooks/useServerCart';
import type { CartItem } from '@/types/cart.types';

export default function CartPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const guestCart = useCartStore();

  const isGuest = !user;

  const { data: cartData, isLoading } = useServerCartQuery();
  const hasSyncedRef = useRef(false);

  useEffect(() => {
    if (!isGuest && cartData && cartData.items.length > 0 && !hasSyncedRef.current) {
      hasSyncedRef.current = true;
      guestCart.syncWithServer({
        items: cartData.items,
        orderNote: cartData.orderNote,
      });
    }
  }, [isGuest, cartData, guestCart]);

  useEffect(() => {
    if (isGuest) hasSyncedRef.current = false;
  }, [isGuest]);

  const items: CartItem[] = isGuest ? guestCart.items : (cartData?.items ?? []);
  const total = isGuest ? guestCart.getTotal() : (cartData?.total ?? 0);
  const orderNote = isGuest ? guestCart.orderNote : (cartData?.orderNote ?? '');
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  const updateItemMutation = useUpdateCartItem();
  const removeItem = useRemoveFromCart();
  const clearCart = useClearCart();

  const handleQuantityChange = (itemId: string, delta: number) => {
    const item = items.find(i => i._id === itemId);
    if (!item) return;

    const newQty = item.quantity + delta;
    if (newQty <= 0) {
      handleRemove(itemId);
      return;
    }

    const safeQty = Math.min(newQty, 50);

    if (isGuest) {
      guestCart.updateItem(itemId, { quantity: safeQty });
    } else {
      updateItemMutation.mutate({ itemId, updates: { quantity: safeQty } });
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
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Looks like you haven't added anything yet. Explore our delicious menu!
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
    <div className="container max-w-5xl mx-auto py-8 px-4">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold">Your Cart</h1>
        <Badge variant="secondary" className="ml-auto text-lg px-4 py-1">
          {itemCount} {itemCount === 1 ? 'item' : 'items'}
        </Badge>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <ShoppingBag className="h-7 w-7" />
                Cart Items
              </h2>
              <Button variant="destructive" onClick={handleClearCart}>
                Clear All
              </Button>
            </div>

            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-6">
                {items.map((item) => (
                  <div key={item._id} className="flex gap-6 p-6 border rounded-xl hover:bg-muted/30 transition">
                    {item.menuItem.image ? (
                      <img
                        src={item.menuItem.image}
                        alt={item.menuItem.name}
                        className="w-32 h-32 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="w-32 h-32 bg-muted rounded-xl flex items-center justify-center">
                        <Package className="h-14 w-14 text-muted-foreground/40" />
                      </div>
                    )}

                    <div className="flex-1 space-y-3">
                      <h3 className="text-xl font-bold">{item.menuItem.name}</h3>

                      {(item.sides?.length || item.drinks?.length || item.addOns?.length || item.specialInstructions) && (
                        <div className="text-sm text-muted-foreground space-y-1 bg-muted/50 p-3 rounded-lg">
                          {item.sides?.length > 0 && <p>• Sides: {item.sides.join(', ')}</p>}
                          {item.drinks?.length > 0 && <p>• Drinks: {item.drinks.join(', ')}</p>}
                          {item.addOns?.length > 0 && <p>• Add-ons: {item.addOns.join(', ')}</p>}
                          {item.specialInstructions && <p>• Note: {item.specialInstructions}</p>}
                        </div>
                      )}

                      <p className="text-muted-foreground">
                        Rs. {item.priceAtAdd.toFixed(2)} each
                      </p>

                      <div className="flex items-center gap-4">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => handleQuantityChange(item._id, -1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="font-bold text-xl w-14 text-center">{item.quantity}</span>
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

        <div className="space-y-6">
          <div className="bg-card border rounded-2xl p-6 sticky top-24">
            <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

            <div className="space-y-4">
              <div className="flex justify-between text-lg">
                <span>Subtotal ({itemCount} items)</span>
                <span className="font-bold">Rs. {total.toFixed(2)}</span>
              </div>

              {orderNote && (
                <div className="bg-muted/50 rounded-lg p-4 text-sm">
                  <p className="font-medium mb-1">Order Note:</p>
                  <p className="text-muted-foreground">{orderNote}</p>
                </div>
              )}

              <Separator />

              <div className="text-sm text-muted-foreground space-y-2">
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span>Calculated at checkout</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes</span>
                  <span>Included</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between text-3xl font-bold pt-4">
                <span>Total</span>
                <span>Rs. {total.toFixed(2)}</span>
              </div>

              <div className="space-y-4 mt-8">
                <Button size="lg" className="w-full text-lg py-6" onClick={() => navigate('/checkout')}>
                  Proceed to Checkout
                </Button>
                <Button variant="outline" size="lg" className="w-full" onClick={() => navigate('/menu/all')}>
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