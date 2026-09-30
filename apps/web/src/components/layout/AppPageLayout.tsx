import type { ReactNode } from 'react';
import { QuickActions } from '../synchro/QuickActions';
import type { UserRole } from '../../lib/types';

export function AppPageLayout({
  eyebrow,
  title,
  subtitle,
  actions,
  quickActionsRole,
  sidebar,
  children,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  quickActionsRole?: UserRole;
  sidebar?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="page-shell">
      {eyebrow && <p className="text-[12px] text-gray-400 mb-1">{eyebrow}</p>}
      <div className={sidebar ? 'flex flex-col xl:flex-row gap-5' : ''}>
        <div className={`${sidebar ? 'flex-1 min-w-0' : ''} space-y-4 animate-fade-up`}>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{title}</h1>
              {subtitle && <p className="text-[13px] text-gray-500 mt-0.5 max-w-2xl">{subtitle}</p>}
            </div>
            {actions && <div className="flex flex-wrap gap-2 shrink-0">{actions}</div>}
          </div>
          {quickActionsRole && <QuickActions role={quickActionsRole} />}
          {children}
        </div>
        {sidebar && (
          <div className="xl:w-[280px] shrink-0 space-y-4 animate-fade-up">{sidebar}</div>
        )}
      </div>
    </div>
  );
}
