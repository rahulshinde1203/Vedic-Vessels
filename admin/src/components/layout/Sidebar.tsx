'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

function NavIcon({ path }: { path: string }) {
  return (
    <svg className="w-[18px] h-[18px] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}

const NAV = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  },
  {
    label: 'Products',
    href: '/products',
    icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
  },
  {
    label: 'Categories',
    href: '/categories',
    icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z',
  },
  {
    label: 'Orders',
    href: '/orders',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
  },
  {
    label: 'Users',
    href: '/users',
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  },
  {
    label: 'Support',
    href: '/support',
    icon: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z',
  },
];

const BOTTOM_NAV = [
  {
    label: 'Settings',
    href: '/settings',
    icon: 'M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
  },
];

function NavItem({ href, icon, label }: { href: string; icon: string; label: string }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={[
        'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium',
        'border-l-2 transition-all duration-150',
        active
          ? 'border-brand-gold bg-brand-gold/10 text-brand-gold pl-[10px]'
          : 'border-transparent text-slate-400 hover:bg-slate-800 hover:text-white pl-[10px]',
      ].join(' ')}
    >
      <NavIcon path={icon} />
      {label}
    </Link>
  );
}

export default function Sidebar() {
  return (
    <aside className="w-60 shrink-0 bg-slate-900 h-full flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-white/[0.06] shrink-0">
        <span className="text-brand-gold text-lg mr-2.5">☽</span>
        <div>
          <p className="text-white text-sm font-semibold leading-none">Vedic Vessels</p>
          <p className="text-slate-500 text-[10px] mt-0.5 tracking-widest uppercase">Admin</p>
        </div>
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] text-slate-600 uppercase tracking-widest font-medium px-3 mb-3">
          Main Menu
        </p>
        {NAV.map((item) => (
          <NavItem key={item.href} {...item} />
        ))}
      </nav>

      {/* Bottom nav + user */}
      <div className="px-3 pb-4 space-y-0.5 border-t border-white/[0.06] pt-4 shrink-0">
        {BOTTOM_NAV.map((item) => (
          <NavItem key={item.href} {...item} />
        ))}

        {/* Admin user card */}
        <div className="flex items-center gap-3 px-3 py-3 mt-3 rounded-md bg-white/[0.04]">
          <div className="w-7 h-7 rounded-full bg-brand-gold/20 flex items-center justify-center shrink-0">
            <span className="text-brand-gold text-xs font-bold">A</span>
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-medium truncate">Admin User</p>
            <p className="text-slate-500 text-[10px] truncate">admin@vedicvessels.in</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
