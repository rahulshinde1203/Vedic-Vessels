'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import {
  createTicket,
  fetchMyTickets,
  type SupportTicket,
  type TicketStatus,
} from '@/services/support.service';
import { fetchMyOrders } from '@/services/order.service';
import type { MyOrder } from '@/services/order.service';

// ── Helpers ───────────────────────────────────────────────────────────────────

const BADGE: Record<TicketStatus, string> = {
  OPEN:        'bg-red-100    text-red-700    border-red-200',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  RESOLVED:    'bg-green-100  text-green-700  border-green-200',
};

const BADGE_LABEL: Record<TicketStatus, string> = {
  OPEN:        'Open',
  IN_PROGRESS: 'In Progress',
  RESOLVED:    'Resolved',
};

// ── Create Ticket Form ────────────────────────────────────────────────────────

function CreateTicketForm({
  orders,
  defaultOrderId,
  onCreated,
}: {
  orders:         MyOrder[];
  defaultOrderId: number | null;
  onCreated:      (ticket: SupportTicket) => void;
}) {
  const [subject,   setSubject]   = useState('');
  const [message,   setMessage]   = useState('');
  const [orderId,   setOrderId]   = useState<string>(defaultOrderId ? String(defaultOrderId) : '');
  const [submitting, setSubmitting] = useState(false);
  const [error,     setError]     = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      setError('Subject and message are required');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const ticket = await createTicket({
        subject: subject.trim(),
        message: message.trim(),
        orderId: orderId ? Number(orderId) : undefined,
      });
      onCreated(ticket);
      setSubject('');
      setMessage('');
      setOrderId('');
    } catch (err: any) {
      setError(err.message ?? 'Failed to create ticket');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
      <h2 className="text-sm font-bold text-gray-800">Raise a Support Ticket</h2>

      {/* Order selector */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
          Related Order <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <select
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 transition-all"
        >
          <option value="">Select an order…</option>
          {orders.map((o) => (
            <option key={o.id} value={o.id}>
              Order #{String(o.id).padStart(4, '0')} — {o.status}
            </option>
          ))}
        </select>
      </div>

      {/* Subject */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Subject</label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="e.g. Package not delivered"
          maxLength={150}
          className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 transition-all"
        />
      </div>

      {/* Message */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Message</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          placeholder="Describe your issue in detail…"
          className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 transition-all resize-none"
        />
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full py-2.5 rounded-lg bg-brand-gold text-brand-charcoal text-sm font-bold hover:bg-brand-gold-dark transition-colors disabled:opacity-50"
      >
        {submitting ? 'Submitting…' : 'Submit Ticket'}
      </button>
    </form>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SupportPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const token        = useAuthStore((s) => s.token);
  const defaultOrderId = searchParams.get('orderId') ? Number(searchParams.get('orderId')) : null;

  const [tickets,  setTickets]  = useState<SupportTicket[]>([]);
  const [orders,   setOrders]   = useState<MyOrder[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(!!defaultOrderId);

  useEffect(() => {
    if (!token) { router.replace('/login'); return; }
    Promise.all([fetchMyTickets(), fetchMyOrders()])
      .then(([t, o]) => { setTickets(t); setOrders(o); })
      .finally(() => setLoading(false));
  }, [token, router]);

  const handleCreated = (ticket: SupportTicket) => {
    setTickets((prev) => [ticket, ...prev]);
    setShowForm(false);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 lg:py-12">

        <div className="flex items-center justify-between mb-6">
          <h1 className="font-serif text-2xl font-bold text-brand-charcoal">Support</h1>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="px-4 py-2 rounded-lg bg-brand-gold text-brand-charcoal text-xs font-bold hover:bg-brand-gold-dark transition-colors"
          >
            {showForm ? 'Cancel' : '+ New Ticket'}
          </button>
        </div>

        {showForm && (
          <div className="mb-6">
            <CreateTicketForm
              orders={orders}
              defaultOrderId={defaultOrderId}
              onCreated={handleCreated}
            />
          </div>
        )}

        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 bg-white rounded-xl animate-pulse border border-gray-100" />
            ))}
          </div>
        )}

        {!loading && tickets.length === 0 && !showForm && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="text-5xl mb-4">🎧</span>
            <p className="text-base font-semibold text-gray-700 mb-1">No support tickets yet</p>
            <p className="text-sm text-gray-400 mb-5">Have an issue? We&apos;re here to help.</p>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-2.5 rounded-full bg-brand-gold text-brand-charcoal text-sm font-bold hover:bg-brand-gold-dark transition-colors"
            >
              Create Ticket
            </button>
          </div>
        )}

        {!loading && tickets.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Your Tickets</p>
            {tickets.map((ticket) => (
              <Link
                key={ticket.id}
                href={`/support/${ticket.id}`}
                className="block bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:border-brand-gold/40 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{ticket.subject}</p>
                    {ticket.lastReply && (
                      <p className="text-xs text-gray-400 mt-0.5 truncate">
                        {ticket.lastReply.isAdmin ? '🔵 Admin: ' : 'You: '}
                        {ticket.lastReply.message}
                      </p>
                    )}
                    <p className="text-[10px] text-gray-400 mt-1">
                      {new Date(ticket.updatedAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                      {ticket.orderId && ` · Order #${String(ticket.orderId).padStart(4, '0')}`}
                    </p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${BADGE[ticket.status]}`}>
                    {BADGE_LABEL[ticket.status]}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
