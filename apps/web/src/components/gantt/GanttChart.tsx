import type { ReactNode } from 'react';
import type { Project, Task } from '../../lib/types';
import { formatDate } from '../../lib/format';

const DAY_MS = 86400000;

function parse(d: string) {
  return new Date(d).getTime();
}

function daysBetween(a: number, b: number) {
  return Math.max(1, Math.round((b - a) / DAY_MS));
}

function monthLabels(min: number, max: number) {
  const labels: { label: string; left: number }[] = [];
  const start = new Date(min);
  start.setDate(1);
  while (start.getTime() <= max) {
    const left = ((start.getTime() - min) / (max - min)) * 100;
    labels.push({
      label: start.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      left,
    });
    start.setMonth(start.getMonth() + 1);
  }
  return labels;
}

const barColors = [
  'bg-teal-500',
  'bg-violet-500',
  'bg-orange-500',
  'bg-blue-500',
  'bg-pink-500',
  'bg-emerald-500',
];

function barColorForTask(task: Task, index: number) {
  if (task.status === 'COMPLETED') return 'bg-emerald-500';
  if (task.status === 'BLOCKED') return 'bg-red-400';
  if (task.isMilestone) return 'bg-amber-500';
  return barColors[index % barColors.length];
}

export function GanttChart({
  tasks,
  project,
  selectedId,
  onSelect,
  emptyAction,
}: {
  tasks: Task[];
  project?: Project | null;
  selectedId?: string | null;
  onSelect?: (task: Task) => void;
  emptyAction?: ReactNode;
}) {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400 px-4">
        <svg className="w-12 h-12 mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
        <p className="text-sm font-medium text-gray-600">No Gantt chart yet</p>
        <p className="text-xs mt-1 text-center max-w-sm">
          Generate a schedule from portfolio phases (or a default timeline), or add tasks manually.
        </p>
        {emptyAction && <div className="mt-5">{emptyAction}</div>}
      </div>
    );
  }

  const allDates = tasks.flatMap((t) => [parse(t.startDate), parse(t.endDate)]);
  if (project?.startDate) allDates.push(parse(project.startDate));
  if (project?.endDate) allDates.push(parse(project.endDate));

  const min = Math.min(...allDates) - DAY_MS * 3;
  const max = Math.max(...allDates) + DAY_MS * 7;
  const totalDays = daysBetween(min, max);
  const months = monthLabels(min, max);

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[720px]">
        {/* Month header */}
        <div className="flex border-b border-gray-100">
          <div className="w-52 shrink-0 px-4 py-2 text-[10px] font-bold text-gray-400 uppercase">Task</div>
          <div className="flex-1 relative h-8">
            {months.map((m) => (
              <span
                key={m.label + m.left}
                className="absolute text-[10px] font-semibold text-gray-400 top-2"
                style={{ left: `${m.left}%` }}
              >
                {m.label}
              </span>
            ))}
          </div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-gray-50">
          {tasks.map((task, i) => {
            const start = parse(task.startDate);
            const end = parse(task.endDate);
            const left = ((start - min) / DAY_MS / totalDays) * 100;
            const width = Math.max(2, (daysBetween(start, end) / totalDays) * 100);
            const color = barColorForTask(task, i);
            const selected = selectedId === task.id;
            const faded = task.status === 'NOT_STARTED' ? 'opacity-50' : '';

            return (
              <div
                key={task.id}
                className={`flex items-center min-h-[52px] hover:bg-gray-50/80 transition-colors ${selected ? 'bg-alamait-gold/10 ring-1 ring-inset ring-alamait-gold/30' : ''}`}
              >
                <button
                  type="button"
                  onClick={() => onSelect?.(task)}
                  className="w-52 shrink-0 px-4 py-3 text-left"
                >
                  <div className="flex items-center gap-2">
                    {task.isMilestone && (
                      <span className="w-2 h-2 rotate-45 bg-amber-400 shrink-0" title="Milestone" />
                    )}
                    <span className="text-[12px] font-semibold text-gray-800 truncate">{task.name}</span>
                  </div>
                  {task.predecessor && (
                    <p className="text-[10px] text-gray-400 mt-0.5 truncate">After: {task.predecessor.name}</p>
                  )}
                </button>

                <div className="flex-1 relative h-10 px-2">
                  {/* Grid lines */}
                  {months.map((m) => (
                    <div
                      key={`grid-${m.left}`}
                      className="absolute top-0 bottom-0 w-px bg-gray-100"
                      style={{ left: `${m.left}%` }}
                    />
                  ))}

                  {/* Bar */}
                  <button
                    type="button"
                    onClick={() => onSelect?.(task)}
                    className={`absolute top-2 h-6 rounded-md ${color} ${faded} shadow-sm hover:brightness-110 transition-all flex items-center overflow-hidden group`}
                    style={{ left: `${left}%`, width: `${width}%`, minWidth: '24px' }}
                    title={`${formatDate(task.startDate)} → ${formatDate(task.endDate)} · ${task.progress}%`}
                  >
                    {/* Progress fill */}
                    <div
                      className="absolute inset-y-0 left-0 bg-black/20 rounded-md"
                      style={{ width: `${task.progress}%` }}
                    />
                    <span className="relative z-10 text-[9px] font-bold text-white px-2 truncate opacity-0 group-hover:opacity-100">
                      {task.progress}%
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 px-4 py-3 border-t border-gray-100 text-[10px] text-gray-500">
          <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded bg-teal-500" /> In progress</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded bg-emerald-500" /> Completed</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rotate-45 bg-amber-400" /> Milestone</span>
          <span className="flex items-center gap-1.5"><span className="w-8 h-px bg-gray-300" /> Dependency (predecessor)</span>
        </div>
      </div>
    </div>
  );
}
