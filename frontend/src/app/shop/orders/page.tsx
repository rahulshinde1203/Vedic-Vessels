'use client';

import { useQuery } from '@tanstack/react-query';
import api from '../../../lib/api';
import Link from 'next/link';

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  PROCESSING: 'bg-purple-100 text-purple-700',
  SHIPPED: 'bg-indigo-100 text-indigo-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
  REFUNDED: 'bg-gray-100 text-gray-700',
};

export default function OrdersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => api.get('/orders').then((r) => r.data.data),
  });

  if (isLoading) return <div className="text-center py-20">Loading orders...</div>;

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-serif font-semibold mb-8">My Orders</h1>
      {!data?.length ? (
        <div className="text-center py-20">
          <p className="text-brand-400 mb-4">No orders yet.</p>
          <Link href="/shop/products" className="btn-primary">Start Shopping</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((order: any) => (
            <div key={order.id} className="card">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-mono text-sm text-brand-500">{order.orderNumber}</p>
                  <p className="text-xs text-brand-400">{new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                  {order.status}
                </span>
              </div>
              <p className="text-sm text-brand-600">{order.items?.length} items · <strong>₹{Number(order.total).toFixed(2)}</strong></p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
