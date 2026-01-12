// src/components/admin/AdminLayout.tsx
// FINAL PRODUCTION — JANUARY 12, 2026
// Modern, responsive admin dashboard layout with notification center
// FIXED: Real-time admin notifications for all new orders (guest + registered)
// Added: useAdminNotifications hook for newOrder & newOrderAlert events

import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Bike,
  Tag,
  MapPin,
  UtensilsCrossed,
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
import clsx from "clsx";

import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { useState, useEffect } from "react";
import NotificationCenter from "@/features/notifications/components/NotificationCenter";

// NEW: Import admin notifications hook
import { useAdminNotifications } from "@/hooks/useAdminNotifications";

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, setCurrentUser } = useStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Enable real-time admin notifications (new orders, alerts, etc.)
  useAdminNotifications();

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
    { icon: MapPin, label: "Delivery Areas", path: "/admin/areas" },
    { icon: UtensilsCrossed, label: "Menu Items", path: "/admin/menu" },
    { icon: Star, label: "Reviews", path: "/admin/reviews" },
    { icon: BarChart3, label: "Analytics", path: "/admin/analytics" },
    { icon: MessageSquare, label: "Contact Messages", path: "/admin/contact" },
    { icon: UserPlus, label: "Staff Promote", path: "/admin/staff" },
    { icon: Box, label: "Inventory Management", path: "/admin/inventory" },
    { icon: Clipboard, label: "Kitchen Dashboard", path: "/kitchen" },
  ];

  const currentPageTitle =
    navItems.find(
      (item) =>
        location.pathname === item.path ||
        location.pathname.startsWith(item.path + "/")
    )?.label || "Admin Panel";

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 
          transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 shadow-lg lg:shadow-none
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200 dark:border-gray-800">
            <Link
              to="/"
              className="text-xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent"
              onClick={() => setSidebarOpen(false)}
            >
              AlTawakkal Admin
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
          <nav className="flex-1 px-3 py-6 overflow-y-auto">
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
                  className="block mb-1"
                >
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={clsx(
                      "w-full justify-start gap-3 text-base font-medium",
                      isActive
                        ? "bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}

            {/* Logout at bottom */}
            <div className="mt-auto pt-8 border-t border-gray-200 dark:border-gray-800">
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
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
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="h-16 border-b bg-white dark:bg-gray-900 shadow-sm flex items-center px-4 lg:px-8">
          <div className="flex items-center gap-4 flex-1">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>

            <h1 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white truncate">
              {currentPageTitle}
            </h1>
          </div>

          {/* Right side: Notifications + User Info */}
          <div className="flex items-center gap-6">
            <NotificationCenter />
            <div className="hidden md:flex items-center gap-3">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {currentUser?.name || "Admin"}
              </span>
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white font-medium shadow-md">
                {(currentUser?.name?.[0] || "A").toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50/50 dark:bg-gray-950/50 p-4 lg:p-8">
          <div className="mx-auto max-w-[1400px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;