export type DonutSegment = {
  label: string;
  value: number;
  color: string;
  /** Shown under the label in the key (legend). */
  description?: string;
};

export function DonutChart({
  segments,
  size = 176,
  formatValue = (n: number) => String(n),
  centerLabel = 'projects',
  legendTitle = 'Key',
}: {
  segments: DonutSegment[];
  size?: number;
  formatValue?: (n: number) => string;
  centerLabel?: string;
  legendTitle?: string;
}) {
  const drawable = segments.filter((s) => s.value > 0);
  const total = drawable.reduce((s, x) => s + x.value, 0);
  const r = 38;
  const stroke = 11;
  const c = 2 * Math.PI * r;
  const gap = drawable.length > 1 ? 3 : 0;

  let offset = 0;

  return (
    <div className="flex flex-col sm:flex-row items-start gap-6 w-full">
      <div className="relative shrink-0 mx-auto sm:mx-0" style={{ width: size, height: size }}>
        {total > 0 ? (
          <svg width={size} height={size} viewBox="0 0 100 100" className="-rotate-90">
            <circle cx="50" cy="50" r={r} fill="none" stroke="#eef0f3" strokeWidth={stroke} />
            {drawable.map((seg) => {
              const pct = seg.value / total;
              const dash = Math.max(0, pct * c - gap);
              const el = (
                <circle
                  key={seg.label}
                  cx="50"
                  cy="50"
                  r={r}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth={stroke}
                  strokeDasharray={`${dash} ${c - dash}`}
                  strokeDashoffset={-offset}
                  strokeLinecap="round"
                  className="transition-all duration-500 ease-out"
                />
              );
              offset += dash + gap;
              return el;
            })}
          </svg>
        ) : (
          <svg width={size} height={size} viewBox="0 0 100 100" className="-rotate-90" aria-hidden>
            <circle cx="50" cy="50" r={r} fill="none" stroke="#eef0f3" strokeWidth={stroke} />
          </svg>
        )}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
          aria-hidden
        >
          <span className="text-2xl font-bold text-gray-900 tabular-nums leading-none">{total}</span>
          <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mt-1">{centerLabel}</span>
        </div>
      </div>

      <div className="flex-1 min-w-0 w-full sm:w-auto">
        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">{legendTitle}</p>
        <ul className="space-y-3">
          {segments.map((seg) => {
            const pct = total > 0 ? Math.round((seg.value / total) * 100) : 0;
            return (
              <li key={seg.label} className="border-b border-gray-100 last:border-0 pb-3 last:pb-0">
                <div className="flex items-center gap-3">
                  <span
                    className="w-3 h-3 rounded-[4px] shrink-0 ring-1 ring-black/5"
                    style={{ backgroundColor: seg.color }}
                    aria-hidden
                  />
                  <span className="text-[13px] font-semibold text-gray-800 flex-1">{seg.label}</span>
                  <span className="text-[11px] font-medium text-gray-400 tabular-nums w-8 text-right">
                    {total > 0 && seg.value > 0 ? `${pct}%` : '—'}
                  </span>
                  <span className="text-[13px] font-bold text-gray-900 tabular-nums min-w-[2.5rem] text-right">
                    {formatValue(seg.value)}
                  </span>
                </div>
                {seg.description && (
                  <p className="text-[11px] text-gray-500 leading-snug mt-1 ml-6">{seg.description}</p>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
