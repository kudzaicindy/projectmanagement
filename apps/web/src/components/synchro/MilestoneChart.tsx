import { useState } from 'react';

const months = ['Feb', 'Mar', 'Apr', 'May', 'Jun'];
const periods = ['1 Month', '3 Month', '6 Month', '1 Year'] as const;

export function MilestoneChart() {
  const [period, setPeriod] = useState<(typeof periods)[number]>('3 Month');
  const data = months.map((_, i) => ({
    teal: 40 + Math.sin(i * 1.2) * 30 + 20,
    orange: 25 + Math.cos(i * 0.9) * 20 + 15,
  }));

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-title">Milestone Track</h2>
        <div className="flex bg-gray-100 rounded-lg p-0.5">
          {periods.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={`px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all ${
                period === p ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-end gap-4 h-44">
        {months.map((m, i) => (
          <div key={m} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex items-end justify-center gap-1 h-36">
              <div
                className="w-5 bg-teal-400 rounded-t-md transition-all duration-500 hover:bg-teal-500"
                style={{ height: `${data[i].teal}%` }}
              />
              <div
                className="w-5 bg-orange-400 rounded-t-md transition-all duration-500 hover:bg-orange-500"
                style={{ height: `${data[i].orange}%` }}
              />
            </div>
            <span className="text-[11px] text-gray-400 font-medium">{m}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
