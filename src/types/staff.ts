// src/types/staff.ts
export type StaffRole = 'kitchen' | 'delivery_manager' | 'support' | 'finance';

export interface StaffUser {
  _id: string;
  name: string;
  phone: string;
  email?: string | null;
  role: 'customer' | 'rider' | StaffRole;
  createdAt: string;
}

export interface StaffApiResponse {
  success: true;
  data: {
    users: StaffUser[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
}