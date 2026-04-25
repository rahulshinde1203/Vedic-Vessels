import { apiFetch } from '@/lib/api';

export interface AdminUserRow {
  id:         number;
  phone:      string;
  name:       string | null;
  role:       string;
  orderCount: number;
  createdAt:  string;
}

export const fetchAdminUsers = () =>
  apiFetch<AdminUserRow[]>('/admin/users');
