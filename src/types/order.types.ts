// src/types/order.types.ts
export type PaymentMethod = 'cod' | 'card' | 'easypaisa' | 'jazzcash' | 'bank';

export interface OrderItem {
  menuItem: {
    _id: string;
    name: string;
    price: number;
    image?: string;
  };
  quantity: number;
  priceAtOrder: number;
}

export interface GuestInfo {
  name: string;
  phone: string;
  isGuest: true;
}

export interface AddressDetails {
  fullAddress: string;
  label: string;
  floor?: string;
  instructions?: string;
}

export interface AppliedDeal {
  dealId: string;
  code: string;
  title: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxDiscountAmount?: number;
  appliedDiscount: number;
}

export interface Order {
  _id: string;
  shortId?: string;
  orderNumber?: string;
  items: OrderItem[];
  customer?: { _id: string; name: string; phone: string };
  guestInfo?: GuestInfo;
  addressDetails: AddressDetails;
  area: { _id: string; name: string };
  deliveryZone: { _id: string; deliveryFee: number; minOrderAmount: number };
  totalAmount: number;
  deliveryFee: number;
  discountApplied: number;
  finalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'canceled' | 'refunded';
  status:
    | 'pending'
    | 'pending_payment'
    | 'confirmed'
    | 'preparing'
    | 'out_for_delivery'
    | 'delivered'
    | 'cancelled'
    | 'rejected';
  bankTransferReference?: string;
  receiptUrl?: string;
  placedAt: string;
  estimatedDelivery: string;
  appliedDeal?: AppliedDeal | null;
  rider?: { _id: string; name: string; phone: string } | null;
}

export interface CreateOrderPayload {
  items: { menuItem: string; quantity: number }[];
  addressId: string;
  paymentMethod: PaymentMethod;
  promoCode?: string;
}

export interface CreateGuestOrderPayload {
  items: { menuItem: string; quantity: number }[];
  guestAddress: {
    fullAddress: string;
    areaId: string;
    label?: string;
    floor?: string;
    instructions?: string;
  };
  name: string;
  phone: string;
  paymentMethod: PaymentMethod;
  promoCode?: string;
}

export interface OrderResponse {
  success: true;
  message: string;
  order: Order;
  clientSecret?: string;
  bankDetails?: {
    bankName: string;
    accountTitle: string;
    accountNumber: string;
    iban: string;
    branch: string;
    amount: number;
    reference: string;
  };
}

export interface OrdersResponse {
  success: true;
  orders: Order[];
}

// src/types/order.types.ts
// ... your existing types ...

// === STATUS HELPERS ===
export const ORDER_STATUS_LABELS = {
  pending: 'Pending',
  pending_payment: 'Payment Pending',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  out_for_delivery: 'On the Way',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  rejected: 'Rejected',
} as const;

export const ORDER_STATUS_COLORS = {
  pending: 'bg-yellow-500',
  pending_payment: 'bg-orange-500',
  confirmed: 'bg-blue-500',
  preparing: 'bg-purple-500',
  out_for_delivery: 'bg-indigo-500',
  delivered: 'bg-green-500',
  cancelled: 'bg-red-500',
  rejected: 'bg-red-600',
} as const;