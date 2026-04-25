interface StatCardProps {
  title:     string;
  value:     string;
  sub?:      string;
  iconPath:  string;
  iconBg:    string;
  iconColor: string;
}

export default function StatCard({ title, value, sub, iconPath, iconBg, iconColor }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-all duration-200 group cursor-default">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0 pr-4">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-3">{title}</p>
          <p className="text-3xl font-bold text-slate-900 tracking-tight truncate">{value}</p>
          {sub && <p className="mt-2 text-xs text-slate-400">{sub}</p>}
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${iconBg} group-hover:scale-110 transition-transform duration-200`}>
          <svg className={`w-5 h-5 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
          </svg>
        </div>
      </div>
    </div>
  );
}
