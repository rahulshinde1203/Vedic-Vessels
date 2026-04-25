'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import {
  fetchTicketById,
  addTicketReply,
  type SupportTicket,
  type SupportReply,
  type TicketStatus,
} from '@/services/support.service';

// ── Helpers ───────────────────────────────────────────────────────────────────

const BADGE: Record<TicketStatus, string> = {
  OPEN:        'bg-red-100    text-red-700',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
  RESOLVED:    'bg-green-100  text-green-700',
};

const BADGE_LABEL: Record<TicketStatus, string> = {
  OPEN:        'Open',
  IN_PROGRESS: 'In Progress',
  RESOLVED:    'Resolved',
};

// ── Chat Bubble ───────────────────────────────────────────────────────────────

function ChatBubble({ reply }: { reply: SupportReply }) {
  return (
    <div className={`flex ${reply.isAdmin ? 'justify-start' : 'justify-end'}`}>
      <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
        reply.isAdmin
          ? 'bg-gray-100 text-gray-800 rounded-tl-sm'
          : 'bg-brand-gold text-brand-charcoal rounded-tr-sm'
      }`}>
        {reply.isAdmin && (
          <p className="text-[10px] font-bold text-blue-600 mb-1 uppercase tracking-wide">Support Team</p>
        )}
        <p>{reply.message}</p>
        <p className={`text-[10px] mt-1.5 ${reply.isAdmin ? 'text-gray-400' : 'text-brand-charcoal/60'}`}>
          {new Date(reply.createdAt).toLocaleTimeString('en-IN', {
            hour: '2-digit', minute: '2-digit',
          })}{' '}
          · {new Date(reply.createdAt).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short',
          })}
        </p>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SupportTicketPage() {
  const params  = useParams();
  const router  = useRouter();
  const token   = useAuthStore((s) => s.token);
  const bottomRef = useRef<HTMLDivElement>(null);

  const [ticket,  setTicket]  = useState<(SupportTicket & { replies: SupportReply[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [reply,   setReply]   = useState('');
  const [sending, setSending] = useState(false);

  const ticketId = Number(params.id);

  useEffect(() => {
    if (!token) { router.replace('/login'); return; }
    fetchTicketById(ticketId)
      .then(setTicket)
      .catch((e) => setError(e.message ?? 'Ticket not found'))
      .finally(() => setLoading(false));
  }, [token, ticketId, router]);

  // Scroll to bottom on new replies
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [ticket?.replies.length]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim() || !ticket) return;
    setSending(true);
    try {
      const newReply = await addTicketReply(ticketId, reply.trim());
      setTicket((prev) => prev ? { ...prev, replies: [...prev.replies, newReply] } : prev);
      setReply('');
    } catch (err: any) {
      setError(err.message ?? 'Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 bg-white rounded-xl animate-pulse border border-gray-100" />
        ))}
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <p className="text-red-500 text-sm mb-4">{error || 'Ticket not found'}</p>
        <Link href="/support" className="text-sm text-brand-gold hover:underline">← Back to Support</Link>
      </div>
    );
  }

  const isResolved = ticket.status === 'RESOLVED';

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-6 flex flex-col flex-1" style={{ maxHeight: 'calc(100vh - 130px)' }}>

        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <Link href="/support" className="text-xs text-gray-400 hover:text-brand-gold transition-colors">
              ← Support
            </Link>
            <h1 className="text-base font-bold text-gray-900 mt-1 leading-snug">{ticket.subject}</h1>
            {ticket.orderId && (
              <p className="text-xs text-gray-400 mt-0.5">
                Related to{' '}
                <Link href={`/orders/${ticket.orderId}`} className="text-brand-gold hover:underline">
                  Order #{String(ticket.orderId).padStart(4, '0')}
                </Link>
              </p>
            )}
          </div>
          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0 ${BADGE[ticket.status]}`}>
            {BADGE_LABEL[ticket.status]}
          </span>
        </div>

        {/* Conversation */}
        <div className="flex-1 overflow-y-auto bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3 mb-4" style={{ minHeight: 0 }}>

          {/* Original message */}
          <div className="flex justify-end">
            <div className="max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed bg-brand-gold text-brand-charcoal rounded-tr-sm">
              <p>{ticket.message}</p>
              <p className="text-[10px] mt-1.5 text-brand-charcoal/60">
                {new Date(ticket.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}{' '}
                · {new Date(ticket.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </p>
            </div>
          </div>

          {/* Replies */}
          {ticket.replies.map((r) => (
            <ChatBubble key={r.id} reply={r} />
          ))}

          {ticket.replies.length === 0 && (
            <div className="text-center py-6 text-xs text-gray-400">
              Our support team will respond shortly.
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Reply box */}
        {isResolved ? (
          <div className="text-center py-3 text-sm text-gray-400 bg-white rounded-xl border border-gray-100">
            This ticket has been resolved.{' '}
            <Link href="/support" className="text-brand-gold hover:underline">Open a new ticket</Link>
          </div>
        ) : (
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              type="text"
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Type your message…"
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 transition-all"
            />
            <button
              type="submit"
              disabled={sending || !reply.trim()}
              className="px-5 py-3 rounded-xl bg-brand-gold text-brand-charcoal text-sm font-bold hover:bg-brand-gold-dark disabled:opacity-50 transition-colors"
            >
              {sending ? '…' : 'Send'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
