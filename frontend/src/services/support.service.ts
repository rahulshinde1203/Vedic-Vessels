import { userApiFetch } from '@/lib/api';

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';

export interface SupportReply {
  id:        number;
  ticketId:  number;
  message:   string;
  isAdmin:   boolean;
  createdAt: string;
}

export interface SupportTicket {
  id:        number;
  subject:   string;
  message:   string;
  status:    TicketStatus;
  orderId:   number | null;
  createdAt: string;
  updatedAt: string;
  lastReply: SupportReply | null;
  replies?:  SupportReply[];
}

export interface CreateTicketInput {
  subject:  string;
  message:  string;
  orderId?: number;
}

export const createTicket = (body: CreateTicketInput): Promise<SupportTicket> =>
  userApiFetch<SupportTicket>('/support', {
    method: 'POST',
    body:   JSON.stringify(body),
  });

export const fetchMyTickets = (): Promise<SupportTicket[]> =>
  userApiFetch<SupportTicket[]>('/support/my');

export const fetchTicketById = (id: number): Promise<SupportTicket & { replies: SupportReply[] }> =>
  userApiFetch<SupportTicket & { replies: SupportReply[] }>(`/support/${id}`);

export const addTicketReply = (ticketId: number, message: string): Promise<SupportReply> =>
  userApiFetch<SupportReply>(`/support/${ticketId}/reply`, {
    method: 'POST',
    body:   JSON.stringify({ message }),
  });
