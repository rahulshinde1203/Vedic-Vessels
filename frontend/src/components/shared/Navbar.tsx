'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { NAV_LINKS } from '@/constants';
import { useCartStore } from '@/store/cart.store';
import { useAuthStore } from '@/store/auth.store';
import type { AuthUser } from '@/store/auth.store';

export default function Navbar() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  // Hydration-safe cart count
  const [cartCount, setCartCount] = useState(0);
  useEffect(() => {
    setCartCount(
      useCartStore.getState().items.reduce((s, i) => s + i.quantity, 0)
    );
    return useCartStore.subscribe((state) => {
      setCartCount(state.items.reduce((s, i) => s + i.quantity, 0));
    });
  }, []);

  // Hydration-safe auth state
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  useEffect(() => {
    setAuthUser(useAuthStore.getState().user);
    return useAuthStore.subscribe((state) => setAuthUser(state.user));
  }, []);

  const handleLogout = () => {
    useAuthStore.getState().logout();
    toast.success('Logged out');
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50">

      {/* ── Primary bar ─────────────────────────────────────────────── */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 md:gap-6 h-16">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <span className="text-brand-gold text-xl leading-none">☽</span>
              <span className="font-serif text-base md:text-lg tracking-wide text-brand-charcoal">
                Vedic <span className="text-brand-gold">Vessels</span>
              </span>
            </Link>

            {/* Search bar — centered, max-w-150 */}
            <div className="flex-1 hidden sm:flex justify-center">
              <div className="relative w-full max-w-150">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for copper bottles, kalash, diyas..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gray-300 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 transition-all duration-200"
                />
              </div>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-3 shrink-0 ml-auto sm:ml-0">

              {/* Cart — links to /cart */}
              <Link
                href="/cart"
                aria-label="Cart"
                className="relative flex items-center gap-1.5 text-gray-700 hover:text-brand-gold transition-colors duration-200"
              >
                <span className="relative">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  {cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </span>
                <span className="hidden md:block text-sm font-medium">Cart</span>
              </Link>

              {/* Auth */}
              {authUser ? (
                <div className="flex items-center gap-2">
                  <Link
                    href="/profile"
                    className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 hover:text-brand-gold transition-colors duration-200"
                    aria-label="My Profile"
                  >
                    <div className="w-7 h-7 rounded-full bg-brand-gold/15 border border-brand-gold/30 flex items-center justify-center shrink-0">
                      <span className="text-brand-gold text-xs font-bold leading-none">
                        {authUser.phone.charAt(authUser.phone.length - 1)}
                      </span>
                    </div>
                    <span className="hidden md:block text-sm font-medium text-gray-700 max-w-25 truncate">
                      My Account
                    </span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-xs font-semibold text-gray-500 border border-gray-300 hover:border-red-400 hover:text-red-500 px-3 py-1.5 rounded-full transition-all duration-200"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 text-sm font-semibold text-brand-charcoal border border-brand-gold/50 hover:border-brand-gold hover:text-brand-gold px-4 py-2 rounded-full transition-all duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Login
                </Link>
              )}

            </div>
          </div>

          {/* Mobile search */}
          <div className="sm:hidden pb-3">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for copper bottles, kalash, diyas..."
                className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gray-300 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 transition-all duration-200"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Secondary nav strip ──────────────────────────────────────── */}
      <div className="bg-brand-charcoal hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8 h-9 overflow-x-auto">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs font-medium text-white/75 hover:text-brand-gold whitespace-nowrap transition-colors shrink-0"
              >
                {link.label}
              </Link>
            ))}
            <span className="text-white/20 shrink-0">|</span>
            <Link
              href="/shop"
              className="text-xs font-medium text-brand-gold-light whitespace-nowrap shrink-0"
            >
              🎁 Festival Sale – Up to 40% Off
            </Link>
          </div>
        </div>
      </div>

    </header>
  );
}
