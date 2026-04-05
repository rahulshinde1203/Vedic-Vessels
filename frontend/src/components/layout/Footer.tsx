'use client';

import Link from 'next/link';
import { Instagram, Twitter, Facebook, Mail, Phone, MapPin } from 'lucide-react';

const SHOP_LINKS = [
  { label: 'All Products', href: '/shop/products' },
  { label: 'Copper Vessels', href: '/shop/products?category=copper-vessels' },
  { label: 'Brass Items', href: '/shop/products?category=brass-items' },
  { label: 'Clay Pots', href: '/shop/products?category=clay-pots' },
  { label: 'Incense & Diyas', href: '/shop/products?category=incense-diyas' },
];

const SUPPORT_LINKS = [
  { label: 'My Orders', href: '/shop/orders' },
  { label: 'My Cart', href: '/shop/cart' },
  { label: 'Login', href: '/auth/login' },
  { label: 'Create Account', href: '/auth/register' },
];

const SOCIAL = [
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Facebook, href: '#', label: 'Facebook' },
];

export default function Footer() {
  return (
    <footer className="bg-brand-950 text-brand-300">

      {/* Trust bar */}
      <div className="border-b border-brand-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: '🏺', title: 'Handcrafted', sub: 'By skilled artisans' },
            { icon: '✓', title: 'Authentic', sub: 'Directly sourced' },
            { icon: '🚚', title: 'Free Shipping', sub: 'On orders over ₹999' },
            { icon: '↩', title: '7-Day Returns', sub: 'Hassle-free policy' },
          ].map(({ icon, title, sub }) => (
            <div key={title} className="flex items-center gap-3">
              <span className="text-2xl">{icon}</span>
              <div>
                <p className="text-white text-sm font-semibold">{title}</p>
                <p className="text-brand-500 text-xs">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

        {/* Brand */}
        <div className="lg:col-span-1">
          <Link href="/" className="font-display font-bold text-2xl text-white tracking-tight">
            Vedic Vessels
          </Link>
          <p className="mt-3 text-brand-400 text-sm leading-relaxed max-w-xs">
            Reviving India's ancient craft tradition — one handcrafted vessel at a time.
          </p>
          <div className="mt-5 space-y-2 text-sm text-brand-400">
            <div className="flex items-center gap-2">
              <Mail size={14} className="text-brand-600 flex-shrink-0" />
              <span>hello@vedicvessels.in</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={14} className="text-brand-600 flex-shrink-0" />
              <span>+91 98765 43210</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-brand-600 flex-shrink-0" />
              <span>Jaipur, Rajasthan, India</span>
            </div>
          </div>
          <div className="mt-5 flex gap-3">
            {SOCIAL.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="w-9 h-9 rounded-xl bg-brand-800 hover:bg-brand-700 flex items-center justify-center text-brand-400 hover:text-white transition-colors"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>

        {/* Shop */}
        <div>
          <p className="text-white font-semibold text-sm mb-4 uppercase tracking-widest">Shop</p>
          <ul className="space-y-2.5">
            {SHOP_LINKS.map(({ label, href }) => (
              <li key={label}>
                <Link href={href} className="text-sm text-brand-400 hover:text-white transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Account */}
        <div>
          <p className="text-white font-semibold text-sm mb-4 uppercase tracking-widest">Account</p>
          <ul className="space-y-2.5">
            {SUPPORT_LINKS.map(({ label, href }) => (
              <li key={label}>
                <Link href={href} className="text-sm text-brand-400 hover:text-white transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <p className="text-white font-semibold text-sm mb-4 uppercase tracking-widest">Newsletter</p>
          <p className="text-brand-400 text-sm mb-4 leading-relaxed">
            Get new arrivals and stories from our artisans delivered to your inbox.
          </p>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex flex-col gap-2"
          >
            <input
              type="email"
              placeholder="your@email.com"
              className="bg-brand-800 border border-brand-700 text-white placeholder:text-brand-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 transition-colors"
            />
            <button
              type="submit"
              className="btn-primary text-sm py-2.5 rounded-xl justify-center"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-brand-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-brand-600">
          <p>© {new Date().getFullYear()} Vedic Vessels. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-brand-400 transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-brand-400 transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-brand-400 transition-colors">Refund Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
