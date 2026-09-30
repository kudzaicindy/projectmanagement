export function Card({
  title,
  children,
  action,
  className = '',
  noPadding = false,
  variant = 'default',
}: {
  title?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  noPadding?: boolean;
  variant?: 'default' | 'elevated' | 'flat';
}) {
  const variants = {
    default: 'card',
    elevated: 'card shadow-[0_2px_12px_rgba(15,23,42,0.06)]',
    flat: 'bg-slate-50 rounded-xl border border-slate-200/60',
  };

  return (
    <div className={`${variants[variant]} overflow-hidden ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          {title && <h2 className="text-[14px] font-bold text-gray-900">{title}</h2>}
          {action}
        </div>
      )}
      <div className={noPadding ? '' : 'p-5'}>{children}</div>
    </div>
  );
}
