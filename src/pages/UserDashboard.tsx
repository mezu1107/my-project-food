// src/pages/UserDashboard.tsx
// FINAL PRODUCTION — DECEMBER 18, 2025

import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  Settings,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

import { useAuthStore } from "@/features/auth/store/authStore";
import { useMyOrders } from "@/features/orders/hooks/useOrders";

export default function UserDashboard() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const { data: ordersData, isLoading: ordersLoading } = useMyOrders();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    localStorage.removeItem("token");
    toast.success("Logged out successfully");
    navigate("/");
  };

  const recentOrders = ordersData?.slice(0, 6) || [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
      case "confirmed":
        return <Clock className="h-5 w-5" />;
      case "preparing":
        return <Package className="h-5 w-5" />;
      case "out_for_delivery":
        return <Truck className="h-5 w-5" />;
      case "delivered":
        return <CheckCircle className="h-5 w-5" />;
      default:
        return <Package className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "out_for_delivery":
        return "bg-blue-100 text-blue-800";
      case "preparing":
        return "bg-orange-100 text-orange-800";
      case "pending":
      case "confirmed":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      {/* Hero Welcome */}
      <section className="bg-gradient-to-r from-orange-500 to-amber-600 py-20">
        <div className="container mx-auto px-6 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-black mb-4">
              Welcome back, {user.name.split(" ")[0]}!
            </h1>
            <p className="text-2xl opacity-90">
              Your personal food dashboard
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-6 py-12 max-w-7xl">
        <div className="grid lg:grid-cols-3 gap-10">
          {/* Left: Profile & Actions */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="shadow-2xl overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-orange-500 to-amber-600" />
                <div className="relative px-8 pb-8 -mt-16">
                  <div className="w-32 h-32 mx-auto rounded-full bg-white p-2 shadow-2xl">
                    <div className="w-full h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-600 flex items-center justify-center text-white text-6xl font-black">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  </div>

                  <div className="text-center mt-6">
                    <h2 className="text-3xl font-black">{user.name}</h2>
                    <Badge variant="secondary" className="mt-3 text-lg px-6 py-2">
                      Premium Customer
                    </Badge>
                  </div>

                  <Separator className="my-8" />

                  <div className="space-y-5 text-lg">
                    <div className="flex items-center gap-4">
                      <Phone className="h-6 w-6 text-orange-600" />
                      <span>{user.phone}</span>
                    </div>
                    {user.email && (
                      <div className="flex items-center gap-4">
                        <Mail className="h-6 w-6 text-orange-600" />
                        <span>{user.email}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-4">
                      <MapPin className="h-6 w-6 text-orange-600" />
                      <span className="capitalize">{user.city.toLowerCase()}</span>
                    </div>
                  </div>

                  <Separator className="my-8" />

                  <div className="space-y-4">
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full justify-start text-lg"
                      onClick={() => navigate("/profile")}
                    >
                      <Settings className="mr-3 h-6 w-6" />
                      Edit Profile
                    </Button>

                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full justify-start text-lg"
                      onClick={() => navigate("/addresses")}
                    >
                      <MapPin className="mr-3 h-6 w-6" />
                      Saved Addresses
                    </Button>

                    <Button
                      variant="destructive"
                      size="lg"
                      className="w-full justify-start text-lg mt-6"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-3 h-6 w-6" />
                      Logout
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Right: Orders & Stats */}
          <div className="lg:col-span-2 space-y-10">
            {/* Order Stats */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6"
            >
              <Card className="text-center p-8 shadow-xl">
                <ShoppingBag className="h-14 w-14 mx-auto text-orange-600 mb-4" />
                <p className="text-4xl font-black">{recentOrders.length}</p>
                <p className="text-muted-foreground text-lg">Total Orders</p>
              </Card>

              <Card className="text-center p-8 shadow-xl">
                <Clock className="h-14 w-14 mx-auto text-amber-600 mb-4" />
                <p className="text-4xl font-black">
                  {recentOrders.filter((o) => ["pending", "confirmed", "preparing"].includes(o.status)).length}
                </p>
                <p className="text-muted-foreground text-lg">Active</p>
              </Card>

              <Card className="text-center p-8 shadow-xl">
                <Truck className="h-14 w-14 mx-auto text-blue-600 mb-4" />
                <p className="text-4xl font-black">
                  {recentOrders.filter((o) => o.status === "out_for_delivery").length}
                </p>
                <p className="text-muted-foreground text-lg">On the Way</p>
              </Card>

              <Card className="text-center p-8 shadow-xl">
                <CheckCircle className="h-14 w-14 mx-auto text-green-600 mb-4" />
                <p className="text-4xl font-black">
                  {recentOrders.filter((o) => o.status === "delivered").length}
                </p>
                <p className="text-muted-foreground text-lg">Delivered</p>
              </Card>
            </motion.div>

            {/* Recent Orders */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-3xl font-bold flex items-center gap-4">
                    <ShoppingBag className="h-10 w-10 text-orange-600" />
                    Recent Orders
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {ordersLoading ? (
                    <div className="space-y-6">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-28 bg-muted/30 rounded-xl animate-pulse" />
                      ))}
                    </div>
                  ) : recentOrders.length === 0 ? (
                    <div className="text-center py-20">
                      <Package className="h-24 w-24 mx-auto text-muted-foreground mb-6 opacity-50" />
                      <h3 className="text-2xl font-bold mb-4">No orders yet!</h3>
                      <p className="text-muted-foreground mb-8">
                        Start your delicious journey with AM Foods
                      </p>
                      <Button
                        size="lg"
                        className="bg-orange-600 hover:bg-orange-700 text-lg px-10 py-6"
                        onClick={() => navigate("/menu/all")}
                      >
                        Browse Menu
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {recentOrders.map((order) => (
                        <motion.div
                          key={order._id}
                          whileHover={{ scale: 1.02 }}
                          className="p-6 bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl border border-orange-200 shadow-lg hover:shadow-xl transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-4 mb-3">
                                <h4 className="text-2xl font-black">#{order.shortId || order._id.slice(-6).toUpperCase()}</h4>
                                <Badge className={`text-base px-4 py-2 ${getStatusColor(order.status)}`}>
                                  <div className="flex items-center gap-2">
                                    {getStatusIcon(order.status)}
                                    {order.status.replace("_", " ").charAt(0).toUpperCase() + order.status.replace("_", " ").slice(1)}
                                  </div>
                                </Badge>
                              </div>
                              <p className="text-lg text-muted-foreground">
                                {format(new Date(order.placedAt), "PPP 'at' p")}
                              </p>
                              <p className="text-xl font-bold mt-2">
                                Rs. {order.finalAmount.toLocaleString()}
                              </p>
                            </div>

                            <div className="text-right">
                              <Button
                                size="lg"
                                onClick={() => navigate(`/track/${order._id}`)}
                                className="bg-orange-600 hover:bg-orange-700"
                              >
                                Track Order →
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ))}

                      {ordersData && ordersData.length > 6 && (
                        <div className="text-center mt-8">
                          <Button
                            size="lg"
                            variant="outline"
                            onClick={() => navigate("/orders")}
                          >
                            View All Orders
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}