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
import { useCartStore } from "@/features/cart/store/useCartStore";

import {
  useServerCart,
  useRemoveFromCart,
  useUpdateCartQuantity,
} from "@/features/cart/hooks/useServerCart";


export const Header = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const guestCart = useCartStore();
  const { data: serverCart, isLoading: serverLoading } = useServerCart();

  const removeItem = useRemoveFromCart();
  const updateQty = useUpdateCartQuantity();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [areaModalOpen, setAreaModalOpen] = useState(false);

  // -------------------------------
  // CART SOURCE SELECTION (SERVER / GUEST)
  // -------------------------------

  const items = user ? serverCart?.items ?? [] : guestCart.items;
  const total = user ? serverCart?.total ?? 0 : guestCart.getTotal();

  const cartCount = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items]
  );

  // -------------------------------
  // LOGOUT
  // -------------------------------
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // -------------------------------
  // QUANTITY HANDLING
  // -------------------------------
  const handleQuantityChange = (cartItemId: string, delta: number) => {
    const item = items.find((i) => i._id === cartItemId);
    if (!item) return;

    const newQty = item.quantity + delta;

    if (newQty <= 0) {
      user ? removeItem.mutate(cartItemId) : guestCart.removeItem(cartItemId);
      return;
    }

    user
      ? updateQty.mutate({ itemId: cartItemId, quantity: newQty })
      : guestCart.updateQuantity(cartItemId, newQty);
  };

  // -------------------------------
  // CLEAR CART
  // -------------------------------
  const clearCart = () => {
    user ? removeItem.mutate("all") : guestCart.clearCart();
  };

  // -------------------------------
  // RENDER
  // -------------------------------
  return (
    <>
      {/* HEADER */}
      <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold shadow-lg">
                AM
              </div>

              <div className="hidden sm:block">
                <h1 className="text-lg font-bold">AM Foods</h1>
                <p className="text-xs text-muted-foreground">
                  Pakistani Cuisine
                </p>
              </div>
            </Link>

            {/* Desktop Menu */}
            <nav className="hidden lg:flex gap-8 items-center">
              {[
                { path: "/", label: "Home" },
                { path: "/menu", label: "Menu" },
                { path: "/about", label: "About" },
                { path: "/contact", label: "Contact" },
              ].map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="text-sm font-medium hover:text-primary"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Right Section */}
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

              {/* User / Login */}
              {user ? (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate("/profile")}
                  >
                    <User className="h-4 w-4 mr-2" />
                    {user.name.split(" ")[0]}
                  </Button>

                  <Button variant="ghost" size="icon" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <Button className="hidden sm:flex" onClick={() => navigate("/login")}>
                  Login
                </Button>
              )}

              {/* Mobile Menu Trigger */}
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
            <div className="flex justify-between items-center">
              <SheetTitle>Cart ({cartCount} items)</SheetTitle>

              {cartCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearCart}
                  className="text-destructive"
                >
                  Clear All
                </Button>
              )}
            </div>
          </SheetHeader>

          {/* Cart Items */}
          <ScrollArea className="flex-1 mt-4 px-1">
            {serverLoading ? (
              [...Array(3)].map((_, idx) => (
                <Skeleton key={idx} className="h-24 w-full rounded-lg mb-3" />
              ))
            ) : items.length === 0 ? (
              <div className="h-full flex flex-col justify-center items-center text-muted-foreground">
                <Package className="h-16 w-16 mb-2" />
                Your cart is empty
              </div>
            ) : (
              items.map((item) => (
                <div key={item._id} className="flex gap-3 p-3 border-b">

                  <img
                    src={item.menuItem.image || ""}
                    className="w-20 h-20 rounded-lg object-cover bg-muted"
                  />

                  <div className="flex-1">
                    <p className="font-semibold">{item.menuItem.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Rs. {item.priceAtAdd.toFixed(2)}
                    </p>

                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => handleQuantityChange(item._id, -1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>

                      <span className="font-medium">{item.quantity}</span>

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
                        className="text-destructive ml-auto"
                        onClick={() =>
                          user
                            ? removeItem.mutate(item._id)
                            : guestCart.removeItem(item._id)
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="text-right font-semibold">
                    Rs. {(item.priceAtAdd * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))
            )}
          </ScrollArea>

          {/* Footer */}
          <div className="py-4 border-t space-y-3">
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span>Rs. {total.toFixed(2)}</span>
            </div>

            {cartCount > 0 && (
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" onClick={() => navigate("/cart")}>
                  View Cart
                </Button>

                <Button onClick={() => navigate("/checkout")}>
                  Checkout
                </Button>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* AREA SELECTOR MODAL */}
      <ServiceAreaModal
        isOpen={areaModalOpen}
        onClose={() => setAreaModalOpen(false)}
      />
    </>
  );
};
