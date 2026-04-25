'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Badge from '@/components/ui/Badge';
import {
  fetchAdminOrders,
  fetchAdminOrderById,
  updateAdminOrderStatus,
  type AdminOrderRow,
  type AdminOrderDetail,
  type OrderStatus,
} from '@/services/orders.service';

const STATUS_BADGE: Record<OrderStatus, 'success' | 'warning' | 'purple'> = {
  DELIVERED: 'success',
  SHIPPED:   'purple',
  PENDING:   'warning',
};

const NEXT_STATUS: Record<OrderStatus, OrderStatus | null> = {
  PENDING:   'SHIPPED',
  SHIPPED:   'DELIVERED',
  DELIVERED: null,
};

const NEXT_LABEL: Record<OrderStatus, string | null> = {
  PENDING:   'Mark Shipped',
  SHIPPED:   'Mark Delivered',
  DELIVERED: null,
};

// ── Order Detail Panel ─────────────────────────────────────────────────────────

function OrderDetail({
  orderId,
  onClose,
  onStatusUpdate,
}: {
  orderId: number;
  onClose: () => void;
  onStatusUpdate: (id: number, status: OrderStatus) => void;
}) {
  const [order,    setOrder]    = useState<AdminOrderDetail | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchAdminOrderById(orderId).then(setOrder).finally(() => setLoading(false));
  }, [orderId]);

  const handleStatusUpdate = async (status: OrderStatus) => {
    if (!order) return;
    setUpdating(true);
    try {
      await updateAdminOrderStatus(order.id, status);
      setOrder((prev) => prev ? { ...prev, status } : prev);
      onStatusUpdate(order.id, status);
      toast.success(`Order marked as ${status.toLowerCase()}`);
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-800">
            {loading ? 'Loading…' : `Order #${order?.id}`}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-lg leading-none">×</button>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-8 bg-slate-100 rounded animate-pulse" />
            ))}
          </div>
        ) : order ? (
          <div className="p-6 space-y-5">
            {/* Status + action */}
            <div className="flex items-center justify-between">
              <Badge label={order.status} variant={STATUS_BADGE[order.status]} />
              {NEXT_STATUS[order.status] && (
                <button
                  onClick={() => handleStatusUpdate(NEXT_STATUS[order.status]!)}
                  disabled={updating}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-brand-gold/10 text-brand-gold hover:bg-brand-gold/20 transition-colors disabled:opacity-50"
                >
                  {updating ? 'Updating…' : NEXT_LABEL[order.status]}
                </button>
              )}
            </div>

            {/* Customer + address */}
            <div className="space-y-1 text-sm">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Customer</p>
              <p className="text-slate-800 font-medium">{order.user.name ?? order.user.phone}</p>
              {order.user.name && <p className="text-slate-500 text-xs">{order.user.phone}</p>}
            </div>

            {order.deliveryAddress && (
              <div className="space-y-1 text-sm">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Delivery Address</p>
                <p className="text-slate-700 whitespace-pre-line leading-relaxed">{order.deliveryAddress}</p>
              </div>
            )}

            {/* Items */}
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Items</p>
              <div className="space-y-2">
                {order.orderItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      {item.product.imageUrl ? (
                        <img src={item.product.imageUrl} alt={item.product.name} className="w-8 h-8 rounded object-cover bg-amber-50" />
                      ) : (
                        <div className="w-8 h-8 rounded bg-amber-50 flex items-center justify-center text-sm">🏺</div>
                      )}
                      <span className="text-slate-700">{item.product.name}</span>
                      <span className="text-slate-400">× {item.quantity}</span>
                    </div>
                    <span className="font-semibold text-slate-800">
                      ₹{(Number(item.price) * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="border-t border-slate-100 pt-3 flex justify-between font-bold text-sm">
              <span className="text-slate-700">Total</span>
              <span className="text-brand-gold">₹{Number(order.totalAmount).toLocaleString('en-IN')}</span>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center text-slate-400 text-sm">Order not found</div>
        )}
      </div>
    </div>
  );
}

// ── Orders Page ────────────────────────────────────────────────────────────────

export default function OrdersPage() {
  const [orders,      setOrders]      = useState<AdminOrderRow[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [detailId,    setDetailId]    = useState<number | null>(null);
  const [updatingId,  setUpdatingId]  = useState<number | null>(null);

  useEffect(() => {
    fetchAdminOrders().then(setOrders).finally(() => setLoading(false));
  }, []);

  const handleQuickStatus = async (order: AdminOrderRow) => {
    const next = NEXT_STATUS[order.status];
    if (!next) return;
    setUpdatingId(order.id);
    try {
      await updateAdminOrderStatus(order.id, next);
      setOrders((prev) => prev.map((o) => o.id === order.id ? { ...o, status: next } : o));
      toast.success(`Order #${order.id} marked as ${next.toLowerCase()}`);
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDetailStatusUpdate = (id: number, status: OrderStatus) => {
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status } : o));
  };

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-slate-800">Orders</h1>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-10 bg-slate-100 rounded animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {['Order', 'Customer', 'Amount', 'Items', 'Status', 'Date', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-[11px] font-medium text-slate-500 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs text-brand-gold font-semibold">
                      #{order.id}
                    </td>
                    <td className="px-5 py-3.5 text-slate-700">
                      {order.user.name ?? order.user.phone}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-slate-800">
                      ₹{order.totalAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">{order.itemCount}</td>
                    <td className="px-5 py-3.5">
                      <Badge label={order.status} variant={STATUS_BADGE[order.status]} />
                    </td>
                    <td className="px-5 py-3.5 text-slate-400 text-xs whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setDetailId(order.id)}
                          className="text-xs font-medium text-brand-gold hover:text-brand-gold-dark transition-colors"
                        >
                          View
                        </button>
                        {NEXT_STATUS[order.status] && (
                          <button
                            onClick={() => handleQuickStatus(order)}
                            disabled={updatingId === order.id}
                            className="text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors disabled:opacity-50"
                          >
                            {updatingId === order.id ? '…' : NEXT_LABEL[order.status]}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-slate-400 text-sm">
                      No orders yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {detailId !== null && (
        <OrderDetail
          orderId={detailId}
          onClose={() => setDetailId(null)}
          onStatusUpdate={handleDetailStatusUpdate}
        />
      )}
    </div>
  );
}
