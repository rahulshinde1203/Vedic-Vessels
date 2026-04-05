'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  TrendingUp, ShoppingBag, Package, Users,
  ArrowUpRight, Clock, ChevronRight,
} from 'lucide-react';
import api from '../../lib/api';

/* ─── Helpers ───────────────────────────────────────────── */
const STATUS_STYLES: Record<string, string> = {
  PENDING:    'bg-amber-50 text-amber-700 border-amber-200',
  CONFIRMED:  'bg-blue-50 text-blue-700 border-blue-200',
  PROCESSING: 'bg-purple-50 text-purple-700 border-purple-200',
  SHIPPED:    'bg-indigo-50 text-indigo-700 border-indigo-200',
  DELIVERED:  'bg-green-50 text-green-700 border-green-200',
  CANCELLED:  'bg-red-50 text-red-600 border-red-200',
  REFUNDED:   'bg-gray-50 text-gray-600 border-gray-200',
};

function StatCard({
  label, value, sub, icon: Icon, color, href,
}: {
  label: string; value: string | number; sub?: string;
  icon: any; color: string; href?: string;
}) {
  const inner = (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 flex gap-4 items-start hover:shadow-card-hover transition-shadow">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-2xs font-semibold uppercase tracking-widest text-gray-400 mb-1">{label}</p>
        <p className="font-display font-bold text-2xl text-gray-900 leading-none">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
      {href && <ArrowUpRight size={15} className="text-gray-300 flex-shrink-0 mt-1" />}
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

function SkeletonCard() {
  return <div className="bg-white rounded-2xl border border-gray-100 p-5 h-24 skeleton" />;
}

/* ─── Page ──────────────────────────────────────────────── */
export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => api.get('/admin/stats').then(r => r.data.data),
    refetchInterval: 60_000,
  });

  const revenue = Number(data?.totalRevenue || 0);

  const STATS = [
    {
      label: 'Total Revenue', icon: TrendingUp,
      value: `₹${revenue >= 100000 ? `${(revenue / 100000).toFixed(1)}L` : revenue.toLocaleString('en-IN')}`,
      sub: 'Excl. cancelled orders', color: 'bg-green-50 text-green-600',
    },
    {
      label: 'Total Orders', icon: ShoppingBag,
      value: data?.totalOrders ?? '—', sub: 'All time', href: '/admin/orders',
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Active Products', icon: Package,
      value: data?.totalProducts ?? '—', sub: 'Published & in stock', href: '/admin/products',
      color: 'bg-brand-50 text-brand-600',
    },
    {
      label: 'Customers', icon: Users,
      value: data?.totalUsers ?? '—', sub: 'Registered users', href: '/admin/customers',
      color: 'bg-purple-50 text-purple-600',
    },
  ];

  return (
    <div className="p-6 md:p-8 max-w-6xl">

      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display font-bold text-2xl text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : STATS.map(s => <StatCard key={s.label} {...s} />)
        }
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-semibold text-gray-900">Recent Orders</h2>
            <p className="text-xs text-gray-400 mt-0.5">Last 5 orders placed</p>
          </div>
          <Link href="/admin/orders" className="btn-secondary btn-sm gap-1.5">
            View all <ChevronRight size={13} />
          </Link>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-10 rounded-xl" />)}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['Order', 'Customer', 'Date', 'Items', 'Amount', 'Status'].map(h => (
                    <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data?.recentOrders?.map((order: any) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-gray-600 whitespace-nowrap">
                      {order.orderNumber}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{order.user?.name}</p>
                      <p className="text-xs text-gray-400">{order.user?.email}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap text-xs">
                      <span className="flex items-center gap-1">
                        <Clock size={11} />
                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{order.items?.length}</td>
                    <td className="px-6 py-4 font-semibold text-gray-900 whitespace-nowrap">
                      ₹{Number(order.total).toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold border ${STATUS_STYLES[order.status] ?? 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!data?.recentOrders?.length && (
              <p className="text-center py-12 text-gray-400 text-sm">No orders yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
