type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'purple';

const STYLES: Record<BadgeVariant, string> = {
  success: 'bg-emerald-50 text-emerald-700',
  warning: 'bg-amber-50  text-amber-700',
  error:   'bg-red-50    text-red-600',
  info:    'bg-blue-50   text-blue-700',
  neutral: 'bg-slate-100 text-slate-600',
  purple:  'bg-violet-50 text-violet-700',
};

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

export default function Badge({ label, variant = 'neutral' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium capitalize ${STYLES[variant]}`}>
      {label}
    </span>
  );
}
