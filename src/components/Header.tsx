// src/components/Header.tsx
import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  User,
  Menu,
  LogOut,
  MapPin,
  Package,
  Plus,
  Minus,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

import ServiceAreaModal from "@/components/ServiceAreaModal";
import { useAuthStore } from "@/features/auth/store/authStore";
import { useCartStore } from "@/features/cart/hooks/useCartStore"; // ← correct path
import {
  useServerCartQuery,
  useRemoveFromCart,
  useUpdateCartQuantity,
  useClearCart, // ← for server clear
} from "@/features/cart/hooks/useServerCart";
import { CartItem } from "@/types/cart.types";

export const Header = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const guestCart = useCartStore();
  const {
    data: serverData,
    isLoading: serverLoading,
  } = useServerCartQuery();

  const removeItem = useRemoveFromCart();
  const updateQty = useUpdateCartQuantity();
  const clearCartMutation = useClearCart(); // server clear

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [areaModalOpen, setAreaModalOpen] = useState(false);

  const isLoggedIn = !!user;

  // Unified cart items & total
  const items: CartItem[] = isLoggedIn
    ? serverData?.items ?? []
    : guestCart.items;

  const total = isLoggedIn
    ? serverData?.total ?? 0
    : guestCart.getTotal();

  const cartCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  // Logout handler
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Quantity change (increment/decrement)
  const handleQuantityChange = (cartItemId: string, delta: number) => {
    const item = items.find((i) => i._id === cartItemId);
    if (!item) return;

    const newQuantity = item.quantity + delta;

    if (newQuantity <= 0) {
      // Remove item
      if (isLoggedIn) {
        removeItem.mutate(cartItemId);
      } else {
        guestCart.removeItem(cartItemId);
      }
      return;
    }

    // Update quantity (capped at 50)
    const cappedQuantity = Math.min(newQuantity, 50);

    if (isLoggedIn) {
      updateQty.mutate({ itemId: cartItemId, quantity: cappedQuantity });
    } else {
      guestCart.updateQuantity(cartItemId, cappedQuantity);
    }
  };

  // Direct remove
  const handleRemoveItem = (cartItemId: string) => {
    if (isLoggedIn) {
      removeItem.mutate(cartItemId);
    } else {
      guestCart.removeItem(cartItemId);
    }
  };

  // Clear entire cart
  const handleClearCart = () => {
    if (isLoggedIn) {
      clearCartMutation.mutate();
    } else {
      guestCart.clearCart();
    }
  };

  return (
    <>
      {/* MAIN HEADER */}
      <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold text-xl shadow-lg">
                AM
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold">AM Foods</h1>
                <p className="text-xs text-muted-foreground">Pakistani Cuisine</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              {[
                { path: "/", label: "Home" },
                { path: "/menu/all", label: "Menu" },
                { path: "/about", label: "About" },
                { path: "/contact", label: "Contact" },
              ].map(({ path, label }) => (
                <Link
                  key={path}
                  to={path}
                  className="text-sm font-medium hover:text-primary transition"
                >
                  {label}
                </Link>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Area Selector */}
              <Button
                variant="outline"
                className="hidden md:flex items-center gap-2 rounded-full px-4"
                onClick={() => setAreaModalOpen(true)}
              >
                <MapPin className="h-4 w-4 text-green-600" />
                Select Area
              </Button>

              {/* Cart Button */}
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => setCartOpen(true)}
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-primary text-xs rounded-full flex items-center justify-center text-primary-foreground font-bold">
                    {cartCount}
                  </span>
                )}
              </Button>

              {/* Auth Buttons */}
              {isLoggedIn ? (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate("/dashboard")}
                  >
                    <User className="h-4 w-4 mr-2" />
                    {user.name.split(" ")[0]}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <Button
                  className="hidden sm:flex"
                  onClick={() => navigate("/login")}
                >
                  Login
                </Button>
              )}

              {/* Mobile Menu */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* CART DRAWER */}
      <Sheet open={cartOpen} onOpenChange={setCartOpen}>
        <SheetContent className="w-full sm:max-w-md flex flex-col">
          <SheetHeader>
            <div className="flex items-center justify-between">
              <SheetTitle>Cart ({cartCount} items)</SheetTitle>
              {cartCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearCart}
                  className="text-destructive hover:text-destructive"
                >
                  Clear All
                </Button>
              )}
            </div>
          </SheetHeader>

