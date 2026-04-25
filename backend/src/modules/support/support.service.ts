import prisma from '../../common/lib/prisma';
import type { CreateTicketBody } from './support.types';

function makeError(message: string, statusCode: number): Error {
  const err = new Error(message);
  (err as any).statusCode = statusCode;
  return err;
}

export async function createTicket(userId: number, body: CreateTicketBody) {
  const subject = body.subject?.trim();
  const message = body.message?.trim();

  if (!subject) throw makeError('Subject is required', 400);
  if (!message) throw makeError('Message is required', 400);

  const orderId = body.orderId
    ? parseInt(String(body.orderId), 10)
    : undefined;

  if (orderId !== undefined) {
    const order = await prisma.order.findFirst({ where: { id: orderId, userId } });
    if (!order) throw makeError('Order not found', 404);
  }

  return prisma.supportTicket.create({
    data:    { userId, orderId: orderId ?? null, subject, message },
    include: { replies: true },
  });
}

export async function getMyTickets(userId: number) {
  const tickets = await prisma.supportTicket.findMany({
    where:   { userId },
    orderBy: { updatedAt: 'desc' },
    include: {
      order:   { select: { id: true } },
      replies: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
  });
  return tickets.map((t) => ({
    id:         t.id,
    subject:    t.subject,
    status:     t.status,
    orderId:    t.orderId,
    createdAt:  t.createdAt,
    updatedAt:  t.updatedAt,
    lastReply:  t.replies[0] ?? null,
  }));
}

export async function getTicketById(userId: number, ticketId: number) {
  const ticket = await prisma.supportTicket.findFirst({
    where:   { id: ticketId, userId },
    include: {
      order:   { select: { id: true, status: true } },
      replies: { orderBy: { createdAt: 'asc' } },
    },
  });
  if (!ticket) throw makeError('Ticket not found', 404);
  return ticket;
}

export async function addReply(userId: number, ticketId: number, message: string) {
  const ticket = await prisma.supportTicket.findFirst({ where: { id: ticketId, userId } });
  if (!ticket) throw makeError('Ticket not found', 404);
  if (ticket.status === 'RESOLVED') throw makeError('Cannot reply to a resolved ticket', 400);
  if (!message?.trim()) throw makeError('Message is required', 400);

  return prisma.supportReply.create({
    data: { ticketId, message: message.trim(), isAdmin: false },
  });
}
