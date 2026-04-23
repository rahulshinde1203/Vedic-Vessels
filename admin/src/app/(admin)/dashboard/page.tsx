import { StatCard } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import type { AdminOrder, OrderStatus, StatCardData } from '@/types';

// ── Placeholder data ──────────────────────────────────────────────────────────

const STATS: StatCardData[] = [
  {
    label: 'Total Orders',
    value: '1,284',
    change: '12.5%',
    up: true,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    iconPath: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
  },
  {
    label: 'Revenue',
    value: '₹4,82,500',
    change: '8.2%',
    up: true,
    iconBg: 'bg-brand-gold/10',
    iconColor: 'text-brand-gold',
    iconPath: 'M9 8h6m-5 0a3 3 0 110 6H9l3 3m-3-6h6m6 1a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  {
    label: 'Total Products',
    value: '84',
    change: '3 new',
    up: true,
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    iconPath: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
  },
  {
    label: 'Active Users',
    value: '2,450',
    change: '18.1%',
    up: true,
    iconBg: 'bg-violet-50',
    iconColor: 'text-violet-600',
    iconPath: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  },
];

const RECENT_ORDERS: AdminOrder[] = [
  { id: 'VV-1001', customer: 'Priya Sharma',   amount: 2499, status: 'delivered',  date: '23 Apr 2026', items: 3 },
  { id: 'VV-1002', customer: 'Rahul Verma',    amount: 1299, status: 'shipped',    date: '23 Apr 2026', items: 1 },
  { id: 'VV-1003', customer: 'Anita Patel',    amount: 3750, status: 'processing', date: '22 Apr 2026', items: 5 },
  { id: 'VV-1004', customer: 'Suresh Nair',    amount: 599,  status: 'pending',    date: '22 Apr 2026', items: 1 },
  { id: 'VV-1005', customer: 'Meera Iyer',     amount: 4998, status: 'cancelled',  date: '21 Apr 2026', items: 4 },
  { id: 'VV-1006', customer: 'Deepak Sharma',  amount: 849,  status: 'delivered',  date: '21 Apr 2026', items: 2 },
];

const STATUS_BADGE: Record<OrderStatus, 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'purple'> = {
  delivered:  'success',
  shipped:    'purple',
  processing: 'info',
  pending:    'warning',
  cancelled:  'error',
};

// ── Quick actions ─────────────────────────────────────────────────────────────

const QUICK_ACTIONS = [
  {
    label: 'Add Product',
    desc: 'List a new product',
    icon: 'M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z',
    href: '/products/new',
  },
  {
    label: 'Manage Orders',
    desc: 'View pending orders',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
    href: '/orders',
  },
  {
    label: 'View Users',
    desc: 'Browse customer list',
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
    href: '/users',
  },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">Thursday, 23 April 2026</p>
        </div>
        <Button variant="secondary" size="sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Export Report
        </Button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {STATS.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Quick actions + table row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick actions */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">Quick Actions</h2>
          <div className="space-y-2">
            {QUICK_ACTIONS.map((action) => (
              <a
                key={action.label}
                href={action.href}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors group"
              >
                <div className="w-9 h-9 rounded-lg bg-brand-gold/10 flex items-center justify-center shrink-0 group-hover:bg-brand-gold/20 transition-colors">
                  <svg className="w-4.5 h-4.5 text-brand-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={action.icon} />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700 group-hover:text-brand-gold transition-colors">
                    {action.label}
                  </p>
                  <p className="text-xs text-slate-400">{action.desc}</p>
                </div>
              </a>
            ))}
          </div>

          {/* Summary strip */}
          <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 gap-3">
            <div className="text-center p-3 rounded-lg bg-slate-50">
              <p className="text-lg font-bold text-amber-600">12</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Pending Orders</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-slate-50">
              <p className="text-lg font-bold text-red-500">5</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Low Stock Items</p>
            </div>
          </div>
        </div>

        {/* Recent orders table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-800">Recent Orders</h2>
            <button className="text-xs font-medium text-brand-gold hover:underline">
              View all
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-5 py-3 text-[11px] font-medium text-slate-500 uppercase tracking-wide">
                    Order
                  </th>
                  <th className="text-left px-5 py-3 text-[11px] font-medium text-slate-500 uppercase tracking-wide">
                    Customer
                  </th>
                  <th className="text-left px-5 py-3 text-[11px] font-medium text-slate-500 uppercase tracking-wide">
                    Amount
                  </th>
                  <th className="text-left px-5 py-3 text-[11px] font-medium text-slate-500 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="text-left px-5 py-3 text-[11px] font-medium text-slate-500 uppercase tracking-wide">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {RECENT_ORDERS.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs text-brand-gold font-semibold">
                      {order.id}
                    </td>
                    <td className="px-5 py-3.5 text-slate-700 text-sm">{order.customer}</td>
                    <td className="px-5 py-3.5 text-slate-800 font-semibold text-sm">
                      ₹{order.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge label={order.status} variant={STATUS_BADGE[order.status]} />
                    </td>
                    <td className="px-5 py-3.5 text-slate-400 text-xs">{order.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
