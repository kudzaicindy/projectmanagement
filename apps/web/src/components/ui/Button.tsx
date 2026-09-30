type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
};

const variants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  accent: 'btn-accent',
  ghost: 'btn-ghost',
  danger: 'inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-50 text-red-700 text-sm font-semibold border border-red-100 hover:bg-red-100 transition-colors',
};

const sizes = {
  sm: '!px-3 !py-1.5 !text-xs !rounded-md',
  md: '',
  lg: '!px-6 !py-3 !text-base',
};

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      type={props.type ?? 'button'}
      className={`${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
