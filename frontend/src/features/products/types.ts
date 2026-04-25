export type { Product, Category } from '@/types';

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  search?: string;
}

export interface ProductListParams extends ProductFilters {
  page?: number;
  limit?: number;
}
