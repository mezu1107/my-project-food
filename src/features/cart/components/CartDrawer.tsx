import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ShoppingCart, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useCartStore } from '../store/useCartStore';
import { useServerCart, useRemoveFromCart, useUpdateCartQuantity } from '../hooks/useCart';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';

export function CartDrawer() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { isAuthenticated } = useAuthStore();
  
  // Local cart for guests
  const localCart = useCartStore();
  
  // Server cart for authenticated users
  const { data: serverCartData, isLoading } = useServerCart();
  
  const removeFromCart = useRemoveFromCart();
  const updateQuantity = useUpdateCartQuantity();

  // Determine which cart to use
  const cartItems = isAuthenticated 
    ? serverCartData?.cart?.items || []
    : localCart.items.map(item => ({
        _id: item.id,
        menuItem: { _id: item.id, name: item.name, price: item.price, image: item.image, isAvailable: true },
        quantity: item.quantity,
        priceAtAdd: item.price,
      }));

  const total = isAuthenticated 
    ? serverCartData?.cart?.total || 0
    : localCart.subtotal;

  const itemCount = isAuthenticated
    ? cartItems.reduce((sum, item) => sum + item.quantity, 0)
    : localCart.getItemCount();

  const handleQuantityChange = (itemId: string, menuItemId: string, currentQty: number, delta: number) => {
    const newQty = currentQty + delta;
    if (newQty <= 0) {
      removeFromCart.mutate(itemId);
    } else {
      updateQuantity.mutate({ itemId, menuItemId, quantity: newQty });
    }
  };

  const handleCheckout = () => {
    setOpen(false);
    navigate('/checkout');
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {itemCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-primary"
            >
              {itemCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            Your Cart
            {itemCount > 0 && (
              <Badge variant="secondary">{itemCount} items</Badge>
            )}
          </SheetTitle>
        </SheetHeader>

        {isLoading ? (
          <div className="flex-1 space-y-4 py-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-16 w-16 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : cartItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
            <ShoppingCart className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="font-semibold text-lg mb-2">Your cart is empty</h3>
            <p className="text-muted-foreground text-sm mb-6">
              Add some delicious items to get started
            </p>
            <Button onClick={() => { setOpen(false); navigate('/menu'); }}>
              Browse Menu
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-4 py-4">
                {cartItems.map((item) => (
                  <div key={item._id} className="flex gap-3">
                    {item.menuItem?.image ? (
                      <img 
                        src={item.menuItem.image} 
                        alt={item.menuItem?.name}
                        className="h-16 w-16 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center">
                        <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">
                        {item.menuItem?.name || 'Unknown Item'}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Rs. {item.priceAtAdd}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleQuantityChange(
                            item._id, 
                            item.menuItem?._id, 
                            item.quantity, 
                            -1
                          )}
                          disabled={removeFromCart.isPending || updateQuantity.isPending}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium w-6 text-center">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleQuantityChange(
                            item._id, 
                            item.menuItem?._id, 
                            item.quantity, 
                            1
                          )}
                          disabled={updateQuantity.isPending}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">
                        Rs. {item.priceAtAdd * item.quantity}
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive mt-1"
                        onClick={() => removeFromCart.mutate(item._id)}
                        disabled={removeFromCart.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="pt-4 space-y-4">
              <Separator />
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>Rs. {total}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span className="text-muted-foreground">Calculated at checkout</span>
                </div>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>Rs. {total}</span>
              </div>
              <Button 
                className="w-full h-12 text-base" 
                onClick={handleCheckout}
              >
                Proceed to Checkout
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
