'use client';

import { useEffect, useState } from 'react';
import Badge from '@/components/ui/Badge';
import { fetchAdminUsers, type AdminUserRow } from '@/services/users.service';

export default function UsersPage() {
  const [users,   setUsers]   = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminUsers().then(setUsers).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-slate-800">Users</h1>

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
                  {['ID', 'Phone', 'Name', 'Role', 'Orders', 'Joined'].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-[11px] font-medium text-slate-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5 text-slate-400 text-xs font-mono">{u.id}</td>
                    <td className="px-5 py-3.5 font-medium text-slate-800">{u.phone}</td>
                    <td className="px-5 py-3.5 text-slate-600">{u.name ?? '—'}</td>
                    <td className="px-5 py-3.5">
                      <Badge
                        label={u.role}
                        variant={u.role === 'ADMIN' ? 'purple' : 'neutral'}
                      />
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">{u.orderCount}</td>
                    <td className="px-5 py-3.5 text-slate-400 text-xs">
                      {new Date(u.createdAt).toLocaleDateString('en-IN')}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-slate-400 text-sm">
                      No users yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
