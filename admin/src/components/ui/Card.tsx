import { ReactNode } from 'react';

// ── Generic card wrapper ──────────────────────────────────────────────────────

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 ${className}`}>
      {children}
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string;
  change: string;
  up: boolean;
  iconPath: string;
  iconBg: string;
  iconColor: string;
}

export function StatCard({ label, value, change, up, iconPath, iconBg, iconColor }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      {/* Top row: icon + trend badge */}
      <div className="flex items-center justify-between mb-5">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconBg}`}>
          <svg className={`w-5 h-5 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
          </svg>
        </div>

        <span
          className={[
            'inline-flex items-center gap-0.5 text-[11px] font-semibold px-2 py-1 rounded-full',
            up ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500',
          ].join(' ')}
        >
          {up ? '↑' : '↓'} {change}
        </span>
      </div>

      {/* Value + label */}
      <p className="text-2xl font-bold text-slate-800 tracking-tight">{value}</p>
      <p className="text-xs text-slate-500 mt-1">{label}</p>
    </div>
  );
}
