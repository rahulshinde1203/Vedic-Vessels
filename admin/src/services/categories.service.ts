import { apiFetch } from '@/lib/api';

export interface AdminCategory {
  id:           number;
  name:         string;
  isActive:     boolean;
  productCount: number;
  createdAt:    string;
}

export const fetchAdminCategories = () =>
  apiFetch<AdminCategory[]>('/admin/categories');

export const createAdminCategory = (name: string) =>
  apiFetch<AdminCategory>('/admin/categories', {
    method: 'POST',
    body:   JSON.stringify({ name }),
  });
