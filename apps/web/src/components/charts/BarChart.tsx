export function BarChart({
  data,
  formatValue,
  trackHeight = 112,
  layout = 'vertical',
}: {
  data: { label: string; value: number; color?: string }[];
  formatValue?: (n: number) => string;
  trackHeight?: number;
  layout?: 'vertical' | 'horizontal';
}) {
  if (data.length === 0) return null;

  const max = Math.max(...data.map((d) => d.value), 1);
  const fmt = formatValue ?? ((n: number) => String(n));

  if (layout === 'horizontal') {
    return (
      <div className="space-y-3 w-full" role="img" aria-label="Bar chart">
        {data.map((d, i) => {
          const pct = Math.max(0, Math.min(100, (d.value / max) * 100));
          const color = d.color ?? '#0d9488';
          return (
            <div key={`${d.label}-${i}`} className="group">
              <div className="flex items-baseline justify-between gap-2 mb-1.5">
                <span className="text-[12px] font-medium text-gray-700 truncate" title={d.label}>
                  {d.label}
                </span>
                <span className="text-[12px] font-bold text-gray-900 tabular-nums shrink-0">{fmt(d.value)}</span>
              </div>
              <div className="h-2.5 rounded-full bg-[#eef0f3] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out group-hover:opacity-90"
                  style={{
                    width: `${pct}%`,
                    background: `linear-gradient(90deg, ${color}dd, ${color})`,
                    boxShadow: `0 1px 3px ${color}40`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div
      className="relative w-full pt-2"
      style={{ minHeight: trackHeight + 52 }}
      role="img"
      aria-label="Bar chart"
    >
      <div
        className="absolute inset-x-0 bottom-[28px] flex flex-col justify-between pointer-events-none"
        style={{ height: trackHeight }}
      >
        {[0.25, 0.5, 0.75, 1].map((t) => (
          <div key={t} className="border-t border-dashed border-gray-100 w-full" />
        ))}
      </div>

      <div className="flex items-end justify-center gap-3 sm:gap-4 relative z-[1]" style={{ height: trackHeight + 52 }}>
        {data.map((d, i) => {
          const barPx = d.value > 0 ? Math.max(8, Math.round((d.value / max) * trackHeight)) : 0;
          const color = d.color ?? '#0f1b2d';
          return (
            <div key={`${d.label}-${i}`} className="flex flex-col items-center flex-1 min-w-[40px] max-w-[72px]">
              <span className="text-[11px] font-semibold text-gray-500 tabular-nums mb-2">{fmt(d.value)}</span>
              <div
                className="w-full max-w-[44px] rounded-t-[10px] transition-all duration-500 ease-out hover:opacity-90"
                style={{
                  height: barPx,
                  background: `linear-gradient(180deg, ${color}88 0%, ${color} 100%)`,
                  boxShadow: `0 4px 12px -2px ${color}35`,
                }}
                title={`${d.label}: ${fmt(d.value)}`}
              />
              <span className="text-[11px] text-gray-500 font-medium truncate w-full text-center mt-2.5 px-0.5">
                {d.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
