// src/components/Header.tsx
// FINAL PRODUCTION — JANUARY 12, 2026
// Fully responsive (mobile → desktop), warm saffron-orange theme
// Features: Notification Center, cart badge, smooth mobile menu

import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  User,
  Menu,
  LogOut,
  MapPin,
  Bell,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import ServiceAreaModal from "@/components/ServiceAreaModal";
import NotificationCenter from "@/features/notifications/components/NotificationCenter";
import { useAuthStore } from "@/features/auth/store/authStore";
import { useCartStore } from "@/features/cart/hooks/useCartStore";
import { useServerCartQuery } from "@/features/cart/hooks/useServerCart";

export const Header = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const guestCart = useCartStore();
  const { data: cartData } = useServerCartQuery();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [areaModalOpen, setAreaModalOpen] = useState(false);

  const isLoggedIn = !!user;

  // Cart count (unified guest + logged-in)
  const cartCount = useMemo(() => {
    const items = isLoggedIn ? cartData?.items ?? [] : guestCart.items;
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [isLoggedIn, cartData?.items, guestCart.items]);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate("/");
  };

  return (
    <>
      {/* Header Bar */}
      <header className="sticky top-0 z-50 w-full border-b border-orange-200/60 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex h-16 items-center justify-between">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative h-10 w-10 overflow-hidden rounded-xl shadow-lg ring-2 ring-orange-300/50 transition-transform group-hover:scale-105">
                <img
                  src="/logo.jpeg"
                  alt="AlTawakkalfoods"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                  AlTawakkalfoods
                </h1>
                <p className="text-xs text-amber-700/80">Authentic Pakistani Taste</p>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-10">
              {[
                { to: "/", label: "Home" },
                { to: "/menu/all", label: "Menu" },
                { to: "/about", label: "About" },
                { to: "/contact", label: "Contact" },
              ].map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className="text-base font-medium text-gray-700 hover:text-orange-600 transition-colors"
                >
                  {label}
                </Link>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-3 md:gap-5">

              {/* Area Selector (Desktop) */}
              <Button
                variant="outline"
                size="sm"
                className="hidden md:flex items-center gap-2 border-orange-300 text-orange-700 hover:bg-orange-50"
                onClick={() => setAreaModalOpen(true)}
              >
                <MapPin className="h-4 w-4" />
                <span className="hidden xl:inline">Delivery Area</span>
              </Button>

              {/* Cart */}
              <Button
                variant="ghost"
                size="icon"
                className="relative h-10 w-10 rounded-full hover:bg-orange-50 transition-colors"
                onClick={() => navigate("/cart")}
                aria-label={`Shopping cart (${cartCount} items)`}
              >
                <ShoppingCart className="h-5 w-5 text-gray-800" />
                {cartCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-[10px] bg-orange-600 border-2 border-white flex items-center justify-center">
                    {cartCount > 9 ? '9+' : cartCount}
                  </Badge>
                )}
              </Button>

              {/* Notifications */}
              <NotificationCenter />

              {/* Auth / User (Desktop) */}
              <div className="hidden md:flex items-center gap-4">
                {isLoggedIn ? (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2 hover:bg-orange-50"
                      onClick={() => navigate("/dashboard")}
                    >
                      <User className="h-4 w-4" />
                      {user?.name?.split(" ")[0] || "Account"}
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:bg-orange-50"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-5 w-5 text-red-600" />
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-full px-6"
                    onClick={() => navigate("/login")}
                  >
                    Login
                  </Button>
                )}
              </div>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Sheet */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="right" className="w-full sm:w-80 bg-white/95 backdrop-blur-lg">
          <SheetHeader>
            <SheetTitle className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              AlTawakkalfoods
            </SheetTitle>
          </SheetHeader>

          <div className="mt-8 space-y-6">
            {/* Quick Actions */}
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start text-lg gap-3 border-orange-300"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setAreaModalOpen(true);
                }}
              >
                <MapPin className="h-5 w-5 text-orange-600" />
                Select Delivery Area
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start text-lg gap-3 border-orange-300"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Bell className="h-5 w-5 text-orange-600" />
                Notifications
              </Button>
            </div>

            <Separator className="bg-orange-200/50" />

            {/* Main Links */}
            <nav className="space-y-2">
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
                  className="block"
                >
                  <Button variant="ghost" className="w-full justify-start text-lg">
                    {label}
                  </Button>
                </Link>
              ))}
            </nav>

            <Separator className="bg-orange-200/50" />

            {/* Auth Section */}
            {isLoggedIn ? (
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start text-lg gap-3"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate("/dashboard");
                  }}
                >
                  <User className="h-5 w-5" />
                  My Account
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start text-lg gap-3 text-red-600 border-red-300 hover:bg-red-50"
                  onClick={handleLogout}
                >
                  <LogOut className="h-5 w-5" />
                  Logout
                </Button>
              </div>
            ) : (
              <Button
                className="w-full py-6 text-lg bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate("/login");
                }}
              >
                Login / Sign Up
              </Button>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Area Selection Modal */}
      <ServiceAreaModal
        isOpen={areaModalOpen}
        onClose={() => setAreaModalOpen(false)}
      />
    </>
  );
};