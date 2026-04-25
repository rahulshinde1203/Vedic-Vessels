'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { fetchOrderById, type MyOrder } from '@/services/order.service';
import { formatPrice } from '@/lib/utils';
import OrderTimeline from '@/components/shared/OrderTimeline';
import TrackingInfoCard from '@/components/shared/TrackingInfoCard';

// ── Status label ──────────────────────────────────────────────────────────────

const STATUS_STYLE: Record<string, string> = {
  PENDING:   'bg-amber-100 text-amber-700 border-amber-200',
  SHIPPED:   'bg-blue-100  text-blue-700  border-blue-200',
  DELIVERED: 'bg-green-100 text-green-700 border-green-200',
};
const STATUS_LABEL: Record<string, string> = {
  PENDING:   'Order Placed',
  SHIPPED:   'Shipped',
  DELIVERED: 'Delivered',
};

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
    if (!token)   { router.replace('/login'); return; }
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
          <div key={i} className="h-24 bg-white rounded-xl animate-pulse border border-gray-100" />
        ))}
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <span className="text-4xl block mb-4">📦</span>
        <p className="text-gray-700 font-semibold mb-1">{error || 'Order not found'}</p>
        <Link href="/my-orders" className="mt-4 inline-block text-sm text-brand-gold hover:underline">
          ← Back to My Orders
        </Link>
      </div>
    );
  }

  const statusLabel = STATUS_LABEL[order.status] ?? order.status;
  const statusStyle = STATUS_STYLE[order.status] ?? '';
  const firstItem   = order.orderItems[0];

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 lg:py-12">

        {/* ── Breadcrumb ── */}
        <nav className="flex items-center gap-2 text-xs text-gray-400 mb-6">
          <Link href="/" className="hover:text-brand-gold transition-colors">Home</Link>
          <span>/</span>
          <Link href="/my-orders" className="hover:text-brand-gold transition-colors">My Orders</Link>
          <span>/</span>
          <span className="text-gray-600 font-medium">Order #{String(order.id).padStart(4, '0')}</span>
        </nav>

        {/* ── Order header card ── */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-xs text-gray-400 font-mono">
                Order #{String(order.id).padStart(4, '0')}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs font-bold px-3 py-1 rounded-full border ${statusStyle}`}>
                {statusLabel}
              </span>
              <span className="text-base font-bold text-brand-gold">
                {formatPrice(order.totalAmount)}
              </span>
            </div>
          </div>

          {/* Preview item */}
          {firstItem && (
            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-50">
              <div className="w-10 h-10 rounded-lg bg-amber-50 border border-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                {firstItem.product.imageUrl ? (
                  <img src={firstItem.product.imageUrl} alt={firstItem.product.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-lg">🏺</span>
                )}
              </div>
              <p className="text-sm text-gray-700 font-medium truncate">
                {firstItem.product.name}
                {order.orderItems.length > 1 && (
                  <span className="text-gray-400 font-normal"> +{order.orderItems.length - 1} more</span>
                )}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-4">

          {/* ── Timeline ── */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-6">
              Order Progress
            </p>
            <OrderTimeline
              status={order.status}
              shipmentStatus={order.shipmentStatus}
              createdAt={order.createdAt}
              updatedAt={order.updatedAt}
            />
          </div>

          {/* ── Tracking ── */}
          {(order.status === 'SHIPPED' || order.status === 'DELIVERED') && (
            <TrackingInfoCard
              trackingId={order.trackingId}
              courierName={order.courierName}
              trackingUrl={order.trackingUrl}
              shipmentStatus={order.shipmentStatus}
            />
          )}

          {/* ── Items ── */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-4">
              Items Ordered
            </p>
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
                    <p className="text-xs text-gray-400 mt-0.5">
                      Qty: {item.quantity} × {formatPrice(item.price)}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-gray-900 shrink-0">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-4 mt-4 space-y-1.5">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal</span>
                <span className="font-medium text-gray-700">{formatPrice(order.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Delivery</span>
                <span className="font-semibold text-green-600">FREE</span>
              </div>
              <div className="flex justify-between text-base font-bold pt-1 border-t border-gray-100 mt-1">
                <span className="text-gray-900">Total</span>
                <span className="text-brand-gold">{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* ── Delivery Address ── */}
          {order.deliveryAddress && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">📍</span>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Delivery Address</p>
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed pl-7">
                {order.deliveryAddress}
              </p>
            </div>
          )}

          {/* ── Support CTA ── */}
          <div className="bg-amber-50 rounded-xl border border-amber-100 p-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-gray-800">Need help with this order?</p>
              <p className="text-xs text-gray-500 mt-0.5">Raise a ticket and we&apos;ll resolve it quickly.</p>
            </div>
            <Link
              href={`/support?orderId=${order.id}`}
              className="shrink-0 px-4 py-2 rounded-lg bg-brand-gold text-brand-charcoal text-xs font-bold hover:bg-brand-gold-dark transition-colors whitespace-nowrap"
            >
              Get Help
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
