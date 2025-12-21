// src/features/analytics/types/analytics.types.ts
// Updated: December 21, 2025
// Fully synced with backend /api/orders/analytics response

export interface AnalyticsPeriod {
  label: string;        // e.g., '7d', 'custom', 'today'
  start: string;        // YYYY-MM-DD
  end: string;          // YYYY-MM-DD
  days: number;
}

export interface Summary {
  totalOrders: number;
  totalRevenue: number;         // rounded
  avgOrderValue: number;        // rounded AOV
  totalDiscountGiven: number;   // rounded
  cancelledOrders: number;
  cancellationRate: string;     // e.g., "12.3%"
  ordersGrowth: string;         // e.g., "+15.4%" or "-8.2%"
  revenueGrowth: string;        // e.g., "+22.1%" or "100%"
}

export interface UserInsights {
  registeredOrders: number;
  guestOrders: number;
  registeredPercentage: string; // e.g., "78.5%"
}

export interface DailyTrend {
  date: string;     // YYYY-MM-DD
  orders: number;
  revenue: number;  // rounded
  aov: number;      // rounded
  discount: number; // rounded
}

export interface PaymentMethod {
  method: string;       // human-readable: "Cash on Delivery", "Wallet", etc.
  orders: number;
  revenue: number;      // rounded
  percentage: string;   // e.g., "45.2%"

  // ✅ REQUIRED for Recharts compatibility
  [key: string]: string | number;
}
export interface TopArea {
  area: string;         // area name or "Unknown"
  orders: number;
  revenue: number;      // rounded
}

export interface PeakHour {
  hour: number;         // 0–23
  label: string;        // e.g., "18:00 - 19:00"
  orders: number;
}

export interface TopDeal {
  code: string;
  title: string;
  uses: number;
  discountGiven: number;     // rounded total discount from this deal
  revenueGenerated: number;  // rounded revenue from orders using this deal
}

export interface Charts {
  dailyTrend: DailyTrend[];
  paymentMethods: PaymentMethod[];
  topAreas: TopArea[];
  peakHours: PeakHour[];
  topDeals: TopDeal[];
}

export interface AnalyticsData {
  period: AnalyticsPeriod;
  summary: Summary;
  userInsights: UserInsights;
  charts: Charts;
}

export interface AnalyticsResponse {
  success: boolean;
  analytics: AnalyticsData;
}

// Realtime Stats
export interface TodayStats {
  orders: number;
  revenue: number;  // rounded
  growth: string;   // e.g., "+15.4%" or "-8.2%" or "100%"
}

export interface LiveStats {
  pending: number;
  confirmed: number;
  preparing: number;
  outForDelivery: number;
  pendingPayment: number;
  cancelledToday: number;
}

export interface RealtimeData {
  updatedAt: string;        // ISO string
  today: TodayStats;
  live: LiveStats;
  activeOrders: number;
  systemStatus: string;     // e.g., "operational"
}

export interface RealtimeResponse {
  success: boolean;
  realtime: RealtimeData;
}