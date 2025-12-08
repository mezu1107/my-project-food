// src/App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Public Pages
import Index from "./pages/Index";
import Home from "./pages/Home";
import MenuPage from "./features/menu/pages/MenuPage";
import MenuAllPage from "./features/menu/pages/MenuAllPage";
import MenuFiltersPage from "./features/menu/pages/MenuFiltersPage";
import MenuByLocationPage from "@/features/menu/pages/MenuByLocation";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import TrackOrder from "./pages/TrackOrder";
import Login from "./pages/Login";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Portfolio from "./pages/Portfolio";
import NotFound from "./pages/NotFound";

// Admin Pages
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminOrders from "./pages/admin/Orders";
import AdminUsers from "./pages/admin/Users";
import AdminRiders from "./pages/admin/Riders";
import AdminDeals from "./pages/admin/Deals";
import AdminFoodItems from "./pages/admin/FoodItems";
import AdminLogin from "./pages/admin/Login";
import AdminMenuPage from "./features/menu/pages/AdminMenuPage";
import EditMenuItemPage from "@/features/menu/pages/EditMenuItemPage";

// Admin Areas
import AdminAreasList from "./pages/admin/areas/AreasList";
import AdminAddArea from "./pages/admin/areas/AddArea";
import AdminEditArea from "./pages/admin/areas/EditArea";

// Rider Pages
import RiderLayout from "./components/rider/RiderLayout";
import RiderDashboard from "./pages/rider/Dashboard";
import RiderLogin from "./pages/rider/Login";
import RiderDeliveries from "./pages/rider/Deliveries";

// Debug
import DebugAPI from "./pages/DebugAPI";

// Global delivery checker
export const openDeliveryChecker = () => {
  window.dispatchEvent(new CustomEvent("open-delivery-checker"));
};

// QueryClient setup
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />

        <BrowserRouter>
          <Routes>
            {/* ==================== PUBLIC ROUTES ==================== */}
            <Route path="/" element={<Index />} />

            {/* Menu Routes */}
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/menu/all" element={<MenuAllPage />} />
            <Route path="/menu/filters" element={<MenuFiltersPage />} />
            <Route path="/menu/area/:areaId" element={<MenuByLocationPage />} />

            {/* Other Public */}
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/track-order/:orderId" element={<TrackOrder />} />
            <Route path="/login" element={<Login />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/debug-api" element={<DebugAPI />} />

            {/* ==================== ADMIN ROUTES ==================== */}
            <Route path="/admin/login" element={<AdminLogin />} />

            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="riders" element={<AdminRiders />} />
              <Route path="deals" element={<AdminDeals />} />

              {/* Menu Management */}
              <Route path="menu" element={<AdminMenuPage />} />
              <Route path="menu/edit/:id" element={<EditMenuItemPage />} />

              {/* Areas */}
              <Route path="areas" element={<AdminAreasList />} />
              <Route path="areas/add" element={<AdminAddArea />} />
              <Route path="areas/edit/:areaId" element={<AdminEditArea />} />
            </Route>

            {/* ==================== RIDER ROUTES ==================== */}
            <Route path="/rider/login" element={<RiderLogin />} />
            <Route path="/rider" element={<RiderLayout />}>
              <Route index element={<RiderDashboard />} />
              <Route path="deliveries" element={<RiderDeliveries />} />
            </Route>

            {/* ==================== 404 ==================== */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}