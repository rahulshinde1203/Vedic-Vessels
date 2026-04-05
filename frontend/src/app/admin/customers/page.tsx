'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, X, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import api from '../../../lib/api';

export default function AdminCustomers() {
  const [search, setSearch] = useState('');
  const [page,   setPage]   = useState(1);
  const LIMIT = 20;

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page],
    queryFn: () => api.get('/admin/users', { params: { page, limit: LIMIT } }).then(r => r.data),
  });

  const users: any[]  = data?.data ?? [];
  const total      = data?.meta?.total ?? 0;
  const totalPages = Math.ceil(total / LIMIT);

  const visible = search.trim()
    ? users.filter(u =>
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
      )
    : users;

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl text-gray-900">Customers</h1>
        <p className="text-sm text-gray-400 mt-0.5">{total} registered customers</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
          <Search size={15} className="text-gray-400 flex-shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="flex-1 text-sm outline-none text-gray-700 placeholder:text-gray-300 bg-transparent"
          />
          {search && <button onClick={() => setSearch('')} className="text-gray-300 hover:text-gray-500"><X size={14} /></button>}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Customer', 'Email', 'Role', 'Orders', 'Joined'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="px-5 py-4"><div className="skeleton h-4 rounded-lg w-3/4" /></td>
                    ))}
                  </tr>
                ))
              ) : visible.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-16 text-gray-400">
                    <Users size={32} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No customers found</p>
                  </td>
                </tr>
              ) : (
                visible.map((u: any) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                          {u.name?.[0]?.toUpperCase()}
                        </div>
                        <p className="font-medium text-gray-900">{u.name}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500">{u.email}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                        u.role === 'ADMIN'
                          ? 'bg-brand-50 text-brand-700 border-brand-200'
                          : 'bg-gray-50 text-gray-600 border-gray-200'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600 font-medium">{u._count?.orders ?? 0}</td>
                    <td className="px-5 py-3.5 text-gray-400 text-xs">
                      {new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-400">Page {page} of {totalPages}</p>
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
    </div>
  );
}
