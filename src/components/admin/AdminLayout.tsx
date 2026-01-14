// src/components/admin/AdminLayout.tsx
// FINAL PRODUCTION — JANUARY 14, 2026 (COMPLETE + GLOBAL BREADCRUMBS)
// Mobile-first: phone → tablet → laptop → desktop → widescreen
// Features: persistent collapsible Riders group, touch-friendly, dark mode, accessibility
// Global: automatic breadcrumbs on every admin page

import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  Users,
  Bike,
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
  Ban,
  AlertTriangle,
  Truck,
  ChevronDown,
  Home,
} from "lucide-react";
import clsx from "clsx";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import NotificationCenter from "@/features/notifications/components/NotificationCenter";
import { useAdminNotifications } from "@/hooks/useAdminNotifications";
import Breadcrumbs from "./Breadcrumbs"; // ← assuming it's in same folder or adjust path

// ── Nav Item Type ──
type NavItem = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
};

// ── Navigation Constants ──
const MAIN_NAV_ITEMS: NavItem[] = [
  { icon: ShoppingBag, label: "Orders", path: "/admin/orders" },
  { icon: Package, label: "Orders Page", path: "/admin/ordersPage" },
  { icon: Users, label: "Customers", path: "/admin/customers" },
  { icon: MapPin, label: "Delivery Areas", path: "/admin/areas" },
  { icon: UtensilsCrossed, label: "Menu Items", path: "/admin/menu" },
  { icon: Star, label: "Reviews", path: "/admin/reviews" },
  { icon: BarChart3, label: "Analytics", path: "/admin/analytics" },
  { icon: MessageSquare, label: "Contact Messages", path: "/admin/contact" },
  { icon: UserPlus, label: "Staff / Promote", path: "/admin/staff" },
  { icon: Box, label: "Inventory Management", path: "/admin/inventory" },
  { icon: Clipboard, label: "Kitchen Dashboard", path: "/kitchen" },
];

const RIDER_NAV_ITEMS: NavItem[] = [
  { icon: Bike, label: "All Riders", path: "/admin/riders" },
  { icon: Ban, label: "Blocked Riders", path: "/admin/riders/blocked" },
  { icon: AlertTriangle, label: "Permanently Banned", path: "/admin/riders/permanently-banned" },
  { icon: Truck, label: "Force Assign Orders", path: "/admin/riders/assign" },
  { icon: UserPlus, label: "Promote to Rider", path: "/admin/riders/promote" },
];

// ── Helpers ──
const isActivePath = (current: string, target: string) =>
  current === target || current.startsWith(`${target}/`);

const getPageTitle = (pathname: string): string => {
  // Riders section
  if (pathname.startsWith("/admin/riders")) {
    if (pathname === "/admin/riders") return "All Riders";
    if (pathname.includes("/blocked")) return "Blocked Riders";
    if (pathname.includes("/permanently-banned")) return "Permanently Banned";
    if (pathname.includes("/assign")) return "Force Assign Orders";
    if (pathname.includes("/promote")) return "Promote to Rider";
    return "Rider Details";
  }

  // Main section matches
  const mainMatch = MAIN_NAV_ITEMS.find((item) => isActivePath(pathname, item.path));
  if (mainMatch) return mainMatch.label;

  return "Admin Panel";
};

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, setCurrentUser } = useStore();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [ridersExpanded, setRidersExpanded] = useState<boolean>(() => {
    const saved = localStorage.getItem("admin_riders_nav_open");
    return saved ? saved === "true" : true; // default: expanded
  });

  // Persist Riders group open/closed state
  useEffect(() => {
    localStorage.setItem("admin_riders_nav_open", String(ridersExpanded));
  }, [ridersExpanded]);

  // Real-time admin notifications
  useAdminNotifications();

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  const pageTitle = getPageTitle(location.pathname);

  return (
    <div className="flex min-h-screen flex-col bg-background lg:flex-row">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border shadow-2xl lg:shadow-none",
          "transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Brand / Logo */}
          <div className="flex h-16 items-center justify-between px-5 sm:px-6 border-b border-border">
            <Link
              to="/"
              className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent"
              onClick={() => setSidebarOpen(false)}
            >
              AlTawakkal Admin
            </Link>

            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-3 py-5 sm:py-6">
            {/* Main Items */}
            {MAIN_NAV_ITEMS.map((item) => {
              const isActive = isActivePath(location.pathname, item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className="block mb-1.5"
                >
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={clsx(
                      "w-full justify-start gap-3 text-base sm:text-[15px] font-medium transition-colors h-11 sm:h-10",
                      isActive &&
                        "bg-orange-50/80 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300",
                      !isActive &&
                        "text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-orange-500"
                    )}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}

            {/* Riders Management - Collapsible */}
            <div className="mt-6 sm:mt-8">
              <Button
                variant="ghost"
                className="w-full justify-between text-muted-foreground hover:bg-accent hover:text-accent-foreground mb-1.5 h-11 sm:h-10"
                onClick={() => setRidersExpanded(!ridersExpanded)}
              >
                <div className="flex items-center gap-3">
                  <Bike className="h-5 w-5 shrink-0" />
                  <span className="font-medium text-sm sm:text-base">Riders Management</span>
                </div>
                <ChevronDown
                  className={clsx(
                    "h-5 w-5 transition-transform duration-200",
                    ridersExpanded && "rotate-180"
                  )}
                />
              </Button>

              {ridersExpanded && (
                <div className="ml-4 mt-1 space-y-1.5 border-l border-border/50 pl-4">
                  {RIDER_NAV_ITEMS.map((item) => {
                    const isActive = isActivePath(location.pathname, item.path);
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setSidebarOpen(false)}
                        className="block"
                      >
                        <Button
                          variant={isActive ? "secondary" : "ghost"}
                          size="sm"
                          className={clsx(
                            "w-full justify-start gap-3 text-sm transition-colors h-10",
                            isActive &&
                              "bg-orange-50/70 dark:bg-orange-950/20 text-orange-700 dark:text-orange-300",
                            !isActive &&
                              "text-muted-foreground hover:bg-accent/70 hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-orange-500"
                          )}
                        >
                          <item.icon className="h-4 w-4 shrink-0" />
                          {item.label}
                        </Button>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Logout */}
            <div className="mt-auto pt-6 sm:pt-8 border-t border-border">
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 text-destructive hover:bg-destructive/10 hover:text-destructive h-11 sm:h-10 focus-visible:ring-2 focus-visible:ring-red-500"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5 shrink-0" />
                Logout
              </Button>
            </div>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="h-14 sm:h-16 border-b bg-card shadow-sm flex items-center px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 sm:gap-4 flex-1">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar menu"
            >
              <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
            </Button>

            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground truncate">
              {pageTitle}
            </h1>
          </div>

          {/* Right side: Notifications + User Info */}
          <div className="flex items-center gap-4 sm:gap-6">
            <NotificationCenter />

            <div className="hidden md:flex items-center gap-3">
              <span className="text-sm text-muted-foreground hidden lg:inline">
                {currentUser?.name || "Admin"}
              </span>
              <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white font-medium shadow-md text-sm sm:text-base">
                {(currentUser?.name?.[0] || "A").toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Breadcrumbs (global on every admin page) */}
        <Breadcrumbs />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-background/50 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-screen-2xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}