<ScrollArea className="flex-1 mt-4 -mx-6 px-6">
  {serverLoading && isLoggedIn ? (
    <div key="loading-state" className="space-y-4 py-4">
      {[1, 2, 3].map((id) => (
        <div
          key={`cart-skeleton-${id}`}
          className="flex gap-4 py-4 border-b last:border-0 animate-pulse"
        >
          <Skeleton className="w-20 h-20 rounded-lg flex-shrink-0" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex items-center gap-2 mt-3">
              <Skeleton className="h-9 w-9 rounded-md" />
              <Skeleton className="h-9 w-12 rounded-md" />
              <Skeleton className="h-9 w-9 rounded-md" />
              <Skeleton className="h-9 w-9 rounded-md ml-auto" />
            </div>
          </div>
          <Skeleton className="h-8 w-20 ml-auto" />
        </div>
      ))}
    </div>
  ) : items.length === 0 ? (
    <div
      key="empty-state"
      className="h-full flex flex-col items-center justify-center text-center text-muted-foreground py-12"
    >
      <Package className="h-20 w-20 mb-4 opacity-30" />
      <p className="text-lg font-medium">Your cart is empty</p>
      <p className="text-sm mt-2">Add items from the menu to get started</p>
    </div>
  ) : (
    <div key="items-state" className="space-y-4 py-4">
      {items.map((item, index) => (
        <div
          key={`${item._id}-${item.menuItem._id}-${index}`}
          className="flex gap-4 py-4 border-b last:border-0"
        >
          {item.menuItem.image ? (
            <img
              src={item.menuItem.image}
              alt={item.menuItem.name}
              className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
              <Package className="h-10 w-10 text-muted-foreground/40" />
            </div>
          )}

          <div className="flex-1">
            <h4 className="font-medium">{item.menuItem.name}</h4>
            <p className="text-sm text-muted-foreground">
              Rs. {item.priceAtAdd.toFixed(2)} each
            </p>

            <div className="flex items-center gap-2 mt-3">
              <Button
                size="icon"
                variant="outline"
                onClick={() => handleQuantityChange(item._id, -1)}
              >
                <Minus className="h-4 w-4" />
              </Button>

              <span className="w-10 text-center font-semibold">
                {item.quantity}
              </span>

              <Button
                size="icon"
                variant="outline"
                onClick={() => handleQuantityChange(item._id, +1)}
              >
                <Plus className="h-4 w-4" />
              </Button>

              <Button
                size="icon"
                variant="ghost"
                className="ml-auto text-destructive"
                onClick={() => handleRemoveItem(item._id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="text-right">
            <p className="font-semibold text-lg">
              Rs. {(item.priceAtAdd * item.quantity).toFixed(2)}
            </p>
          </div>
        </div>
      ))}
    </div>
  )}
</ScrollArea>

          {/* Cart Footer */}
          {cartCount > 0 && (
            <div className="border-t pt-4 space-y-4">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>Rs. {total.toFixed(2)}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setCartOpen(false);
                    navigate("/cart");
                  }}
                >
                  View Cart
                </Button>
                <Button
                  onClick={() => {
                    setCartOpen(false);
                    navigate("/checkout");
                  }}
                >
                  Checkout
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* SERVICE AREA MODAL */}
      <ServiceAreaModal
        isOpen={areaModalOpen}
        onClose={() => setAreaModalOpen(false)}
      />
    </>
  );
};