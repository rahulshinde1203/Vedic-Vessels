'use client';

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';

export interface RevenueDataPoint {
  day:     string;
  revenue: number;
}

interface TooltipPayload {
  value: number;
}

function CustomTooltip({
  active, payload, label,
}: {
  active?:  boolean;
  payload?: TooltipPayload[];
  label?:   string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 rounded-lg px-3.5 py-2.5 shadow-xl">
      <p className="text-slate-400 text-[11px] mb-1">{label}</p>
      <p className="text-white text-sm font-semibold">
        ₹{payload[0].value.toLocaleString('en-IN')}
      </p>
    </div>
  );
}

interface RevenueChartProps {
  data:     RevenueDataPoint[];
  loading?: boolean;
  total?:   number;
}

export default function RevenueChart({ data, loading, total }: RevenueChartProps) {
  const weekTotal = data.reduce((s, d) => s + d.revenue, 0);

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-1">
            Revenue Overview
          </p>
          <p className="text-2xl font-bold text-slate-900">
            {loading ? '—' : `₹${weekTotal.toLocaleString('en-IN')}`}
          </p>
          <p className="text-xs text-slate-400 mt-1">Last 7 days</p>
        </div>
        <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-amber-50 text-amber-600">
          7-day trend
        </span>
      </div>

      {loading ? (
        <div className="h-52 bg-slate-50 rounded-lg animate-pulse" />
      ) : (
        <ResponsiveContainer width="100%" height={208}>
          <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#C9A84C" stopOpacity={0.14} />
                <stop offset="100%" stopColor="#C9A84C" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
              dy={6}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
              dx={-4}
              tickFormatter={(v: number) =>
                v === 0 ? '₹0' : v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`
              }
              width={44}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e2e8f0', strokeWidth: 1 }} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#C9A84C"
              strokeWidth={2}
              fill="url(#revenueGrad)"
              dot={false}
              activeDot={{ r: 4, fill: '#C9A84C', stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
