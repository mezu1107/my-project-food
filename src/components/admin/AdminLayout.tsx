// src/components/admin/AdminLayout.tsx
// FINAL PRODUCTION — DECEMBER 21, 2025
// Logo click navigates to Admin Dashboard

import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Bike,
  Tag,
  MapPin,
  UtensilsCrossed,
  Monitor,
  MessageSquare,
  LogOut,
  Menu,
  X,
  UserPlus,
  Package,
  Star,
  BarChart3,
  Box,
  Clipboard,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { useState } from "react";

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, setCurrentUser } = useStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };
const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
  { icon: ShoppingBag, label: "Orders", path: "/admin/orders" },
  { icon: Package, label: "Orders Page", path: "/admin/ordersPage" },
  { icon: Users, label: "Customers", path: "/admin/customers" },
  { icon: Bike, label: "Riders", path: "/admin/riders" },
  { icon: Tag, label: "Deals & Offers", path: "/admin/deals" },
  { icon: MapPin, label: "Delivery Areas", path: "/admin/areas" },
  { icon: UtensilsCrossed, label: "Menu Items", path: "/admin/menu" },
  { icon: Star, label: "Reviews", path: "/admin/reviews" },
  { icon: BarChart3, label: "Analytics", path: "/admin/analytics" },
  { icon: MessageSquare, label: "Contact Messages", path: "/admin/contact" },
  { icon: UserPlus, label: "Staff Promote", path: "/admin/staff" },
  { icon: Box, label: "Inventory Management", path: "/admin/inventory" },
  { icon: Clipboard, label: "Kitchen Display", path: "/admin/kitchen" },
];


  const currentPageTitle =
    navItems.find(
      (item) =>
        location.pathname === item.path ||
        location.pathname.startsWith(item.path + "/")
    )?.label || "Admin Panel";

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 border-r bg-card transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between border-b px-6">
            <Link
              to="/home"
              className="text-xl font-bold text-primary hover:opacity-80"
              onClick={() => setSidebarOpen(false)}
            >
              Al Tawakkalfoods Admin
            </Link>

            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto p-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                location.pathname === item.path ||
                location.pathname.startsWith(item.path + "/");

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className="w-full justify-start gap-3 text-left"
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span>{item.label}</span>
                  </Button>
                </Link>
              );
            })}

            <div className="mt-6 border-t pt-6">
              <Button
                variant="outline"
                className="w-full justify-start gap-3 text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5" />
                Logout
              </Button>
            </div>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Top Header */}
        <header className="flex h-16 items-center justify-between border-b bg-card px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h2 className="text-2xl font-bold">{currentPageTitle}</h2>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-muted-foreground sm:block">
              Welcome, <strong>{currentUser?.name || "Admin"}</strong>
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-lg font-bold text-primary">
              {currentUser?.name?.charAt(0).toUpperCase() || "A"}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-muted/30 p-4 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
