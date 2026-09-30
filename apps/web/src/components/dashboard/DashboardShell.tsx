import type { UserRole } from '../../lib/types';

const themes: Record<
  UserRole,
  { gradient: string; accent: string; label: string; tagline: string; pattern: string }
> = {
  PM: {
    gradient: 'from-[#0f2847] via-[#1a4a6e] to-[#2563eb]/80',
    accent: 'text-blue-300',
    label: 'Operations Command',
    tagline: 'Deliver projects on time — permits, timelines, and site progress',
    pattern: 'opacity-20',
  },
  QA: {
    gradient: 'from-[#1e1b4b] via-[#4c1d95] to-[#7c3aed]/70',
    accent: 'text-violet-300',
    label: 'Quantity Surveying Hub',
    tagline: 'Portfolio health, BOQs, schedules, and variation control',
    pattern: 'opacity-25',
  },
  FINANCE: {
    gradient: 'from-[#052e16] via-[#14532d] to-[#059669]/70',
    accent: 'text-emerald-300',
    label: 'Finance Control Centre',
    tagline: 'Cash flow, budgets, approvals, and payment releases',
    pattern: 'opacity-20',
  },
  CEO: {
    gradient: 'from-alamait-navy via-alamait-navy-mid to-alamait-gold-dark/60',
    accent: 'text-alamait-gold-light',
    label: 'Executive Overview',
    tagline: 'Portfolio performance, investment decisions, and strategic view',
    pattern: 'opacity-30',
  },
  ADMIN: {
    gradient: 'from-slate-900 via-alamait-navy to-alamait-navy-light',
    accent: 'text-slate-300',
    label: 'Administration',
    tagline: 'Full system access and audit visibility',
    pattern: 'opacity-20',
  },
};

export function DashboardShell({
  role,
  userName,
  children,
  actions,
  stats,
}: {
  role: UserRole;
  userName: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  stats?: React.ReactNode;
}) {
  const t = themes[role];
  const first = userName.split(' ')[0];
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="pb-10">
      <div className={`relative mx-6 mt-5 rounded-[28px] overflow-hidden shadow-2xl shadow-alamait-navy/20 animate-fade-up`}>
        <div className={`absolute inset-0 bg-gradient-to-br ${t.gradient}`} />
        <div className={`absolute inset-0 pattern-dots ${t.pattern}`} />
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />

        <div className="relative px-8 py-9 md:py-11">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <p className={`text-xs font-bold tracking-[0.2em] uppercase ${t.accent}`}>
                {t.label}
              </p>
              <h1 className="font-display text-4xl md:text-5xl text-white mt-2 italic leading-tight">
                {greet}, {first}
              </h1>
              <p className="text-white/55 mt-3 max-w-lg text-sm leading-relaxed">{t.tagline}</p>
            </div>
            {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
          </div>
          {stats && <div className="mt-8">{stats}</div>}
        </div>
      </div>
      <div className="px-6 mt-6">{children}</div>
    </div>
  );
}
