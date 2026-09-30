import { Link } from 'react-router-dom';
import { IconCalendar, IconProjects } from '../icons';
import { ProgressBar } from '../ui/ProgressBar';
import { KpiRow } from '../synchro/KpiRow';
import { MeetingsPanel } from '../synchro/MeetingsPanel';
import { QuickActions } from '../synchro/QuickActions';
import { TodayProjectCard } from '../synchro/TodayProjectCard';
import {
  formatDate,
  formatUsd,
  projectProgress,
  projectStatusLabels,
  projectTypeLabels,
  typeColor,
} from '../../lib/format';
import type { Project } from '../../lib/types';

const columns: { status: Project['status']; label: string; color: string }[] = [
  { status: 'DRAFT', label: 'Draft', color: 'border-gray-300' },
  { status: 'ACTIVE', label: 'In Progress', color: 'border-teal-400' },
  { status: 'ON_HOLD', label: 'On Hold', color: 'border-amber-400' },
  { status: 'COMPLETED', label: 'Completed', color: 'border-emerald-400' },
];

export function PMDashboard({
  userName,
  projects,
  loading,
  dueSoon,
  overdue,
}: {
  userName: string;
  projects: Project[];
  loading: boolean;
  dueSoon: Project[];
  overdue: Project[];
}) {
  const myProjects = projects.filter((p) => p.status !== 'CANCELLED');
  const activeCount = projects.filter((p) => p.status === 'ACTIVE').length;
  const docCount = projects.reduce((s, p) => s + (p._count?.documents ?? 0), 0);

  const kpis = [
    { label: 'Active sites', value: loading ? '—' : activeCount, sub: 'In delivery' },
    { label: 'Due in 30 days', value: loading ? '—' : dueSoon.length, sub: 'Upcoming deadlines' },
    { label: 'Overdue', value: loading ? '—' : overdue.length, sub: overdue.length > 0 ? 'Needs attention' : 'On track' },
    { label: 'Documents', value: loading ? '—' : docCount, sub: 'Across projects' },
  ];

  return (
    <div className="page-shell">
      <p className="text-[12px] text-gray-400 mb-1">Operations · Alamait</p>
      <div className="flex flex-col xl:flex-row gap-5">
        <div className="flex-1 min-w-0 space-y-4 animate-fade-up">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Operations Command</h1>
              <p className="text-[13px] text-gray-500 mt-0.5">
                Welcome, {userName.split(' ')[0]} — deliver projects on time with permits and site progress
              </p>
            </div>
            <div className="flex gap-2">
              <Link to="/projects" className="btn-secondary !text-[12px]">All projects</Link>
              <Link to="/projects?new=1" className="btn-primary !text-[12px]">+ New project</Link>
            </div>
          </div>

          <QuickActions role="PM" />
          <KpiRow stats={kpis} />

          {(overdue.length > 0 || dueSoon.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {overdue.length > 0 && (
                <div className="card p-4 border-l-4 border-l-red-400 bg-red-50/30">
                  <p className="text-[13px] font-bold text-red-800">{overdue.length} project(s) overdue</p>
                  <p className="text-[11px] text-red-600/80 mt-1 line-clamp-2">{overdue.map((p) => p.name).join(', ')}</p>
                </div>
              )}
              {dueSoon.length > 0 && (
                <div className="card p-4 border-l-4 border-l-amber-400 bg-amber-50/30 flex gap-3">
                  <IconCalendar className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[13px] font-bold text-amber-900">{dueSoon.length} deadline(s) this month</p>
                    <p className="text-[11px] text-amber-700/80 mt-0.5">Review timelines and permit status.</p>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="card p-4">
            <h2 className="section-title mb-4">Project pipeline</h2>
            {loading ? (
              <div className="grid grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((i) => <div key={i} className="h-40 skeleton" />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                {columns.map((col) => {
                  const items = myProjects.filter((p) => p.status === col.status);
                  return (
                    <div key={col.status} className={`rounded-xl bg-gray-50 border border-gray-100 border-t-4 ${col.color} p-3 min-h-[180px]`}>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{col.label}</h3>
                        <span className="w-5 h-5 rounded-full bg-white text-gray-900 text-[10px] font-bold flex items-center justify-center border border-gray-100">
                          {items.length}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {items.length === 0 ? (
                          <p className="text-[11px] text-gray-400 text-center py-6">Empty</p>
                        ) : (
                          items.map((p) => (
                            <Link
                              key={p.id}
                              to={`/projects/${p.id}`}
                              className="block p-2.5 rounded-lg bg-white border border-gray-100 hover:border-teal-200 hover:shadow-sm transition-all"
                            >
                              <p className="font-semibold text-[12px] text-gray-900 line-clamp-2">{p.name}</p>
                              <p className="text-[10px] text-gray-400 mt-0.5">{p.property?.name}</p>
                              <div className="mt-2">
                                <ProgressBar value={projectProgress(p.startDate, p.endDate)} />
                              </div>
                            </Link>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="card p-4">
              <h2 className="section-title mb-3">This week&apos;s focus</h2>
              <ul className="space-y-2">
                {myProjects.slice(0, 5).map((p) => (
                  <li key={p.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
                      <IconProjects className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link to={`/projects/${p.id}`} className="font-semibold text-[13px] text-gray-900 hover:text-teal-700">
                        {p.name}
                      </Link>
                      <p className="text-[11px] text-gray-400">{formatDate(p.endDate)} · {formatUsd(p.budgetUsd)}</p>
                    </div>
                    <span className={`pill shrink-0 ${typeColor(p.type)}`}>{projectTypeLabels[p.type]}</span>
                  </li>
                ))}
                {myProjects.length === 0 && (
                  <p className="text-[12px] text-gray-400 py-4 text-center">No projects yet.</p>
                )}
              </ul>
            </div>

            <div className="card p-4">
              <h2 className="section-title mb-1">Permits & docs checklist</h2>
              <p className="text-[11px] text-gray-400 mb-3">Track compliance per active project</p>
              <div className="space-y-1.5">
                {['Plans uploaded', 'Permit application', 'Contract signed', 'BOQ approved'].map((item, i) => (
                  <label key={item} className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 border border-gray-100 cursor-pointer hover:border-gray-200">
                    <input type="checkbox" defaultChecked={i < 2} className="w-4 h-4 rounded accent-gray-900" />
                    <span className="text-[13px] text-gray-700">{item}</span>
                  </label>
                ))}
              </div>
          <Link to="/documents" className="inline-block mt-3 text-[12px] font-semibold text-teal-700 hover:underline">
            Manage documents →
          </Link>
            </div>
          </div>

          <div>
            <h2 className="section-title mb-3">Recent projects</h2>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[1, 2].map((i) => <div key={i} className="h-44 skeleton" />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {projects.slice(0, 4).map((p, i) => (
                  <TodayProjectCard key={p.id} project={p} index={i} showTracking />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="xl:w-[280px] shrink-0 space-y-4 animate-fade-up">
          <MeetingsPanel role="PM" />

          <div className="card p-4">
            <h2 className="section-title mb-3">Status breakdown</h2>
            <ul className="space-y-2">
              {(Object.keys(projectStatusLabels) as Project['status'][]).map((status) => {
                const count = projects.filter((p) => p.status === status).length;
                if (count === 0) return null;
                return (
                  <li key={status} className="flex items-center justify-between text-[12px]">
                    <span className="text-gray-500">{projectStatusLabels[status]}</span>
                    <span className="font-bold text-gray-900 tabular-nums">{count}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          <Link to="/gantt" className="card card-hover p-4 block">
            <p className="section-title">Gantt schedules</p>
            <p className="text-[11px] text-gray-400 mt-1">Open portfolio timeline view</p>
            <span className="text-[12px] font-semibold text-teal-700 mt-2 inline-block">Open Gantt →</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
