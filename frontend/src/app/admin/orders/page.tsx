'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search, X, ChevronLeft, ChevronRight,
  ShoppingBag, Clock, ChevronDown,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../lib/api';

/* ─── Constants ─────────────────────────────────────────── */
const STATUSES = ['ALL', 'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];

const STATUS_STYLES: Record<string, string> = {
  PENDING:    'bg-amber-50 text-amber-700 border-amber-200',
  CONFIRMED:  'bg-blue-50 text-blue-700 border-blue-200',
  PROCESSING: 'bg-purple-50 text-purple-700 border-purple-200',
  SHIPPED:    'bg-indigo-50 text-indigo-700 border-indigo-200',
  DELIVERED:  'bg-green-50 text-green-700 border-green-200',
  CANCELLED:  'bg-red-50 text-red-600 border-red-200',
  REFUNDED:   'bg-gray-50 text-gray-600 border-gray-200',
};

const NEXT_STATUS: Record<string, string[]> = {
  PENDING:    ['CONFIRMED', 'CANCELLED'],
  CONFIRMED:  ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED:    ['DELIVERED'],
  DELIVERED:  ['REFUNDED'],
  CANCELLED:  [],
  REFUNDED:   [],
};

/* ─── Order detail drawer ────────────────────────────────── */
function OrderDrawer({ order, onClose, onStatusChange }: { order: any; onClose: () => void; onStatusChange: (id: string, status: string) => void }) {
  const nextStatuses = NEXT_STATUS[order.status] ?? [];

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <p className="font-mono text-xs text-gray-400">{order.orderNumber}</p>
            <h3 className="font-display font-bold text-gray-900 text-lg">{order.user?.name}</h3>
          </div>
          <button onClick={onClose} className="btn-ghost btn-icon text-gray-400"><X size={18} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Status */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Status</p>
            <div className="flex flex-wrap gap-2 items-center">
              <span className={`px-3 py-1.5 rounded-xl text-sm font-semibold border ${STATUS_STYLES[order.status]}`}>
                {order.status}
              </span>
              {nextStatuses.map(s => (
                <button
                  key={s}
                  onClick={() => onStatusChange(order.id, s)}
                  className="px-3 py-1.5 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:border-brand-300 hover:text-brand-700 hover:bg-brand-50 transition-colors"
                >
                  → {s}
                </button>
              ))}
            </div>
          </div>

          {/* Customer */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Customer</p>
            <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-1">
              <p className="font-semibold text-gray-900">{order.user?.name}</p>
              <p className="text-gray-500">{order.user?.email}</p>
            </div>
          </div>

          {/* Delivery address */}
          {order.address && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Delivery Address</p>
              <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600 space-y-0.5">
                <p className="font-semibold text-gray-900">{order.address.name}</p>
                <p>{order.address.line1}{order.address.line2 ? `, ${order.address.line2}` : ''}</p>
                <p>{order.address.city}, {order.address.state} – {order.address.postalCode}</p>
                <p className="text-gray-400">{order.address.phone}</p>
              </div>
            </div>
          )}

          {/* Items */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Order Items</p>
            <div className="space-y-2">
              {order.items?.map((item: any) => (
                <div key={item.id} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                  <div className="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center text-lg flex-shrink-0">🏺</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                    <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 flex-shrink-0">
                    ₹{(Number(item.price) * item.quantity).toLocaleString('en-IN')}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Price breakdown */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Price Breakdown</p>
            <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
              {[
                ['Subtotal', `₹${Number(order.subtotal).toLocaleString('en-IN')}`],
                ['Shipping', Number(order.shippingCost) === 0 ? 'Free' : `₹${Number(order.shippingCost).toLocaleString('en-IN')}`],
                ['Tax (GST)', `₹${Number(order.tax).toLocaleString('en-IN')}`],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between text-gray-600">
                  <span>{k}</span><span>{v}</span>
                </div>
              ))}
              <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-gray-900">
                <span>Total</span>
                <span>₹{Number(order.total).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Page ──────────────────────────────────────────────── */
export default function AdminOrders() {
  const queryClient = useQueryClient();
  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page,         setPage]         = useState(1);
  const [selected,     setSelected]     = useState<any>(null);
  const LIMIT = 15;

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', statusFilter, page],
    queryFn: () => api.get('/admin/orders', {
      params: { page, limit: LIMIT, status: statusFilter === 'ALL' ? undefined : statusFilter },
    }).then(r => r.data),
    refetchInterval: 30_000,
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/admin/orders/${id}/status`, { status }),
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      if (selected) setSelected((o: any) => ({ ...o, status }));
      toast.success(`Order marked as ${status}`);
    },
    onError: () => toast.error('Failed to update status'),
  });

  const orders: any[] = data?.data ?? [];
  const total      = data?.meta?.total ?? 0;
  const totalPages = Math.ceil(total / LIMIT);

  // Client-side search filter
  const visible = search.trim()
    ? orders.filter(o =>
        o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
        o.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
        o.user?.email?.toLowerCase().includes(search.toLowerCase())
      )
    : orders;

  return (
    <div className="p-6 md:p-8">

      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl text-gray-900">Orders</h1>
        <p className="text-sm text-gray-400 mt-0.5">{total} total orders</p>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 overflow-x-auto scrollbar-hide mb-5 pb-1">
        {STATUSES.map(s => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`flex-shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              statusFilter === s
                ? 'bg-brand-600 text-white'
                : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            {s === 'ALL' ? 'All Orders' : s.charAt(0) + s.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
        {/* Search bar */}
        <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
          <Search size={15} className="text-gray-400 flex-shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by order #, customer name or email…"
            className="flex-1 text-sm outline-none text-gray-700 placeholder:text-gray-300 bg-transparent"
          />
          {search && <button onClick={() => setSearch('')} className="text-gray-300 hover:text-gray-500"><X size={14} /></button>}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Order #', 'Customer', 'Date', 'Items', 'Amount', 'Status', ''].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="skeleton h-4 rounded-lg" style={{ width: `${50 + j * 8}%` }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : visible.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-gray-400">
                    <ShoppingBag size={32} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No orders found</p>
                  </td>
                </tr>
              ) : (
                visible.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setSelected(order)}>
                    <td className="px-5 py-3.5 font-mono text-xs text-gray-600 whitespace-nowrap">
                      {order.orderNumber}
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-gray-900">{order.user?.name}</p>
                      <p className="text-xs text-gray-400">{order.user?.email}</p>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 text-xs whitespace-nowrap">
                      <span className="flex items-center gap-1">
                        <Clock size={11} />
                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">{order.items?.length} item{order.items?.length !== 1 ? 's' : ''}</td>
                    <td className="px-5 py-3.5 font-semibold text-gray-900 whitespace-nowrap">
                      ₹{Number(order.total).toLocaleString('en-IN')}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${STATUS_STYLES[order.status] ?? 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <ChevronDown size={14} className="text-gray-300 -rotate-90" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-400">
              Page {page} of {totalPages} · {total} orders
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary btn-icon disabled:opacity-40">
                <ChevronLeft size={15} />
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-secondary btn-icon disabled:opacity-40">
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Order detail drawer */}
      {selected && (
        <OrderDrawer
          order={selected}
          onClose={() => setSelected(null)}
          onStatusChange={(id, status) => updateStatus.mutate({ id, status })}
        />
      )}
    </div>
  );
}
