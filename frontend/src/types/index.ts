export interface Product {
  id: number;
  name: string;
  slug?: string;
  description?: string;
  price: number;
  mrp?: number;
  discount?: number;
  discountPercent?: number;
  images?: string[];
  stock: number;
  imageUrl?: string | null;
  isActive: boolean;
  category: { id: number; name: string };
  rating?: number;
  reviewCount?: number;
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

// Flat shape stored in the cart (no nested Product to avoid staleness)
export interface CartItem {
  id: number;
  name: string;
  price: number;
  priceInPaise: number;   // Math.round(price * 100) — integer paise for payment APIs
  imageUrl?: string | null;
  quantity: number;
  stock: number;          // snapshot; updated by updateItemStock()
  isActive: boolean;      // snapshot; updated by markItemInactive()
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
