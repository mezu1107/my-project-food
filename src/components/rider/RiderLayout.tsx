// src/components/rider/RiderLayout.tsx
// FINAL PRODUCTION — JANUARY 13, 2026
// Modern rider dashboard layout with sidebar navigation

import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  History,
  User,
  Bike,
  MapPin,
  LogOut,
  Menu,
  X,
  AlertCircle,
  DollarSign,
} from "lucide-react";
import clsx from "clsx";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"; // ← Added missing imports

import { useStore } from "@/lib/store";
import { useState } from "react";
import { useRider } from "@/features/riders/context/RiderContext";
import { StatusToggle } from "@/features/riders/components/StatusToggle";

// Optional future: import { useRiderNotifications } from "@/hooks/useRiderNotifications";

const RiderLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, setCurrentUser } = useStore();
  const { profile } = useRider();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // useRiderNotifications(); // ← uncomment when you implement real-time rider notifications

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/rider" },
    { icon: Package, label: "Current Order", path: "/rider" },
    { icon: History, label: "Order History", path: "/rider/orders" },
    { icon: User, label: "Profile", path: "/rider/profile" },
    { icon: Bike, label: "Become a Rider", path: "/rider/apply" },
  ];

  const currentPageTitle =
    navItems.find(
      (item) =>
        location.pathname === item.path ||
        location.pathname.startsWith(item.path + "/")
    )?.label || "Rider Panel";

  const isApproved = profile?.riderStatus === "approved";

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
              to="/rider"
              className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent"
              onClick={() => setSidebarOpen(false)}
            >
              Rider Panel
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

          {/* Rider Status Indicator */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {profile?.name || "Rider"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {profile?.phone || "Not verified"}
                </p>
              </div>

              <Badge
                variant={isApproved ? "default" : "secondary"}
                className={clsx(
                  "text-xs px-3 py-1",
                  isApproved
                    ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
                    : "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                )}
              >
                {isApproved ? "Approved" : "Pending"}
              </Badge>
            </div>

            {/* Availability Toggle */}
            {isApproved && (
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Availability
                </span>
                <StatusToggle />
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-6 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                location.pathname === item.path ||
                location.pathname.startsWith(item.path + "/");

              // Hide "Become a Rider" when already approved
              if (item.path === "/rider/apply" && isApproved) return null;

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
                        ? "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}

            {/* Logout */}
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

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
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

          {/* Quick Earnings Preview (approved riders only) */}
          <div className="flex items-center gap-6">
            {isApproved && profile && (
              <div className="hidden md:flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    PKR {profile.earnings?.toLocaleString() || "0"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Earnings
                  </p>
                </div>
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white font-medium shadow-md">
                  {(profile.name?.[0] || "R").toUpperCase()}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50/50 dark:bg-gray-950/50 p-4 lg:p-8">
          <div className="mx-auto max-w-[1400px]">
            {!isApproved && (
              <div className="mb-8">
                <Alert variant="default" className="bg-amber-50 border-amber-200">
                  <AlertCircle className="h-5 w-5" />
                  <AlertTitle>Application Pending</AlertTitle>
                  <AlertDescription>
                    Your rider application is under review. You will be able to accept orders once approved.
                  </AlertDescription>
                </Alert>
              </div>
            )}

            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default RiderLayout;