// src/components/Header.tsx — FINAL VERSION
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, User, Menu, LogOut, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { useState } from "react";

export const Header = () => {
  const navigate = useNavigate();
  const { cart, currentUser, setCurrentUser, selectedArea, setSelectedArea } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleLogout = () => {
    setCurrentUser(null);
    setSelectedArea(null);
    sessionStorage.removeItem('areaChecked'); // Force re-check on login
    navigate("/");
  };

  // Open area selector (clears current + forces checker)
  const openAreaSelector = () => {
    setSelectedArea(null);
    sessionStorage.removeItem('areaChecked');
    setMobileMenuOpen(false);
  };

  const areaDisplay = selectedArea
    ? `${selectedArea.name}, ${selectedArea.city}`
    : "Select delivery area";

  return (
    <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-600 to-emerald-600 flex items-center justify-center text-white font-bold text-xl">
              AM
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">AM Foods</h1>
              <p className="text-xs text-muted-foreground">Pakistani Cuisine</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            <Link to="/" className="text-sm font-medium hover:text-primary transition">Home</Link>
            <Link to="/menu" className="text-sm font-medium hover:text-primary transition">Menu</Link>
            <Link to="/about" className="text-sm font-medium hover:text-primary transition">About</Link>
            <Link to="/contact" className="text-sm font-medium hover:text-primary transition">Contact</Link>
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Delivery Area */}
            {selectedArea ? (
              <button
                onClick={openAreaSelector}
                className="hidden md:flex items-center gap-3 bg-muted/50 hover:bg-muted px-4 py-2 rounded-full transition cursor-pointer"
              >
                <MapPin className="h-5 w-5 text-green-600" />
                <div className="text-left">
                  <p className="text-xs text-muted-foreground">Delivering to</p>
                  <p className="font-semibold text-sm">{areaDisplay}</p>
                </div>
              </button>
            ) : (
              <Button
                variant="outline"
                className="hidden md:flex items-center gap-2"
                onClick={openAreaSelector}
              >
                <MapPin className="h-4 w-4" />
                Select Area
              </Button>
            )}

            {/* Cart */}
            <Button variant="ghost" size="icon" className="relative" onClick={() => navigate("/cart")}>
              <ShoppingCart className="h-5 w-5" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {cartItemsCount}
                </span>
              )}
            </Button>

            {/* User */}
            {currentUser ? (
              <div className="hidden md:flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => navigate("/profile")}>
                  <User className="h-4 w-4 mr-2" />
                  {currentUser.name}
                </Button>
                <Button variant="ghost" size="icon" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button onClick={() => navigate("/login")} className="hidden md:flex">
                Login
              </Button>
            )}

            {/* Mobile Menu */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="space-y-4">
              {/* Mobile Area */}
              {selectedArea ? (
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-xs text-muted-foreground">Delivering to</p>
                      <p className="font-medium">{areaDisplay}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={openAreaSelector}>
                    Change
                  </Button>
                </div>
              ) : (
                <Button variant="outline" className="w-full justify-start" onClick={openAreaSelector}>
                  <MapPin className="h-4 w-4 mr-2" />
                  Select Delivery Area
                </Button>
              )}

              {/* Mobile Links */}
              <div className="space-y-2">
                <Link to="/" className="block py-2 text-sm font-medium hover:text-primary" onClick={() => setMobileMenuOpen(false)}>Home</Link>
                <Link to="/menu" className="block py-2 text-sm font-medium hover:text-primary" onClick={() => setMobileMenuOpen(false)}>Menu</Link>
                <Link to="/about" className="block py-2 text-sm font-medium hover:text-primary" onClick={() => setMobileMenuOpen(false)}>About</Link>
                <Link to="/contact" className="block py-2 text-sm font-medium hover:text-primary" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
              </div>

              <div className="border-t pt-4">
                {currentUser ? (
                  <>
                    <Link to="/profile" className="block py-2 text-sm font-medium hover:text-primary" onClick={() => setMobileMenuOpen(false)}>Profile</Link>
                    <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="w-full text-left py-2 text-sm font-medium hover:text-primary">
                      Logout
                    </button>
                  </>
                ) : (
                  <Link to="/login" className="block py-2 text-sm font-medium hover:text-primary" onClick={() => setMobileMenuOpen(false)}>Login</Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};