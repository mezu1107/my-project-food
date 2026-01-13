// src/App.tsx
// PRODUCTION-READY — JANUARY 11, 2026 (FIXED)

import { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { RiderProvider } from "@/features/riders/context/RiderContext";

import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import { SocketProvider } from '@/context/SocketContext';
import { initPushNotifications } from '@/lib/pushNotifications';
import { audioManager } from '@/features/notifications/store/notificationStore';
import { useGlobalOrderNotifications } from '@/features/orders/hooks/useGlobalOrderNotifications';

// ── Global initializer ──
function GlobalInitializer() {
  useEffect(() => {
    audioManager.preload();
    initPushNotifications();

    return () => {
      audioManager.cleanup();
    };
  }, []);

  useGlobalOrderNotifications();

  return null;
}

// ── Layouts & Pages ──
import { PublicLayout } from "./components/PublicLayout";
import AdminLayout from "./components/admin/AdminLayout";
import RiderLayout from "./components/rider/RiderLayout";
import { KitchenLayout } from "./components/KitchenLayout";
import KitchenDisplay from "./pages/kitchen/KitchenDisplay";

import Index from "./pages/Index";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyOtp from "./pages/VerifyOtp";
import ResetPassword from "./pages/ResetPassword";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Portfolio from "./pages/Portfolio";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import UserDashboard from "./pages/UserDashboard";
import ChangePassword from "./pages/ChangePassword";

import MenuPage from "./features/menu/pages/MenuPage";
import MenuAllPage from "./features/menu/pages/MenuAllPage";
import MenuFiltersPage from "./features/menu/pages/MenuFiltersPage";
import MenuByLocationPage from "@/features/menu/pages/MenuByLocation";

import CartPage from "@/features/cart/pages/Cart";
import CheckoutPage from "@/features/orders/pages/CheckoutPage";
import BankTransferPage from "@/features/orders/pages/BankTransferPage";
import CardPaymentPage from "@/features/orders/pages/CardPaymentPage";

import OrdersPage from "@/features/orders/pages/OrdersPage";
import OrderTrackingPage from "@/features/orders/pages/OrderTrackingPage";
import OrderRefundRequestPage from "@/features/orders/pages/OrderRefundRequestPage";

import AddressListPage from "@/features/address/pages/AddressListPage";

import AdminOrders from "./pages/admin/orders/Orders";
import AdminOrderDetails from "./pages/admin/orders/OrderDetails";
import AdminDeals from "./pages/admin/Deals";
import AdminMenuPage from "./features/menu/pages/AdminMenuPage";
import EditMenuItemPage from "@/features/menu/pages/EditMenuItemPage";
import AdminAreasList from "./pages/admin/areas/AreasList";
import AdminAddArea from "./pages/admin/areas/AddArea";
import AddDeliveryZone from "./pages/admin/areas/AddDeliveryZone";
import AdminEditArea from "./pages/admin/areas/EditArea";
import ContactMessagesPage from "./pages/admin/contact/ContactMessagesPage";
import { CustomerList } from "./features/customers/admin/customers/CustomerList";
import { StaffList } from "./components/admin/staff/StaffList";
import { InventoryList } from "./components/admin/inventory/InventoryList";
import AnalyticsPage from "./features/analytics/AnalyticsPage";
import AdminOrdersPage from "@/pages/admin/orders/AdminOrdersPage";

import CustomerReviewsPage from "./features/reviews/pages/CustomerReviewsPage";
import AdminReviewsDashboard from "./features/reviews/pages/AdminReviewsDashboard";

import KitchenDashboard from "./pages/kitchen/KitchenDashboard";

import DebugAPI from "./pages/DebugAPI";

// ── Rider Pages ──
import RiderHome from "@/features/riders/pages/RiderHome";
import RiderProfile from "@/features/riders/pages/RiderProfile";
import OrderHistory from "@/features/riders/pages/OrderHistory";
import ApplyRider from "@/features/riders/pages/ApplyRider";

// ── Query Client ──
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// ── Router ──
const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: "/", element: <Index /> },
      { path: "/home", element: <Home /> },
      { path: "/menu", element: <MenuPage /> },
      { path: "/menu/all", element: <MenuAllPage /> },
      { path: "/menu/filters", element: <MenuFiltersPage /> },
      { path: "/menu/area/:areaId", element: <MenuByLocationPage /> },
      { path: "/cart", element: <CartPage /> },
      { path: "/checkout", element: <CheckoutPage /> },
      { path: "/checkout/card", element: <CardPaymentPage /> },
      { path: "/checkout/bank-transfer", element: <BankTransferPage /> },
      { path: "/orders", element: <OrdersPage /> },
      { path: "/track/:orderId", element: <OrderTrackingPage /> },
      { path: "/order/:orderId/refund", element: <OrderRefundRequestPage /> },
      { path: "/addresses", element: <AddressListPage /> },
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },
      { path: "/forgot-password", element: <ForgotPassword /> },
      { path: "/verify-otp", element: <VerifyOtp /> },
      { path: "/reset-password", element: <ResetPassword /> },
      { path: "/about", element: <About /> },
      { path: "/contact", element: <Contact /> },
      { path: "/portfolio", element: <Portfolio /> },
      { path: "/reviews", element: <CustomerReviewsPage /> },
      { path: "/profile", element: <Profile /> },
      { path: "/dashboard", element: <UserDashboard /> },
      { path: "/change-password", element: <ChangePassword /> },
      { path: "/debug-api", element: <DebugAPI /> },
    ],
  },
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      { path: "deals", element: <AdminDeals /> },
      { path: "menu", element: <AdminMenuPage /> },
      { path: "menu/edit/:id", element: <EditMenuItemPage /> },
      { path: "areas", element: <AdminAreasList /> },
      { path: "areas/add", element: <AdminAddArea /> },
      { path: "areas/edit/:id", element: <AdminEditArea /> },
      { path: "delivery-zones", element: <AddDeliveryZone /> },
      { path: "ordersPage", element: <AdminOrdersPage /> },
      { path: "orders", element: <AdminOrders /> },
      { path: "orders/:orderId", element: <AdminOrderDetails /> },
      { path: "contact", element: <ContactMessagesPage /> },
      { path: "customers", element: <CustomerList /> },
      { path: "staff", element: <StaffList /> },
      { path: "inventory", element: <InventoryList /> },
      { path: "analytics", element: <AnalyticsPage /> },
      { path: "reviews", element: <AdminReviewsDashboard /> },
    ],
  },
  {
    path: "/kitchen",
    element: <KitchenLayout />,
    children: [
      { index: true, element: <KitchenDashboard /> },
      { path: "display", element: <KitchenDisplay /> },
    ],
  },
 {
  path: "/rider",
  element: (
    <RiderProvider>
      <RiderLayout />
    </RiderProvider>
  ),
  children: [
    { index: true, element: <RiderHome /> },
    { path: "profile", element: <RiderProfile /> },
    { path: "orders", element: <OrderHistory /> },
    { path: "apply", element: <ApplyRider /> },
  ],
},
  {
    path: "*",
    element: <NotFound />,
  },
]);

// ── App Component ──
export default function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />

          {/* Global hooks & effects */}
          <GlobalInitializer />

          <SocketProvider>
            <RouterProvider router={router} />
          </SocketProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}
