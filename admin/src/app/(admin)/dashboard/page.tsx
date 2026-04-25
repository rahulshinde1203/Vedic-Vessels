'use client';

import { useEffect, useState } from 'react';
import StatCard         from '@/components/ui/StatCard';
import RevenueChart     from '@/components/charts/RevenueChart';
import OrdersTable      from '@/components/dashboard/OrdersTable';
import QuickActions     from '@/components/dashboard/QuickActions';
import type { RevenueDataPoint } from '@/components/charts/RevenueChart';
import { fetchStats,        type DashboardStats } from '@/services/dashboard.service';
import { fetchAdminOrders,  type AdminOrderRow   } from '@/services/orders.service';

// ── Derive last-7-days revenue from order list ────────────────────────────────

function getLast7DaysRevenue(orders: AdminOrderRow[]): RevenueDataPoint[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateKey = d.toLocaleDateString('en-CA'); // YYYY-MM-DD local
    const label   = d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' });
    const revenue = orders
      .filter((o) => new Date(o.createdAt).toLocaleDateString('en-CA') === dateKey)
      .reduce((sum, o) => sum + o.totalAmount, 0);
    return { day: label, revenue };
  });
}

// ── Stat card definitions ─────────────────────────────────────────────────────

function buildStatCards(s: DashboardStats | null, loading: boolean) {
  const dash = (v: string) => (loading ? '—' : v);
  return [
    {
      title:     'Total Revenue',
      value:     dash(s ? `₹${s.totalRevenue.toLocaleString('en-IN')}` : '₹0'),
      sub:       s ? `across ${s.totalOrders} orders` : undefined,
      iconPath:  'M9 8h6m-5 0a3 3 0 110 6H9l3 3m-3-6h6m6 1a9 9 0 11-18 0 9 9 0 0118 0z',
      iconBg:    'bg-amber-50',
      iconColor: 'text-amber-600',
    },
    {
      title:     'Total Orders',
      value:     dash(s ? s.totalOrders.toLocaleString('en-IN') : '0'),
      sub:       s ? `${s.pendingOrders} pending` : undefined,
      iconPath:  'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
      iconBg:    'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      title:     'Total Users',
      value:     dash(s ? s.totalUsers.toLocaleString('en-IN') : '0'),
      sub:       'registered customers',
      iconPath:  'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
      iconBg:    'bg-violet-50',
      iconColor: 'text-violet-600',
    },
    {
      title:     'Total Products',
      value:     dash(s ? s.totalProducts.toLocaleString('en-IN') : '0'),
      sub:       s ? `${s.lowStockProducts} low stock` : undefined,
      iconPath:  'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
      iconBg:    'bg-emerald-50',
      iconColor: 'text-emerald-600',
    },
  ];
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [stats,   setStats]   = useState<DashboardStats | null>(null);
  const [orders,  setOrders]  = useState<AdminOrderRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchStats(), fetchAdminOrders()])
      .then(([s, o]) => { setStats(s); setOrders(o); })
      .finally(() => setLoading(false));
  }, []);

  const chartData    = getLast7DaysRevenue(orders);
  const statCards    = buildStatCards(stats, loading);

  return (
    <div className="space-y-6 max-w-350">

      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">Dashboard</h1>
        <p className="text-sm text-slate-400 mt-0.5">
          {new Date().toLocaleDateString('en-IN', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
          })}
        </p>
      </div>

      {/* ── Row 1 — Stat cards ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 h-32 animate-pulse" />
            ))
          : statCards.map((c) => <StatCard key={c.title} {...c} />)
        }
      </div>

      {/* ── Row 2 — Revenue chart (full width) ──────────────────────────── */}
      <RevenueChart data={chartData} loading={loading} />

      {/* ── Row 3 — Recent orders + Quick actions ───────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <OrdersTable orders={orders} loading={loading} />
        </div>
        <QuickActions
          pendingOrders={stats?.pendingOrders    ?? 0}
          lowStock={stats?.lowStockProducts ?? 0}
        />
      </div>

    </div>
  );
}
