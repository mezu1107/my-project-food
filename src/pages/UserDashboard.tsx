// src/pages/UserDashboard.tsx
// FINAL PRODUCTION — JANUARY 12, 2026
// Modern, mobile-first user dashboard with Notification Center in profile
// Features: fluid layout, large touch targets, smooth animations, warm theme

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

import {
  User,
  Phone,
  Mail,
  MapPin,
  ShoppingBag,
  Package,
  Clock,
  CheckCircle,
  Truck,
  ChefHat,
  Settings,
  LogOut,
  Star,
  MessageSquare,
  KeyRound,
  History,
} from "lucide-react";

import { format } from "date-fns";

import { useAuthStore } from "@/features/auth/store/authStore";
import { useMyOrders } from "@/features/orders/hooks/useOrders";
import NotificationCenter from "@/features/notifications/components/NotificationCenter";

import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/types/order.types";

interface Order {
  _id: string;
  shortId?: string;
  status: string;
  placedAt: string | Date;
  finalAmount: number;
  review?: any | null;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "pending":
    case "confirmed":
      return <Clock className="h-6 w-6" />;
    case "preparing":
      return <ChefHat className="h-6 w-6" />;
    case "out_for_delivery":
      return <Truck className="h-6 w-6" />;
    case "delivered":
      return <CheckCircle className="h-6 w-6" />;
    default:
      return <Package className="h-6 w-6" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "delivered":
      return "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300";
    case "out_for_delivery":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300";
    case "preparing":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300";
    case "pending":
    case "confirmed":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
  }
};

