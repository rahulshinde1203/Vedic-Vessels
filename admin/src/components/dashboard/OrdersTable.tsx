import Link from 'next/link';
import Badge from '@/components/ui/Badge';
import type { AdminOrderRow, OrderStatus } from '@/services/orders.service';

const STATUS_BADGE: Record<OrderStatus, 'success' | 'warning' | 'purple'> = {
  DELIVERED: 'success',
  SHIPPED:   'purple',
  PENDING:   'warning',
};

interface Props {
  orders:   AdminOrderRow[];
  loading?: boolean;
}

export default function OrdersTable({ orders, loading }: Props) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50">
        <div>
          <p className="text-sm font-semibold text-slate-800">Recent Orders</p>
          <p className="text-xs text-slate-400 mt-0.5">Latest transactions</p>
        </div>
        <Link
          href="/orders"
          className="text-xs font-semibold text-brand-gold hover:text-brand-gold-dark transition-colors"
        >
          View all →
        </Link>
      </div>

      {loading ? (
        <div className="p-6 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-10 rounded-lg bg-slate-50 animate-pulse" />
          ))}
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50/70">
              {['Order ID', 'Customer', 'Amount', 'Status', 'Date'].map((h) => (
                <th
                  key={h}
                  className="text-left px-6 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.slice(0, 7).map((order) => (
              <tr key={order.id} className="border-t border-slate-50 hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 font-mono text-xs font-semibold text-brand-gold">
                  #{String(order.id).padStart(4, '0')}
                </td>
                <td className="px-6 py-4 text-slate-700 font-medium">
                  {order.user.name ?? order.user.phone}
                </td>
                <td className="px-6 py-4 font-semibold text-slate-900">
                  ₹{order.totalAmount.toLocaleString('en-IN')}
                </td>
                <td className="px-6 py-4">
                  <Badge label={order.status} variant={STATUS_BADGE[order.status]} />
                </td>
                <td className="px-6 py-4 text-xs text-slate-400">
                  {new Date(order.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short',
                  })}
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-sm">
                  No orders yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
