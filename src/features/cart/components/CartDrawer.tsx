// src/features/cart/components/CartDrawer.tsx
import { useEffect, useState, useRef } from 'react'; // ← Add useRef
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

import { useAuthStore } from '@/features/auth/store/authStore';
import { useCartStore } from '@/features/cart/hooks/useCartStore';
import {
  useServerCartQuery,
  useUpdateCartQuantity,
  useRemoveFromCart,
  useClearCart,
} from '@/features/cart/hooks/useServerCart';
import type { CartItem } from '@/types/cart.types';

export const CartDrawer = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const guestCart = useCartStore();
  const { data: serverData, isLoading } = useServerCartQuery();

  const isGuest = !user;

  // Prevent infinite loop by tracking if we've already synced
  const hasSyncedRef = useRef(false);

  useEffect(() => {
    if (!isGuest && serverData?.items && !hasSyncedRef.current) {
      hasSyncedRef.current = true;
      guestCart.syncWithServer(serverData.items);
    }
  }, [isGuest, serverData?.items, guestCart]);

  // Reset sync flag when switching to guest
  useEffect(() => {
    if (isGuest) {
      hasSyncedRef.current = false;
    }
  }, [isGuest]);

  const items = isGuest ? guestCart.items : (serverData?.items ?? []);
  const total = isGuest ? guestCart.getTotal() : (serverData?.total ?? 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  const updateQty = useUpdateCartQuantity();
  const removeItem = useRemoveFromCart();
  const clearCart = useClearCart();

  const handleQuantityChange = (itemId: string, newQty: number) => {
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
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              {itemCount}
            </span>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent className="flex flex-col w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-6 w-6" />
              Your Cart
            </div>
            {itemCount > 0 && (
              <Button variant="ghost" size="sm" onClick={handleClear}>
                Clear
              </Button>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          {isLoading && !isGuest ? (
            <p className="text-center py-8 text-muted-foreground">Loading cart...</p>
          ) : items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <ShoppingCart className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-medium">Your cart is empty</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Browse the menu to add delicious items.
              </p>
              <Button
                className="mt-6"
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
              <ScrollArea className="flex-1 -mx-6 px-6">
                <div className="space-y-4 py-4">
                  {items.map((item) => (
                    <div key={item._id} className="flex gap-4">
                      {item.menuItem.image ? (
                        <img
                          src={item.menuItem.image}
                          alt={item.menuItem.name}
                          className="w-20 h-20 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center">
                          <ShoppingCart className="h-8 w-8 text-muted-foreground/40" />
                        </div>
                      )}

                      <div className="flex-1 space-y-2">
                        <h4 className="font-medium text-base">{item.menuItem.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Rs. {item.priceAtAdd.toFixed(2)} each
                        </p>

                        <div className="flex items-center gap-2 mt-3">
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>

                          <span className="w-12 text-center font-medium text-base">
                            {item.quantity}
                          </span>

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
                        <p className="font-semibold">
                          Rs. {(item.priceAtAdd * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="border-t pt-6 space-y-4">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>Rs. {total.toFixed(2)}</span>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setOpen(false);
                      navigate('/cart');
                    }}
                  >
                    View Cart
                  </Button>
                  <Button
                    onClick={() => {
                      setOpen(false);
                      navigate('/checkout');
                    }}
                  >
                    Checkout
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};