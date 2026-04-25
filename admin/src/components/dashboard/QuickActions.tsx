import Link from 'next/link';

const ACTIONS = [
  {
    href:  '/products',
    label: 'Add Product',
    desc:  'List a new item',
    icon:  'M12 4v16m8-8H4',
    bg:    'bg-amber-50',
    color: 'text-amber-600',
  },
  {
    href:  '/orders',
    label: 'View Orders',
    desc:  'Manage all orders',
    icon:  'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
    bg:    'bg-blue-50',
    color: 'text-blue-600',
  },
  {
    href:  '/categories',
    label: 'Add Category',
    desc:  'Create a new category',
    icon:  'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z',
    bg:    'bg-emerald-50',
    color: 'text-emerald-600',
  },
];

interface Props {
  pendingOrders: number;
  lowStock:      number;
}

export default function QuickActions({ pendingOrders, lowStock }: Props) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 flex flex-col">
      <div className="mb-5">
        <p className="text-sm font-semibold text-slate-800">Quick Actions</p>
        <p className="text-xs text-slate-400 mt-0.5">Shortcuts to common tasks</p>
      </div>

      <div className="space-y-2 flex-1">
        {ACTIONS.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="flex items-center gap-3.5 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${action.bg} group-hover:scale-105 transition-transform duration-150`}>
              <svg className={`w-4 h-4 ${action.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d={action.icon} />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-700 group-hover:text-brand-gold transition-colors truncate">
                {action.label}
              </p>
              <p className="text-xs text-slate-400 truncate">{action.desc}</p>
            </div>
            <svg className="w-4 h-4 text-slate-300 shrink-0 group-hover:text-brand-gold transition-colors ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ))}
      </div>

      {/* Alerts */}
      <div className="mt-5 pt-5 border-t border-slate-50 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-amber-50 p-3 text-center">
          <p className="text-xl font-bold text-amber-600">{pendingOrders}</p>
          <p className="text-[11px] text-amber-500 mt-0.5 font-medium">Pending</p>
        </div>
        <div className="rounded-xl bg-red-50 p-3 text-center">
          <p className="text-xl font-bold text-red-500">{lowStock}</p>
          <p className="text-[11px] text-red-400 mt-0.5 font-medium">Low Stock</p>
        </div>
      </div>
    </div>
  );
}
