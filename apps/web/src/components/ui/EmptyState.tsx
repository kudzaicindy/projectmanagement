import type { ReactNode } from 'react';

export function EmptyState({
  icon,
  title,
  description,
  action,
  standalone = false,
}: {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  /** When true, wraps in a card for grid layouts */
  standalone?: boolean;
}) {
  const inner = (
    <>
      {icon && (
        <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 mb-5">
          {icon}
        </div>
      )}
      <h3 className="text-[15px] font-bold text-gray-900">{title}</h3>
      <p className="text-[13px] text-gray-500 mt-2 max-w-sm leading-relaxed">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </>
  );

  if (standalone) {
    return (
      <div className="card col-span-full flex flex-col items-center justify-center py-16 px-8 text-center">
        {inner}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      {inner}
    </div>
  );
}
