import { apiFetch } from '@/lib/api';

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';

export interface AdminTicketReply {
  id:        number;
  ticketId:  number;
  message:   string;
  isAdmin:   boolean;
  createdAt: string;
}

export interface AdminTicketRow {
  id:        number;
  subject:   string;
  status:    TicketStatus;
  user:      { id: number; phone: string; name: string | null };
  orderId:   number | null;
  createdAt: string;
  lastReply: AdminTicketReply | null;
}

export interface AdminTicketDetail {
  id:        number;
  subject:   string;
  message:   string;
  status:    TicketStatus;
  orderId:   number | null;
  createdAt: string;
  user:      { id: number; phone: string; name: string | null };
  order:     { id: number; status: string } | null;
  replies:   AdminTicketReply[];
}

export const fetchAdminTickets = () =>
  apiFetch<AdminTicketRow[]>('/admin/support');

export const fetchAdminTicketById = (id: number) =>
  apiFetch<AdminTicketDetail>(`/admin/support/${id}`);

export const updateAdminTicketStatus = (id: number, status: TicketStatus) =>
  apiFetch<{ id: number; status: TicketStatus }>(`/admin/support/${id}`, {
    method: 'PATCH',
    body:   JSON.stringify({ status }),
  });

export const addAdminTicketReply = (id: number, message: string) =>
  apiFetch<AdminTicketReply>(`/admin/support/${id}/reply`, {
    method: 'POST',
    body:   JSON.stringify({ message }),
  });
