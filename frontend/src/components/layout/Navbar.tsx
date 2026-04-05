'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingCart, User, LogOut, LayoutDashboard, Menu, X, ChevronDown } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import toast from 'react-hot-toast';

const COLLECTIONS = [
  { label: 'Copper Vessels', href: '/shop/products?category=copper-vessels', desc: 'Pure copper drinkware' },
  { label: 'Brass Items', href: '/shop/products?category=brass-items', desc: 'Sacred brass artifacts' },
  { label: 'Clay Pots', href: '/shop/products?category=clay-pots', desc: 'Traditional earthenware' },
  { label: 'Incense & Diyas', href: '/shop/products?category=incense-diyas', desc: 'Ritual lamps & incense' },
];

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  const { data: cart } = useQuery({
    queryKey: ['cart'],
    queryFn: () => api.get('/cart').then((r) => r.data.data),
    enabled: !!user,
  });

  const cartCount = cart?.items?.reduce((s: number, i: any) => s + i.quantity, 0) || 0;

  const handleLogout = async () => {
    await api.post('/auth/logout').catch(() => {});
    logout();
    toast.success('Signed out');
    router.push('/');
    setUserMenuOpen(false);
  };

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-nav'
            : 'bg-white/90 backdrop-blur-sm border-b border-brand-100'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link
              href="/"
              className="font-display font-bold text-xl text-brand-900 tracking-tight hover:text-brand-700 transition-colors flex-shrink-0"
            >
              Vedic Vessels
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              <Link href="/shop/products" className="nav-link px-3 py-2 rounded-lg hover:bg-brand-50">
                All Products
              </Link>

              {/* Collections dropdown */}
              <div className="relative" onMouseLeave={() => setCollectionsOpen(false)}>
                <button
                  className="nav-link px-3 py-2 rounded-lg hover:bg-brand-50 flex items-center gap-1"
                  onMouseEnter={() => setCollectionsOpen(true)}
                  onClick={() => setCollectionsOpen(v => !v)}
                >
                  Collections
                  <ChevronDown size={14} className={`transition-transform duration-200 ${collectionsOpen ? 'rotate-180' : ''}`} />
                </button>

                {collectionsOpen && (
                  <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-2xl shadow-card-hover border border-brand-100 p-2 animate-slide-down">
                    {COLLECTIONS.map(({ label, href, desc }) => (
                      <Link
                        key={label}
                        href={href}
                        className="flex flex-col px-3 py-2.5 rounded-xl hover:bg-brand-50 transition-colors group"
                        onClick={() => setCollectionsOpen(false)}
                      >
                        <span className="text-sm font-medium text-brand-800 group-hover:text-brand-600">{label}</span>
                        <span className="text-xs text-brand-400 mt-0.5">{desc}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-1">

              {/* Admin */}
              {user?.role === 'ADMIN' && (
                <Link href="/admin" className="btn-ghost btn-icon hidden md:flex" title="Admin Dashboard">
                  <LayoutDashboard size={18} />
                </Link>
              )}

              {/* Cart */}
              <Link href="/shop/cart" className="btn-ghost btn-icon relative" aria-label="Cart">
                <ShoppingCart size={20} className="text-brand-700" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-brand-600 text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-0.5 leading-none">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>

              {/* User menu (desktop) */}
              {user ? (
                <div className="relative hidden md:block">
                  <button
                    onClick={() => setUserMenuOpen(v => !v)}
                    className="btn-ghost btn-icon flex items-center gap-2"
                  >
                    <div className="w-7 h-7 rounded-full bg-brand-600 text-white text-xs font-semibold flex items-center justify-center">
                      {user.name?.[0]?.toUpperCase() ?? <User size={14} />}
                    </div>
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-2xl shadow-card-hover border border-brand-100 p-2 animate-slide-down">
                      <div className="px-3 py-2 border-b border-brand-50 mb-1">
                        <p className="text-sm font-semibold text-brand-900 truncate">{user.name}</p>
                        <p className="text-xs text-brand-400 truncate">{user.email}</p>
                      </div>
                      <Link
                        href="/shop/orders"
                        className="flex items-center gap-2 px-3 py-2 text-sm text-brand-700 hover:bg-brand-50 rounded-xl transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User size={15} /> My Orders
                      </Link>
                      {user.role === 'ADMIN' && (
                        <Link
                          href="/admin"
                          className="flex items-center gap-2 px-3 py-2 text-sm text-brand-700 hover:bg-brand-50 rounded-xl transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <LayoutDashboard size={15} /> Admin
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors mt-1"
                      >
                        <LogOut size={15} /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/auth/login" className="btn-primary btn-sm hidden md:inline-flex ml-1">
                  Sign In
                </Link>
              )}

              {/* Mobile hamburger */}
              <button
                className="btn-ghost btn-icon md:hidden"
                onClick={() => setMenuOpen(v => !v)}
                aria-label="Toggle menu"
              >
                {menuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setMenuOpen(false)}>
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
          <div
            className="absolute top-16 left-0 right-0 bg-white border-b border-brand-100 shadow-xl animate-slide-down"
            onClick={e => e.stopPropagation()}
          >
            <nav className="max-w-7xl mx-auto px-4 py-4 space-y-1">
              <Link href="/shop/products" className="flex items-center px-3 py-3 text-sm font-medium text-brand-800 hover:bg-brand-50 rounded-xl">
                All Products
              </Link>

              <div className="px-3 py-2">
                <p className="text-xs font-semibold text-brand-400 uppercase tracking-widest mb-2">Collections</p>
                {COLLECTIONS.map(({ label, href }) => (
                  <Link key={label} href={href} className="flex items-center px-2 py-2.5 text-sm text-brand-700 hover:bg-brand-50 rounded-xl">
                    {label}
                  </Link>
                ))}
              </div>

              <div className="border-t border-brand-100 pt-3 mt-2 space-y-1">
                {user ? (
                  <>
                    <div className="flex items-center gap-3 px-3 py-2">
                      <div className="w-8 h-8 rounded-full bg-brand-600 text-white text-sm font-semibold flex items-center justify-center">
                        {user.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-brand-900">{user.name}</p>
                        <p className="text-xs text-brand-400">{user.email}</p>
                      </div>
                    </div>
                    <Link href="/shop/orders" className="flex items-center gap-2 px-3 py-2.5 text-sm text-brand-700 hover:bg-brand-50 rounded-xl">
                      <User size={16} /> My Orders
                    </Link>
                    {user.role === 'ADMIN' && (
                      <Link href="/admin" className="flex items-center gap-2 px-3 py-2.5 text-sm text-brand-700 hover:bg-brand-50 rounded-xl">
                        <LayoutDashboard size={16} /> Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-xl"
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  </>
                ) : (
                  <div className="flex gap-2 px-3 pb-2">
                    <Link href="/auth/login" className="btn-primary btn-sm flex-1 justify-center">Sign In</Link>
                    <Link href="/auth/register" className="btn-secondary btn-sm flex-1 justify-center">Register</Link>
                  </div>
                )}
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* Overlay to close user menu */}
      {userMenuOpen && (
        <div className="fixed inset-0 z-30" onClick={() => setUserMenuOpen(false)} />
      )}
    </>
  );
}
