import { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'outline' | 'ghost';
type Size    = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}

const variantStyles: Record<Variant, string> = {
  primary: [
    'text-brand-charcoal font-semibold',
    'border border-brand-gold',
    'hover:scale-[1.03] hover:shadow-[0_0_22px_rgba(201,168,76,0.45)]',
  ].join(' '),
  outline: [
    'bg-transparent text-brand-gold',
    'border border-brand-gold',
    'hover:text-brand-charcoal',
    'hover:scale-[1.03] hover:shadow-[0_0_16px_rgba(201,168,76,0.3)]',
  ].join(' '),
  ghost: 'bg-transparent text-brand-charcoal border border-transparent hover:text-brand-gold',
};

const sizeStyles: Record<Size, string> = {
  sm: 'px-4 py-2 text-xs',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-sm tracking-widest uppercase',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  disabled,
  style,
  ...props
}: ButtonProps) {
  const isPrimary  = variant === 'primary';
  const isOutline  = variant === 'outline';

  const gradientStyle = isPrimary
    ? { background: 'linear-gradient(135deg, #C9A84C 0%, #E8CC7A 50%, #C9A84C 100%)', backgroundSize: '200% 100%' }
    : isOutline
    ? {}
    : {};

  return (
    <button
      disabled={disabled}
      style={{ ...gradientStyle, ...style }}
      className={[
        'inline-flex items-center justify-center gap-2',
        'font-medium tracking-wide rounded-sm',
        'transition-all duration-300',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none',
        variantStyles[variant],
        sizeStyles[size],
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </button>
  );
}
