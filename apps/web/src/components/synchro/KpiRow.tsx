export function KpiRow({
  stats,
}: {
  stats: { label: string; value: string | number; sub: string }[];
}) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((s) => (
        <div key={s.label} className="metric-card relative group">
          <button type="button" className="absolute top-3 right-3 p-0.5 text-gray-300 hover:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Options">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
          <p className="metric-card-label">{s.label}</p>
          <p className="metric-card-value">{s.value}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">{s.sub}</p>
        </div>
      ))}
    </div>
  );
}
