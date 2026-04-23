export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  category: string;
  description?: string;
  imageUrl?: string;
  inStock: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string;
}

export interface User {
  id: string;
  name: string;
  email?: string;
  phone: string;
  role: 'USER' | 'ADMIN';
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
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
