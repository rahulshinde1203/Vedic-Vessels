'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { fetchMyOrders, type MyOrder } from '@/services/order.service';
import { formatPrice } from '@/lib/utils';

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_STYLE: Record<string, string> = {
  PENDING:   'bg-amber-100 text-amber-700 border-amber-200',
  SHIPPED:   'bg-blue-100  text-blue-700  border-blue-200',
  DELIVERED: 'bg-green-100 text-green-700 border-green-200',
};

const STATUS_LABEL: Record<string, string> = {
  PENDING:   'Pending',
  SHIPPED:   'Shipped',
  DELIVERED: 'Delivered',
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function MyOrdersPage() {
  const router   = useRouter();
  const token    = useAuthStore((s) => s.token);
  const [orders,  setOrders]  = useState<MyOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    if (!token) { router.replace('/login'); return; }
    fetchMyOrders()
      .then(setOrders)
      .catch((e) => setError(e.message ?? 'Failed to load orders'))
      .finally(() => setLoading(false));
  }, [token, router]);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 lg:py-12">

        <h1 className="font-serif text-2xl font-bold text-brand-charcoal mb-6">My Orders</h1>

        {loading && (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-28 bg-white rounded-xl animate-pulse border border-gray-100" />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="text-center py-16 text-red-500 text-sm">{error}</div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <span className="text-5xl mb-4">📦</span>
            <p className="text-lg font-semibold text-gray-700 mb-1">No orders yet</p>
            <p className="text-sm text-gray-400 mb-6">Your order history will appear here.</p>
            <Link
              href="/shop"
              className="px-6 py-2.5 rounded-full bg-brand-gold text-brand-charcoal text-sm font-bold hover:bg-brand-gold-dark transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => {
              const firstItem = order.orderItems[0];
              const extraCount = order.orderItems.length - 1;
              return (
                <div
                  key={order.id}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col sm:flex-row sm:items-center gap-4"
                >
                  {/* Thumbnail */}
                  <div className="shrink-0 w-14 h-14 rounded-lg overflow-hidden bg-amber-50 border border-gray-100 flex items-center justify-center">
                    {firstItem?.product.imageUrl ? (
                      <img
                        src={firstItem.product.imageUrl}
                        alt={firstItem.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl">🏺</span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <p className="text-xs text-gray-400 font-mono">
                          Order #{String(order.id).padStart(4, '0')}
                        </p>
                        <p className="text-sm font-semibold text-gray-800 truncate max-w-xs mt-0.5">
                          {firstItem?.product.name}
                          {extraCount > 0 && (
                            <span className="text-gray-400 font-normal"> +{extraCount} more</span>
                          )}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric',
                          })}
                        </p>
                      </div>
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${STATUS_STYLE[order.status] ?? ''}`}>
                        {STATUS_LABEL[order.status] ?? order.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                      <span className="text-sm font-bold text-gray-900">
                        {formatPrice(order.totalAmount)}
                      </span>
                      <Link
                        href={`/orders/${order.id}`}
                        className="text-xs font-bold text-brand-gold hover:text-brand-gold-dark transition-colors"
                      >
                        View Details →
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
