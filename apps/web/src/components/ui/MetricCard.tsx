import type { ReactNode } from 'react';

export function MetricCard({
  label,
  value,
  sub,
  icon,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="metric-card">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="metric-card-label">{label}</p>
          <p className="metric-card-value">{value}</p>
          {sub && <p className="text-[12px] text-slate-400 mt-1">{sub}</p>}
        </div>
        {icon && (
          <div className="w-10 h-10 rounded-lg bg-alamait-navy/5 flex items-center justify-center text-alamait-navy shrink-0">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
