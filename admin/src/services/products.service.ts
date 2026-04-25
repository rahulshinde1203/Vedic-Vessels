import { apiFetch } from '@/lib/api';
import { useAdminStore } from '@/store/auth.store';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface AdminProduct {
  id:              number;
  name:            string;
  description:     string | null;
  mrp:             string;
  price:           string;
  discountPercent: string;
  stock:           number;
  imageUrl:        string | null;
  images:          string[];
  isActive:        boolean;
  categoryId:      number;
  category:        { id: number; name: string };
  createdAt:       string;
}

export interface UpdateProductInput {
  name?:        string;
  description?: string;
  mrp?:         number;
  price?:       number;
  stock?:       number;
  categoryId?:  number;
  isActive?:    boolean;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function authOnlyHeaders(): Record<string, string> {
  const token = useAdminStore.getState().token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function formDataFetch<T>(
  path:   string,
  method: string,
  body:   FormData,
): Promise<T> {
  const res  = await fetch(`${BASE}${path}`, {
    method,
    headers: authOnlyHeaders(), // NO Content-Type — browser sets multipart boundary
    body,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message ?? 'Request failed');
  return json.data as T;
}

// ── API calls ─────────────────────────────────────────────────────────────────

export const fetchAdminProducts = () =>
  apiFetch<AdminProduct[]>('/admin/products');

export const createAdminProduct = (formData: FormData) =>
  formDataFetch<AdminProduct>('/admin/products', 'POST', formData);

export const updateAdminProduct = (id: number, formData: FormData) =>
  formDataFetch<AdminProduct>(`/admin/products/${id}`, 'PATCH', formData);

export const deleteAdminProduct = (id: number) =>
  apiFetch<null>(`/admin/products/${id}`, { method: 'DELETE' });
