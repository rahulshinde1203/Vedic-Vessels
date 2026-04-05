'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Package, ShoppingBag,
  Users, ChevronRight, LogOut, Settings,
} from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import api from '../../lib/api';
import toast from 'react-hot-toast';

const NAV = [
  { label: 'Dashboard',  href: '/admin',          icon: LayoutDashboard },
  { label: 'Products',   href: '/admin/products',  icon: Package },
  { label: 'Orders',     href: '/admin/orders',    icon: ShoppingBag },
  { label: 'Customers',  href: '/admin/customers', icon: Users },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore();
  const router   = usePathname();
  const navigate = useRouter();

  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      navigate.replace('/');
    }
  }, [user, navigate]);

  const handleLogout = async () => {
    await api.post('/auth/logout').catch(() => {});
    logout();
    toast.success('Signed out');
    navigate.push('/');
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-gray-50">

      {/* ── Sidebar ── */}
      <aside className="w-56 flex-shrink-0 bg-white border-r border-gray-100 flex flex-col">

        {/* Brand */}
        <div className="px-5 py-5 border-b border-gray-100">
          <p className="text-2xs font-bold uppercase tracking-widest text-brand-400 mb-0.5">Admin Panel</p>
          <p className="font-display font-bold text-brand-900 text-base leading-tight">Vedic Vessels</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5">
          {NAV.map(({ label, href, icon: Icon }) => {
            const active = href === '/admin' ? router === '/admin' : router.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  active
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon size={16} className={active ? 'text-brand-600' : 'text-gray-400 group-hover:text-gray-600'} />
                {label}
                {active && <ChevronRight size={13} className="ml-auto text-brand-400" />}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-gray-100 space-y-0.5">
          <Link href="/shop/products" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors">
            <Settings size={16} className="text-gray-400" /> View Store
          </Link>
          <div className="flex items-center gap-3 px-3 py-2.5">
            <div className="w-6 h-6 rounded-full bg-brand-600 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-800 truncate">{user?.name}</p>
              <p className="text-[10px] text-gray-400 truncate">{user?.email}</p>
            </div>
            <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 transition-colors" title="Sign out">
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Content ── */}
      <main className="flex-1 min-w-0 overflow-auto">
        {children}
      </main>
    </div>
  );
}