export default function UserDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { data: orders = [], isLoading: ordersLoading } = useMyOrders();

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    localStorage.removeItem("token");
    toast.success("Logged out successfully", { duration: 3000 });
    navigate("/", { replace: true });
  };

  // Quick stats
  const recentOrders = orders.slice(0, 6);
  const deliveredOrders = orders.filter((o) => o.status === "delivered");
  const pendingReviewsCount = deliveredOrders.filter((o) => !o.review).length;

  if (!user) return null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-900">
      {/* Hero Welcome Section */}
      <section className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 py-16 md:py-24 lg:py-32 text-white shadow-2xl">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight mb-6">
              Welcome back, {user.name.split(" ")[0]}!
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl opacity-90 max-w-3xl mx-auto">
              Track your orders, manage profile, and share your feedback — all in one place
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 lg:py-16 max-w-7xl">
        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Left Sidebar - Profile Card with Notification Bell */}
          <aside className="space-y-8 lg:sticky lg:top-8 lg:self-start">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.7 }}
            >
              <Card className="shadow-2xl overflow-hidden border-2 border-orange-200/70 rounded-3xl">
                {/* Cover Gradient */}
                <div className="h-40 md:h-48 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 relative">
                  <div className="absolute inset-0 bg-black/20" />
                </div>

                <div className="relative px-6 pb-10 -mt-20 md:-mt-24">
                  {/* Avatar */}
                  <div className="w-32 h-32 md:w-40 md:h-40 mx-auto rounded-full bg-white p-3 shadow-2xl ring-4 ring-orange-300/50">
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-orange-600 to-amber-600 flex items-center justify-center text-5xl md:text-7xl font-black text-white shadow-inner">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  </div>

                  {/* Name + Notification Bell + Badge */}
                  <div className="text-center mt-6 space-y-4">
                    <div className="flex items-center justify-center gap-5">
                      <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white">
                        {user.name}
                      </h2>
                      <div className="scale-125 md:scale-150">
                        <NotificationCenter /> {/* ← Bell icon here */}
                      </div>
                    </div>

                    <Badge
                      variant="secondary"
                      className="text-base md:text-lg px-6 py-2 bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300"
                    >
                      Valued Customer
                    </Badge>
                  </div>

                  <Separator className="my-10 bg-orange-200/50" />

                  {/* User Info */}
                  <div className="space-y-6 text-base md:text-lg text-gray-700 dark:text-gray-300">
                    <div className="flex items-center gap-4">
                      <Phone className="h-6 w-6 text-orange-600" />
                      <span>{user.phone}</span>
                    </div>
                    {user.email && (
                      <div className="flex items-center gap-4">
                        <Mail className="h-6 w-6 text-orange-600" />
                        <span className="truncate">{user.email}</span>
                      </div>
                    )}
                    {user.city && (
                      <div className="flex items-center gap-4">
                        <MapPin className="h-6 w-6 text-orange-600" />
                        <span className="capitalize">{user.city.toLowerCase()}</span>
                      </div>
                    )}
                  </div>

                  <Separator className="my-10 bg-orange-200/50" />

                  {/* Quick Actions */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Button
                      variant="outline"
                      size="lg"
                      className="h-14 text-base md:text-lg border-orange-300 hover:bg-orange-50 dark:hover:bg-orange-950/30"
                      onClick={() => navigate("/profile")}
                    >
                      <User className="mr-3 h-6 w-6" />
                      Edit Profile
                    </Button>

                    <Button
                      variant="outline"
                      size="lg"
                      className="h-14 text-base md:text-lg border-orange-300 hover:bg-orange-50 dark:hover:bg-orange-950/30"
                      onClick={() => navigate("/addresses")}
                    >
                      <MapPin className="mr-3 h-6 w-6" />
                      Addresses
                    </Button>

                    <Button
                      variant="outline"
                      size="lg"
                      className="h-14 text-base md:text-lg border-orange-300 hover:bg-orange-50 dark:hover:bg-orange-950/30"
                      onClick={() => navigate("/orders")}
                    >
                      <History className="mr-3 h-6 w-6" />
                      Orders
                    </Button>

                    <Button
                      variant="outline"
                      size="lg"
                      className="h-14 text-base md:text-lg border-orange-300 hover:bg-orange-50 dark:hover:bg-orange-950/30"
                      onClick={() => navigate("/reviews")}
                    >
                      <Star className="mr-3 h-6 w-6" />
                      Reviews
                    </Button>
                  </div>

                  <Button
                    variant="destructive"
                    size="lg"
                    className="w-full h-14 mt-8 text-base md:text-lg"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-3 h-6 w-6" />
                    Logout
                  </Button>
                </div>
              </Card>
            </motion.div>

            {/* Pending Reviews Reminder */}
            {pendingReviewsCount > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-orange-300 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-4 text-2xl md:text-3xl">
                      <MessageSquare className="h-10 w-10 text-orange-600" />
                      Your Feedback Matters!
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <p className="text-lg md:text-xl">
                      You have <strong className="text-orange-700">{pendingReviewsCount}</strong> delivered
                      order{pendingReviewsCount > 1 ? "s" : ""} waiting for your review.
                    </p>
                    <Button
                      size="lg"
                      className="w-full h-14 text-base md:text-lg bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700"
                      onClick={() => navigate("/orders")}
                    >
                      <Star className="mr-3 h-6 w-6" />
                      Write Reviews Now
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </aside>

          {/* Right Side: Stats & Recent Orders */}
          <section className="lg:col-span-2 space-y-12">
            {/* Quick Stats Grid */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6"
            >
              {[
                {
                  icon: ShoppingBag,
                  label: "Total Orders",
                  value: orders.length,
                  color: "text-orange-600",
                },
                {
                  icon: Clock,
                  label: "Active",
                  value: orders.filter((o) => ["pending", "confirmed", "preparing"].includes(o.status)).length,
                  color: "text-amber-600",
                },
                {
                  icon: Truck,
                  label: "On the Way",
                  value: orders.filter((o) => o.status === "out_for_delivery").length,
                  color: "text-blue-600",
                },
                {
                  icon: CheckCircle,
                  label: "Delivered",
                  value: deliveredOrders.length,
                  color: "text-green-600",
                },
              ].map((stat, i) => (
                <Card key={i} className="text-center p-6 shadow-xl border border-orange-200/50">
                  <stat.icon className={`h-12 w-12 md:h-14 md:w-14 mx-auto mb-4 ${stat.color}`} />
                  <p className="text-3xl md:text-4xl lg:text-5xl font-black">{stat.value}</p>
                  <p className="text-base md:text-lg text-muted-foreground mt-2">{stat.label}</p>
                </Card>
              ))}
            </motion.div>

            {/* Recent Orders */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="shadow-2xl border border-orange-200/50">
                <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-gray-900">
                  <CardTitle className="text-3xl flex items-center gap-4">
                    <ShoppingBag className="h-10 w-10 text-orange-600" />
                    Recent Orders
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-8">
                  {ordersLoading ? (
                    <div className="space-y-6">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-32 rounded-2xl" />
                      ))}
                    </div>
                  ) : recentOrders.length === 0 ? (
                    <div className="text-center py-20">
                      <Package className="h-32 w-32 mx-auto text-muted-foreground mb-8 opacity-60" />
                      <h3 className="text-4xl font-bold mb-6">No orders yet!</h3>
                      <p className="text-xl text-muted-foreground mb-10">
                        Start ordering your favorite dishes now
                      </p>
                      <Button
                        size="lg"
                        className="h-14 px-12 text-lg bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700"
                        onClick={() => navigate("/menu/all")}
                      >
                        Browse Menu
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {recentOrders.map((order) => (
                        <motion.div
                          key={order._id}
                          whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                          className="p-6 bg-gradient-to-r from-orange-50/70 to-amber-50/70 dark:from-gray-800 dark:to-gray-900 rounded-2xl border border-orange-200/50 shadow-lg hover:shadow-2xl transition-all duration-300"
                        >
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                            <div className="space-y-3">
                              <div className="flex flex-wrap items-center gap-4">
                                <h4 className="text-2xl md:text-3xl font-black text-orange-800">
                                  #{order.shortId || order._id.slice(-6).toUpperCase()}
                                </h4>
                                <Badge
                                  className={`text-base md:text-lg px-5 py-2 ${getStatusColor(order.status)}`}
                                >
                                  <div className="flex items-center gap-2">
                                    {getStatusIcon(order.status)}
                                    {ORDER_STATUS_LABELS[order.status] || order.status.replace("_", " ")}
                                  </div>
                                </Badge>

                                {order.status === "delivered" && !order.review && (
                                  <Badge
                                    variant="outline"
                                    className="border-orange-600 text-orange-700 text-base md:text-lg px-4 py-1.5"
                                  >
                                    <Star className="h-5 w-5 mr-1" />
                                    Review Pending
                                  </Badge>
                                )}
                              </div>

                              <p className="text-base md:text-lg text-muted-foreground">
                                {format(new Date(order.placedAt), "PPP 'at' p")}
                              </p>

                              <p className="text-xl md:text-2xl font-bold text-orange-700">
                                Rs. {order.finalAmount.toLocaleString("en-PK")}
                              </p>
                            </div>

                            <div className="flex flex-col gap-4 md:text-right">
                              <Button
                                size="lg"
                                className="h-14 text-base md:text-lg bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700"
                                onClick={() => navigate(`/track/${order._id}`)}
                              >
                                Track Order
                              </Button>

                              {order.status === "delivered" && !order.review && (
                                <Button
                                  variant="outline"
                                  size="lg"
                                  className="h-14 text-base md:text-lg border-orange-400 hover:bg-orange-50"
                                  onClick={() => navigate("/orders")}
                                >
                                  <Star className="mr-3 h-5 w-5" />
                                  Rate & Review
                                </Button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}

                      {orders.length > 6 && (
                        <div className="text-center mt-10">
                          <Button
                            size="lg"
                            variant="outline"
                            className="h-14 px-10 text-lg border-orange-400 hover:bg-orange-50"
                            onClick={() => navigate("/orders")}
                          >
                            View All Orders →
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </section>
        </div>
      </div>
    </main>
  );
}