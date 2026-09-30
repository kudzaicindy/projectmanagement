export function StatCard({
  label,
  value,
  sub,
  icon,
  accent = 'navy',
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  accent?: 'navy' | 'gold' | 'emerald' | 'violet';
}) {
  const accents = {
    navy: 'from-alamait-navy to-alamait-navy-light shadow-alamait-navy/15',
    gold: 'from-alamait-gold-dark to-alamait-gold shadow-alamait-gold/20',
    emerald: 'from-emerald-600 to-emerald-500 shadow-emerald-500/20',
    violet: 'from-violet-600 to-violet-500 shadow-violet-500/20',
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-alamait-gold/5 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-500" />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="text-3xl font-bold text-alamait-navy mt-2 tracking-tight">{value}</p>
          {sub && <p className="text-xs text-slate-400 mt-1.5">{sub}</p>}
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-br ${accents[accent]} text-white shadow-lg`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
