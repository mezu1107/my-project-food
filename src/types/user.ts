// src/types/user.ts
// src/types/user.ts
export interface Customer {
  _id: string;
  name: string;
  phone: string;
  email?: string | null;
  createdAt: string;
  lastActiveAt: string;
  isActive: boolean;  // ← Must be included!
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface CustomersApiResponse {
  success: true;
  data: {
    users: Customer[];
    pagination: Pagination;
  };
}

export interface CustomerApiResponse {
  success: true;
  user: Customer;
}

export interface ActionApiResponse {
  success: true;
  message: string;
}