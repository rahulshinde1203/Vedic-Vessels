import { apiFetch } from '@/lib/api';

export type OrderStatus = 'PENDING' | 'SHIPPED' | 'DELIVERED';

export interface AdminOrderRow {
  id:          number;
  user:        { id: number; phone: string; name: string | null };
  totalAmount: number;
  status:      OrderStatus;
  itemCount:   number;
  createdAt:   string;
}

export interface AdminOrderDetail {
  id:              number;
  user:            { id: number; phone: string; name: string | null };
  totalAmount:     string;
  status:          OrderStatus;
  deliveryAddress: string | null;
  createdAt:       string;
  orderItems: {
    id:        number;
    quantity:  number;
    price:     string;
    product:   { id: number; name: string; imageUrl: string | null };
  }[];
}

export const fetchAdminOrders = () =>
  apiFetch<AdminOrderRow[]>('/admin/orders');

export const fetchAdminOrderById = (id: number) =>
  apiFetch<AdminOrderDetail>(`/admin/orders/${id}`);

export interface ShipOrderInput {
  trackingId?:  string;
  courierName?: string;
  trackingUrl?: string;
}

export const updateAdminOrderStatus = (
  id:       number,
  status:   OrderStatus,
  tracking: ShipOrderInput = {},
) =>
  apiFetch<{ id: number; status: OrderStatus }>(`/admin/orders/${id}`, {
    method: 'PATCH',
    body:   JSON.stringify({ status, ...tracking }),
  });
