'use client';

import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import Badge from '@/components/ui/Badge';
import {
  fetchAdminTickets,
  fetchAdminTicketById,
  updateAdminTicketStatus,
  addAdminTicketReply,
  type AdminTicketRow,
  type AdminTicketDetail,
  type TicketStatus,
} from '@/services/support.service';

// ── Constants ─────────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<TicketStatus, 'error' | 'warning' | 'success'> = {
  OPEN:        'error',
  IN_PROGRESS: 'warning',
  RESOLVED:    'success',
};

const STATUS_LABEL: Record<TicketStatus, string> = {
  OPEN:        'Open',
  IN_PROGRESS: 'In Progress',
  RESOLVED:    'Resolved',
};

const ALL_STATUSES: TicketStatus[] = ['OPEN', 'IN_PROGRESS', 'RESOLVED'];

// ── Ticket Detail Modal ───────────────────────────────────────────────────────

function TicketDetailModal({
  ticketId,
  onClose,
  onStatusUpdate,
}: {
  ticketId:       number;
  onClose:        () => void;
  onStatusUpdate: (id: number, status: TicketStatus) => void;
}) {
  const [ticket,  setTicket]  = useState<AdminTicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [reply,   setReply]   = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchAdminTicketById(ticketId).then(setTicket).finally(() => setLoading(false));
  }, [ticketId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [ticket?.replies.length]);

  const handleStatusChange = async (status: TicketStatus) => {
    if (!ticket) return;
    try {
      await updateAdminTicketStatus(ticket.id, status);
      setTicket((prev) => prev ? { ...prev, status } : prev);
      onStatusUpdate(ticket.id, status);
      toast.success(`Ticket status updated to ${STATUS_LABEL[status]}`);
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to update status');
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim() || !ticket) return;
    setSending(true);
    try {
      const newReply = await addAdminTicketReply(ticket.id, reply.trim());
      setTicket((prev) => prev ? { ...prev, replies: [...prev.replies, newReply], status: 'IN_PROGRESS' } : prev);
      onStatusUpdate(ticket.id, 'IN_PROGRESS');
      setReply('');
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg flex flex-col" style={{ maxHeight: '90vh' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <h2 className="text-sm font-bold text-slate-800 truncate max-w-xs">
            {loading ? 'Loading…' : ticket?.subject}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-lg leading-none ml-2">×</button>
        </div>

        {loading ? (
          <div className="p-6 space-y-3 flex-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 bg-slate-100 rounded animate-pulse" />
            ))}
          </div>
        ) : ticket ? (
          <>
            {/* Ticket meta */}
            <div className="px-6 py-3 border-b border-slate-50 flex items-center justify-between gap-3 shrink-0">
              <div className="text-xs text-slate-500">
                <span className="font-semibold text-slate-700">{ticket.user.name ?? ticket.user.phone}</span>
                {ticket.user.name && <span className="ml-1.5 text-slate-400">{ticket.user.phone}</span>}
                {ticket.orderId && (
                  <span className="ml-2 text-slate-400">· Order #{ticket.orderId}</span>
                )}
              </div>
              <select
                value={ticket.status}
                onChange={(e) => handleStatusChange(e.target.value as TicketStatus)}
                className="text-xs font-semibold border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-brand-gold/30 bg-white"
              >
                {ALL_STATUSES.map((s) => (
                  <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                ))}
              </select>
            </div>

            {/* Conversation */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3" style={{ minHeight: 0 }}>
              {/* Original message */}
              <div className="flex justify-end">
                <div className="max-w-[80%] bg-slate-100 text-slate-800 rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm">
                  <p className="text-[10px] font-semibold text-slate-500 mb-1">Customer</p>
                  <p>{ticket.message}</p>
                  <p className="text-[10px] text-slate-400 mt-1.5">
                    {new Date(ticket.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              {ticket.replies.map((r) => (
                <div key={r.id} className={`flex ${r.isAdmin ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                    r.isAdmin
                      ? 'bg-brand-gold/10 text-brand-charcoal rounded-tl-sm'
                      : 'bg-slate-100 text-slate-800 rounded-tr-sm'
                  }`}>
                    <p className="text-[10px] font-semibold mb-1 text-slate-500">
                      {r.isAdmin ? 'You (Admin)' : 'Customer'}
                    </p>
                    <p>{r.message}</p>
                    <p className="text-[10px] text-slate-400 mt-1.5">
                      {new Date(r.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}

              <div ref={bottomRef} />
            </div>

            {/* Reply box */}
            {ticket.status !== 'RESOLVED' ? (
              <form onSubmit={handleReply} className="px-6 py-4 border-t border-slate-100 flex gap-2 shrink-0">
                <input
                  type="text"
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Reply to customer…"
                  className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/30 transition-all"
                />
                <button
                  type="submit"
                  disabled={sending || !reply.trim()}
                  className="px-4 py-2 rounded-lg bg-brand-gold text-brand-charcoal text-sm font-bold hover:bg-brand-gold-dark disabled:opacity-50 transition-colors"
                >
                  {sending ? '…' : 'Reply'}
                </button>
              </form>
            ) : (
              <div className="px-6 py-3 border-t border-slate-100 text-center text-xs text-slate-400 shrink-0">
                Ticket resolved — no more replies.
              </div>
            )}
          </>
        ) : (
          <div className="p-6 text-center text-slate-400 text-sm">Ticket not found</div>
        )}
      </div>
    </div>
  );
}

// ── Support Page ──────────────────────────────────────────────────────────────

export default function AdminSupportPage() {
  const [tickets,   setTickets]   = useState<AdminTicketRow[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [filter,    setFilter]    = useState<TicketStatus | 'ALL'>('ALL');
  const [detailId,  setDetailId]  = useState<number | null>(null);

  useEffect(() => {
    fetchAdminTickets().then(setTickets).finally(() => setLoading(false));
  }, []);

  const handleStatusUpdate = (id: number, status: TicketStatus) => {
    setTickets((prev) => prev.map((t) => t.id === id ? { ...t, status } : t));
  };

  const filtered = filter === 'ALL'
    ? tickets
    : tickets.filter((t) => t.status === filter);

  const counts: Record<TicketStatus | 'ALL', number> = {
    ALL:         tickets.length,
    OPEN:        tickets.filter((t) => t.status === 'OPEN').length,
    IN_PROGRESS: tickets.filter((t) => t.status === 'IN_PROGRESS').length,
    RESOLVED:    tickets.filter((t) => t.status === 'RESOLVED').length,
  };

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-slate-800">Support Tickets</h1>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {(['ALL', ...ALL_STATUSES] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all border ${
              filter === s
                ? 'bg-brand-gold text-brand-charcoal border-brand-gold'
                : 'bg-white text-slate-500 border-slate-200 hover:border-brand-gold/50'
            }`}
          >
            {s === 'ALL' ? 'All' : STATUS_LABEL[s]}
            <span className="ml-1.5 opacity-60">({counts[s]})</span>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 bg-slate-100 rounded animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {['#', 'Subject', 'Customer', 'Order', 'Status', 'Last Update', ''].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-[11px] font-medium text-slate-500 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs text-brand-gold font-semibold">
                      #{ticket.id}
                    </td>
                    <td className="px-5 py-3.5 max-w-48">
                      <p className="text-slate-800 font-medium truncate">{ticket.subject}</p>
                      {ticket.lastReply && (
                        <p className="text-slate-400 text-xs truncate">
                          {ticket.lastReply.isAdmin ? 'Admin: ' : 'User: '}
                          {ticket.lastReply.message}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 text-xs">
                      <p>{ticket.user.name ?? ticket.user.phone}</p>
                      {ticket.user.name && <p className="text-slate-400">{ticket.user.phone}</p>}
                    </td>
                    <td className="px-5 py-3.5 text-slate-400 text-xs font-mono">
                      {ticket.orderId ? `#${ticket.orderId}` : '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge label={STATUS_LABEL[ticket.status]} variant={STATUS_BADGE[ticket.status]} />
                    </td>
                    <td className="px-5 py-3.5 text-slate-400 text-xs whitespace-nowrap">
                      {new Date(ticket.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short',
                      })}
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => setDetailId(ticket.id)}
                        className="text-xs font-medium text-brand-gold hover:text-brand-gold-dark transition-colors"
                      >
                        Open
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-slate-400 text-sm">
                      No {filter === 'ALL' ? '' : STATUS_LABEL[filter].toLowerCase() + ' '}tickets
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {detailId !== null && (
        <TicketDetailModal
          ticketId={detailId}
          onClose={() => setDetailId(null)}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </div>
  );
}
