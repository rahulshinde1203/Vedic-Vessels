import type { ApiResponse, PaginatedResponse, Product } from '@/types';
import type { ProductListParams } from '../types';

const BASE = process.env.NEXT_PUBLIC_API_URL;

export async function getProducts(params?: ProductListParams): Promise<PaginatedResponse<Product>> {
  const qs = new URLSearchParams();
  if (params?.page)              qs.set('page',     String(params.page));
  if (params?.limit)             qs.set('limit',    String(params.limit));
  if (params?.category)          qs.set('category', params.category);
  if (params?.search)            qs.set('search',   params.search);
  if (params?.inStock !== undefined) qs.set('inStock', String(params.inStock));

  const res = await fetch(`${BASE}/products?${qs}`);
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
}

export async function getProductBySlug(slug: string): Promise<ApiResponse<Product>> {
  const res = await fetch(`${BASE}/products/${slug}`);
  if (!res.ok) throw new Error('Failed to fetch product');
  return res.json();
}
