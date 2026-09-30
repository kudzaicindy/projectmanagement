import { useState } from 'react';
import type { Project } from '../../lib/types';
import { projectProgress } from '../../lib/format';

const hours = ['09:00', '10:00', '11:00', '12:00', '01:00', '02:00', '03:00', '04:00'];
const views = ['Daily', 'Weekly', 'Monthly', 'Yearly'] as const;

const barColors = ['bg-teal-400', 'bg-orange-400', 'bg-violet-400', 'bg-pink-400'];

export function ActivityTimeline({ projects }: { projects: Project[] }) {
  const [view, setView] = useState<(typeof views)[number]>('Daily');
  const rows = projects.slice(0, 4);

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-title">Time-based Activity Map</h2>
        <div className="flex bg-gray-100 rounded-lg p-0.5">
          {views.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={`px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all ${
                view === v ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[640px]">
          {/* Hour labels */}
          <div className="flex pl-36 mb-2">
            {hours.map((h) => (
              <div key={h} className="flex-1 text-[10px] text-gray-400 font-medium text-center">{h}</div>
            ))}
          </div>

          {/* Rows */}
          <div className="space-y-4 relative">
            {/* Current time line */}
            <div className="absolute top-0 bottom-0 left-[calc(36*4px+36*2px)] w-px bg-gray-900 z-10" style={{ left: '52%' }} />

            {rows.length === 0 ? (
              <p className="text-sm text-gray-400 py-8 text-center">No projects to display on timeline.</p>
            ) : (
              rows.map((p, i) => {
                const progress = projectProgress(p.startDate, p.endDate);
                const left = 10 + i * 8;
                const width = 25 + progress * 0.35;
                return (
                  <div key={p.id} className="flex items-center gap-4">
                    <div className="w-32 shrink-0 text-[12px] font-semibold text-gray-600 truncate">
                      {p.property?.name ?? p.name}
                    </div>
                    <div className="flex-1 relative h-10 bg-gray-50 rounded-lg">
                      <div
                        className={`absolute top-1.5 bottom-1.5 ${barColors[i % barColors.length]} rounded-lg flex items-center px-3 gap-2 shadow-sm`}
                        style={{ left: `${left}%`, width: `${width}%`, minWidth: '120px' }}
                      >
                        <div className="flex -space-x-1.5">
                          {[0, 1, 2].map((a) => (
                            <div key={a} className="w-5 h-5 rounded-full bg-white/90 border border-white text-[8px] font-bold flex items-center justify-center text-gray-600">
                              {String.fromCharCode(65 + a)}
                            </div>
                          ))}
                        </div>
                        <span className="text-[10px] font-semibold text-white truncate flex-1">{p.name}</span>
                        <span className="text-[10px] font-bold bg-white/25 text-white px-1.5 py-0.5 rounded-md shrink-0">
                          {progress}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
