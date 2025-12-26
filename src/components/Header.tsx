// src/components/Header.tsx
// PRODUCTION-READY — DECEMBER 26, 2025
// Mobile-first, responsive, fully functional cart drawer + area modal

import { useEffect, useMemo, useRef, useState } from "react";
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
  X,
  
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator"; // ← add this
import ServiceAreaModal from "@/components/ServiceAreaModal";
import { useAuthStore } from "@/features/auth/store/authStore";
import { useCartStore } from "@/features/cart/hooks/useCartStore";
import {
  useServerCartQuery,
  useUpdateCartItem,
  useRemoveFromCart,
  useClearCart,
} from "@/features/cart/hooks/useServerCart";
import { CartItem } from "@/types/cart.types";

export const Header = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const guestCart = useCartStore();
  const { data: cartData, isLoading: cartLoading } = useServerCartQuery();

  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveFromCart();
  const clearCartMutation = useClearCart();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [areaModalOpen, setAreaModalOpen] = useState(false);

  const isLoggedIn = !!user;

  // Unified cart data
  const items: CartItem[] = isLoggedIn ? (cartData?.items ?? []) : guestCart.items;
  const total = isLoggedIn ? (cartData?.total ?? 0) : guestCart.getTotal();

  // Optimized cart count
  const cartCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  // Handle quantity change
  const handleQuantityChange = (itemId: string, delta: number) => {
    const item = items.find((i) => i._id === itemId);
    if (!item) return;

    const newQty = item.quantity + delta;

    if (newQty <= 0) {
      handleRemoveItem(itemId);
      return;
    }

    const cappedQty = Math.min(newQty, 50);

    if (isLoggedIn) {
      updateItem.mutate({ itemId, updates: { quantity: cappedQty } });
    } else {
      guestCart.updateItem(itemId, { quantity: cappedQty });
    }
  };

  // Remove item
  const handleRemoveItem = (itemId: string) => {
    if (isLoggedIn) {
      removeItem.mutate(itemId);
    } else {
      guestCart.removeItem(itemId);
    }
  };

  // Clear cart
  const handleClearCart = () => {
    if (isLoggedIn) {
      clearCartMutation.mutate();
    } else {
      guestCart.clearCart();
    }
  };

  // Logout
  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate("/");
  };

  return (
    <>
      {/* MAIN HEADER */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 flex-shrink-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-green-600 to-emerald-600 text-white font-bold text-xl shadow-md">
                AM
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold leading-tight">AM Foods</h1>
                <p className="text-xs text-muted-foreground leading-tight">
                  Authentic Pakistani Cuisine
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              {[
                { to: "/", label: "Home" },
                { to: "/menu/all", label: "Menu" },
                { to: "/about", label: "About" },
                { to: "/contact", label: "Contact" },
              ].map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {label}
                </Link>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Select Area Button */}
              <Button
                variant="outline"
                className="hidden md:flex items-center gap-2 rounded-full"
                onClick={() => setAreaModalOpen(true)}
              >
                <MapPin className="h-4 w-4" />
                <span className="hidden lg:inline">Select Area</span>
              </Button>

              {/* Cart Button with Badge */}
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => setCartOpen(true)}
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs font-bold">
                    {cartCount}
                  </Badge>
                )}
              </Button>

              {/* Auth Actions */}
              {isLoggedIn ? (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hidden sm:flex items-center gap-2"
                    onClick={() => navigate("/dashboard")}
                  >
                    <User className="h-4 w-4" />
                    {user?.name.split(" ")[0]}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    aria-label="Logout"
                  >
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

      {/* MOBILE MENU SHEET */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="right" className="w-full sm:max-w-sm">
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <div className="mt-8 space-y-4">
            <Button
              variant="ghost"
              className="w-full justify-start text-lg"
              onClick={() => {
                setMobileMenuOpen(false);
                setAreaModalOpen(true);
              }}
            >
              <MapPin className="mr-3 h-5 w-5" />
              Select Delivery Area
            </Button>

            <Separator />

            {[
              { to: "/", label: "Home" },
              { to: "/menu/all", label: "Menu" },
              { to: "/about", label: "About" },
              { to: "/contact", label: "Contact" },
            ].map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full"
              >
                <Button variant="ghost" className="w-full justify-start text-lg">
                  {label}
                </Button>
              </Link>
            ))}

            <Separator />

            {isLoggedIn ? (
              <>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-lg"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate("/dashboard");
                  }}
                >
                  <User className="mr-3 h-5 w-5" />
                  Dashboard
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-lg text-destructive hover:text-destructive"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-3 h-5 w-5" />
                  Logout
                </Button>
              </>
            ) : (
              <Button
                className="w-full text-lg"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate("/login");
                }}
              >
                Login
              </Button>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* CART DRAWER */}
      <Sheet open={cartOpen} onOpenChange={setCartOpen}>
        <SheetContent className="flex flex-col w-full sm:max-w-md">
          <SheetHeader className="border-b pb-4">
            <div className="flex items-center justify-between">
              <SheetTitle className="flex items-center gap-2">
                <ShoppingCart className="h-6 w-6" />
                Your Cart
                {cartCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {cartCount} items
                  </Badge>
                )}
              </SheetTitle>
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

          <ScrollArea className="flex-1 my-6">
            <div className="space-y-4 pr-4">
              {cartLoading && isLoggedIn ? (
                // Skeleton loader
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex gap-4 animate-pulse">
                    <Skeleton className="h-24 w-24 rounded-xl" />
                    <div className="flex-1 space-y-3">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-10 w-32" />
                    </div>
                    <Skeleton className="h-10 w-20" />
                  </div>
                ))
              ) : items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-20 text-center">
                  <Package className="h-24 w-24 text-muted-foreground/30 mb-6" />
                  <h3 className="text-xl font-semibold mb-2">Your cart is empty</h3>
                  <p className="text-muted-foreground mb-6">
                    Add delicious items from the menu to get started
                  </p>
                  <Button
                    onClick={() => {
                      setCartOpen(false);
                      navigate("/menu/all");
                    }}
                  >
                    Browse Menu
                  </Button>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item._id}
                    className="flex gap-4 p-4 bg-card rounded-xl border hover:shadow-sm transition"
                  >
                    {item.menuItem.image ? (
                      <img
                        src={item.menuItem.image}
                        alt={item.menuItem.name}
                        className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                        <Package className="h-12 w-12 text-muted-foreground/40" />
                      </div>
                    )}

                    <div className="flex-1">
                      <h4 className="font-semibold line-clamp-2">{item.menuItem.name}</h4>

                      {/* Customizations */}
                      {(item.sides?.length || item.drinks?.length || item.addOns?.length || item.specialInstructions) && (
                        <div className="mt-2 text-xs text-muted-foreground space-y-1">
                          {item.sides?.length > 0 && <p>• Sides: {item.sides.join(", ")}</p>}
                          {item.drinks?.length > 0 && <p>• Drinks: {item.drinks.join(", ")}</p>}
                          {item.addOns?.length > 0 && <p>• Add-ons: {item.addOns.join(", ")}</p>}
                          {item.specialInstructions && <p>• Note: {item.specialInstructions}</p>}
                        </div>
                      )}

                      <p className="mt-2 text-sm text-muted-foreground">
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

                        <span className="font-bold text-lg w-12 text-center">{item.quantity}</span>

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
                          onClick={() => handleRemoveItem(item._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-xl">
                        Rs. {(item.priceAtAdd * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>

          {/* Cart Footer */}
          {cartCount > 0 && (
            <div className="border-t pt-6 space-y-6">
              <div className="flex justify-between text-2xl font-bold">
                <span>Total</span>
                <span>Rs. {total.toFixed(2)}</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    setCartOpen(false);
                    navigate("/cart");
                  }}
                >
                  View Cart
                </Button>
                <Button
                  size="lg"
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
      <ServiceAreaModal isOpen={areaModalOpen} onClose={() => setAreaModalOpen(false)} />
    </>
  );
};