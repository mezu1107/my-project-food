// src/features/cart/components/CartDrawer.tsx
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

import { useAuthStore } from '@/features/auth/store/authStore';
import { useCartStore } from '@/features/cart/hooks/useCartStore';
import {
  useServerCartQuery,
  useUpdateCartItem,
  useRemoveFromCart,
  useClearCart,
} from '@/features/cart/hooks/useServerCart';
import type { CartItem } from '@/types/cart.types';

export const CartDrawer = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const guestCart = useCartStore();
  const { data: cartData, isLoading } = useServerCartQuery(); // ← transformed data

  const isGuest = !user;
  const hasSyncedRef = useRef(false);

  // Sync logged-in cart to local store once
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
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const updateItemMutation = useUpdateCartItem();
  const removeItem = useRemoveFromCart();
  const clearCart = useClearCart();

  const handleQuantityChange = (itemId: string, newQty: number) => {
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

  const handleClear = () => {
    if (isGuest) {
      guestCart.clearCart();
    } else {
      clearCart.mutate();
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {itemCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs font-bold">
              {itemCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent className="flex flex-col w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-6 w-6" />
              Your Cart ({itemCount})
            </div>
            {itemCount > 0 && (
              <Button variant="ghost" size="sm" onClick={handleClear}>
                Clear all
              </Button>
            )}
          </SheetTitle>
        </SheetHeader>

        <Separator className="my-4" />

        <div className="flex-1 flex flex-col">
          {isLoading && !isGuest ? (
            <p className="text-center py-8 text-muted-foreground">Loading cart...</p>
          ) : items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-4">
              <ShoppingCart className="h-20 w-20 text-muted-foreground/30" />
              <h3 className="text-xl font-semibold">Your cart is empty</h3>
              <p className="text-muted-foreground">Add items from the menu to get started!</p>
              <Button
                onClick={() => {
                  setOpen(false);
                  navigate('/menu/all');
                }}
              >
                Browse Menu
              </Button>
            </div>
          ) : (
            <>
              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-6 pb-6">
                  {items.map((item) => (
                    <div key={item._id} className="flex gap-4">
                      {item.menuItem.image ? (
                        <img
                          src={item.menuItem.image}
                          alt={item.menuItem.name}
                          className="w-24 h-24 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="w-24 h-24 bg-muted rounded-xl flex items-center justify-center">
                          <ShoppingCart className="h-10 w-10 text-muted-foreground/40" />
                        </div>
                      )}

                      <div className="flex-1 space-y-2">
                        <h4 className="font-semibold text-lg">{item.menuItem.name}</h4>

                        {(item.sides?.length || item.drinks?.length || item.addOns?.length || item.specialInstructions) && (
                          <div className="text-sm text-muted-foreground space-y-1">
                            {item.sides?.length > 0 && <p>• Sides: {item.sides.join(', ')}</p>}
                            {item.drinks?.length > 0 && <p>• Drinks: {item.drinks.join(', ')}</p>}
                            {item.addOns?.length > 0 && <p>• Add-ons: {item.addOns.join(', ')}</p>}
                            {item.specialInstructions && <p>• Note: {item.specialInstructions}</p>}
                          </div>
                        )}

                        <p className="text-sm text-muted-foreground">
                          Rs. {item.priceAtAdd.toFixed(2)} × {item.quantity}
                        </p>

                        <div className="flex items-center gap-3">
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>

                          <span className="font-bold text-lg w-10 text-center">{item.quantity}</span>

                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
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
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-bold text-lg">
                          Rs. {(item.priceAtAdd * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="border-t pt-6 space-y-6">
                {orderNote && (
                  <div className="bg-muted/50 rounded-lg p-3 text-sm">
                    <p className="font-medium">Order Note:</p>
                    <p className="text-muted-foreground">{orderNote}</p>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total</span>
                    <span>Rs. {total.toFixed(2)}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => {
                        setOpen(false);
                        navigate('/cart');
                      }}
                    >
                      View Full Cart
                    </Button>
                    <Button
                      size="lg"
                      onClick={() => {
                        setOpen(false);
                        navigate('/checkout');
                      }}
                    >
                      Checkout
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};