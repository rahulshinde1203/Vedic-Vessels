'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { fetchOrderById, type MyOrder } from '@/services/order.service';
import { formatPrice } from '@/lib/utils';

// ── Types ─────────────────────────────────────────────────────────────────────

type Status = 'PENDING' | 'SHIPPED' | 'DELIVERED';

// ── Helpers ───────────────────────────────────────────────────────────────────

const TIMELINE: { key: Status; label: string; icon: string }[] = [
  { key: 'PENDING',   label: 'Order Placed',       icon: '📋' },
  { key: 'SHIPPED',   label: 'Shipped',             icon: '🚚' },
  { key: 'DELIVERED', label: 'Delivered',           icon: '✅' },
];

const STATUS_ORDER: Record<Status, number> = { PENDING: 0, SHIPPED: 1, DELIVERED: 2 };

function StatusTimeline({ status }: { status: Status }) {
  const current = STATUS_ORDER[status] ?? 0;
  return (
    <div className="flex items-start gap-0">
      {TIMELINE.map((step, i) => {
        const done    = STATUS_ORDER[step.key] <= current;
        const isLast  = i === TIMELINE.length - 1;
        return (
          <div key={step.key} className="flex-1 flex flex-col items-center">
            <div className="flex items-center w-full">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 transition-colors z-10 ${
                done ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-gray-200 text-gray-400'
              }`}>
                {done ? '✓' : <span className="text-xs">{step.icon}</span>}
              </div>
              {!isLast && (
                <div className={`flex-1 h-0.5 ${done && STATUS_ORDER[TIMELINE[i + 1].key] <= current ? 'bg-green-400' : 'bg-gray-200'}`} />
              )}
            </div>
            <p className={`text-[10px] font-semibold mt-1.5 text-center ${done ? 'text-green-600' : 'text-gray-400'}`}>
              {step.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function OrderDetailPage() {
  const params  = useParams();
  const router  = useRouter();
  const token   = useAuthStore((s) => s.token);
  const [order,   setOrder]   = useState<MyOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  const orderId = Number(params.id);

  useEffect(() => {
    if (!token) { router.replace('/login'); return; }
    if (!orderId) { setError('Invalid order'); setLoading(false); return; }
    fetchOrderById(orderId)
      .then(setOrder)
      .catch((e) => setError(e.message ?? 'Order not found'))
      .finally(() => setLoading(false));
  }, [token, orderId, router]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 bg-white rounded-xl animate-pulse border border-gray-100" />
        ))}
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <p className="text-red-500 text-sm mb-4">{error || 'Order not found'}</p>
        <Link href="/my-orders" className="text-sm text-brand-gold hover:underline">← Back to Orders</Link>
      </div>
    );
  }

  const hasTracking = order.trackingId || order.courierName;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 lg:py-12">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-6">
          <Link href="/my-orders" className="hover:text-brand-gold transition-colors">My Orders</Link>
          <span>/</span>
          <span className="text-gray-600 font-medium">Order #{String(order.id).padStart(4, '0')}</span>
        </div>

        <div className="space-y-4">

          {/* Status Timeline */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-5">
              Order Status
            </p>
            <StatusTimeline status={order.status as Status} />
          </div>

          {/* Tracking Info */}
          {hasTracking && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-3">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Tracking</p>
              {order.courierName && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Courier</span>
                  <span className="font-semibold text-gray-800">{order.courierName}</span>
                </div>
              )}
              {order.trackingId && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tracking ID</span>
                  <span className="font-mono font-semibold text-gray-800">{order.trackingId}</span>
                </div>
              )}
              {order.trackingUrl && (
                <a
                  href={order.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 w-full justify-center py-2.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-sm font-bold hover:bg-blue-100 transition-colors mt-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Track Package
                </a>
              )}
            </div>
          )}

          {/* Order Items */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-4">Items</p>
            <div className="space-y-4">
              {order.orderItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-amber-50 border border-gray-100 shrink-0 flex items-center justify-center">
                    {item.product.imageUrl ? (
                      <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xl">🏺</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/product/${item.product.id}`}
                      className="text-sm font-semibold text-gray-800 hover:text-brand-gold transition-colors truncate block"
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-xs text-gray-400 mt-0.5">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-sm font-bold text-gray-900 shrink-0">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="border-t border-gray-100 pt-4 mt-4 flex justify-between">
              <span className="text-sm font-semibold text-gray-700">Order Total</span>
              <span className="text-base font-bold text-brand-gold">{formatPrice(order.totalAmount)}</span>
            </div>
          </div>

          {/* Delivery Address */}
          {order.deliveryAddress && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Delivery Address</p>
              <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                {order.deliveryAddress}
              </p>
            </div>
          )}

          {/* Support CTA */}
          <div className="bg-amber-50 rounded-xl border border-amber-100 p-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-gray-800">Need help with this order?</p>
              <p className="text-xs text-gray-500 mt-0.5">Raise a support ticket and we&apos;ll get back to you.</p>
            </div>
            <Link
              href={`/support?orderId=${order.id}`}
              className="shrink-0 px-4 py-2 rounded-lg bg-brand-gold text-brand-charcoal text-xs font-bold hover:bg-brand-gold-dark transition-colors"
            >
              Get Help
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
