export type OrderStatus = 'PENDING' | 'SHIPPED' | 'DELIVERED';

export interface AdminOrder {
  id: string;
  customer: string;
  amount: number;
  status: OrderStatus | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  date: string;
  items: number;
}

export interface AdminProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  active: boolean;
}

export interface AdminUser {
  id: string;
  name: string;
  phone: string;
  orders: number;
  joinedAt: string;
}

export interface StatCardData {
  label: string;
  value: string;
  change: string;
  up: boolean;
  iconPath: string;
  iconBg: string;
  iconColor: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
