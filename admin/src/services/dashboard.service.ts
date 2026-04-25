import { apiFetch } from '@/lib/api';

export interface DashboardStats {
  totalOrders:      number;
  totalRevenue:     number;
  totalProducts:    number;
  totalUsers:       number;
  pendingOrders:    number;
  lowStockProducts: number;
}

export async function fetchStats(): Promise<DashboardStats> {
  return apiFetch<DashboardStats>('/admin/stats');
}
