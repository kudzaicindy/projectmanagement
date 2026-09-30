import { Link } from 'react-router-dom';
import { BarChart } from '../charts/BarChart';
import { DonutChart } from '../charts/DonutChart';
import { KpiRow } from '../synchro/KpiRow';
import { MeetingsPanel } from '../synchro/MeetingsPanel';
import { QuickActions } from '../synchro/QuickActions';
import {
  formatUsd,
  projectStatusLabels,
  projectTypeLabels,
  statusColor,
  typeColor,
} from '../../lib/format';
import type { AuditLog, Project, Property } from '../../lib/types';

const decisions = [
  { type: 'buy' as const, title: 'Land acquisition — Eastside parcel', amount: 420000, status: 'Review feasibility' },
  { type: 'sell' as const, title: 'Disposal — Block C retail unit', amount: 310000, status: 'Hold vs sell analysis' },
];

export function CEODashboard({
  userName,
  projects,
  properties,
  audit,
  loading,
  totalBudget,
  active,
  onHold,
  overdue,
}: {
  userName: string;
  projects: Project[];
  properties: Property[];
  audit: AuditLog[];
  loading: boolean;
  totalBudget: number;
  active: Project[];
  onHold: Project[];
  overdue: Project[];
}) {
  const kpis = [
    { label: 'Properties', value: loading ? '—' : properties.length, sub: 'Portfolio sites' },
    { label: 'Active projects', value: loading ? '—' : active.length, sub: 'In delivery' },
    { label: 'Total budget', value: loading ? '—' : formatUsd(totalBudget), sub: 'USD portfolio' },
    { label: 'At risk', value: loading ? '—' : overdue.length + onHold.length, sub: `${overdue.length} overdue · ${onHold.length} on hold` },
  ];

  return (
    <div className="page-shell">
      <p className="text-[12px] text-gray-400 mb-1">Executive · Alamait</p>
      <div className="flex flex-col xl:flex-row gap-5">
        <div className="flex-1 min-w-0 space-y-4 animate-fade-up">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Executive Overview</h1>
              <p className="text-[13px] text-gray-500 mt-0.5">
                Welcome, {userName.split(' ')[0]} — portfolio performance and strategic decisions
              </p>
            </div>
            <Link to="/properties" className="btn-primary !text-[12px]">
              Portfolio view →
            </Link>
          </div>

          <QuickActions role="CEO" />
          <KpiRow stats={kpis} />

          {(overdue.length > 0 || onHold.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {overdue.length > 0 && (
                <div className="card p-4 border-l-4 border-l-red-400 bg-red-50/30">
                  <p className="text-[13px] font-bold text-red-800">{overdue.length} project(s) overdue</p>
                  <p className="text-[11px] text-red-600/80 mt-1 line-clamp-2">{overdue.map((p) => p.name).join(', ')}</p>
                </div>
              )}
              {onHold.length > 0 && (
                <div className="card p-4 border-l-4 border-l-amber-400 bg-amber-50/30">
                  <p className="text-[13px] font-bold text-amber-900">{onHold.length} on hold</p>
                  <p className="text-[11px] text-amber-700/80 mt-1">Review blockers and release decisions.</p>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="card p-4">
              <h2 className="section-title mb-1">Investment decisions</h2>
              <p className="text-[11px] text-gray-400 mb-3">Land purchases, developments, and disposals</p>
              <div className="space-y-3">
                {decisions.map((d) => (
                  <div key={d.title} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:border-gray-200 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className={`pill ${d.type === 'buy' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                          {d.type === 'buy' ? 'Acquire' : 'Dispose'}
                        </span>
                        <h3 className="text-[13px] font-bold text-gray-900 mt-2">{d.title}</h3>
                        <p className="text-[11px] text-gray-400 mt-0.5">{d.status}</p>
                      </div>
                      <p className="text-[15px] font-bold text-gray-900 tabular-nums shrink-0">{formatUsd(d.amount)}</p>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Link to="/approvals" className="btn-primary flex-1 !py-1.5 !text-[11px] text-center">Review in approvals</Link>
                      <Link to="/budgets" className="btn-secondary flex-1 !py-1.5 !text-[11px] text-center">View budgets</Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-4">
              <h2 className="section-title mb-3">Portfolio health</h2>
              {loading ? (
                <div className="h-40 skeleton" />
              ) : (
                <>
                  <DonutChart
                    segments={[
                      { label: 'Active', value: projects.filter((p) => p.status === 'ACTIVE').length, color: '#10b981' },
                      { label: 'On hold', value: onHold.length, color: '#f59e0b' },
                      { label: 'Completed', value: projects.filter((p) => p.status === 'COMPLETED').length, color: '#3b82f6' },
                      { label: 'Draft', value: projects.filter((p) => p.status === 'DRAFT').length, color: '#94a3b8' },
                    ]}
                  />
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <BarChart
                      data={[
                        { label: 'Renovation', value: projects.filter((p) => p.type === 'RENOVATION').reduce((s, p) => s + (parseFloat(p.budgetUsd ?? '0') || 0), 0), color: '#f97316' },
                        { label: 'Development', value: projects.filter((p) => p.type === 'DEVELOPMENT').reduce((s, p) => s + (parseFloat(p.budgetUsd ?? '0') || 0), 0), color: '#111827' },
                        { label: 'Managed', value: projects.filter((p) => p.type === 'MANAGED').reduce((s, p) => s + (parseFloat(p.budgetUsd ?? '0') || 0), 0), color: '#64748b' },
                      ]}
                      formatValue={(n) => formatUsd(n)}
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <h2 className="section-title">All projects</h2>
              <span className="text-[11px] text-gray-400">{projects.length} total</span>
            </div>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Project</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Budget</th>
                    <th>Property</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((p) => (
                    <tr key={p.id}>
                      <td className="font-semibold text-gray-900">{p.name}</td>
                      <td><span className={`pill ${typeColor(p.type)}`}>{projectTypeLabels[p.type]}</span></td>
                      <td><span className={`pill ${statusColor(p.status)}`}>{projectStatusLabels[p.status]}</span></td>
                      <td className="font-mono font-semibold tabular-nums">{formatUsd(p.budgetUsd)}</td>
                      <td className="text-gray-500">{p.property?.name ?? '—'}</td>
                      <td>
                        <Link to={`/projects/${p.id}`} className="text-[11px] font-semibold text-teal-700 hover:underline">Open</Link>
                      </td>
                    </tr>
                  ))}
                  {projects.length === 0 && (
                    <tr><td colSpan={6} className="py-8 text-center text-gray-400">No projects yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="xl:w-[280px] shrink-0 space-y-4 animate-fade-up">
          <MeetingsPanel role="CEO" />

          <div className="card p-4">
            <h2 className="section-title mb-3">Team activity</h2>
            {audit.length === 0 ? (
              <p className="text-[12px] text-gray-400 py-4">No recent activity.</p>
            ) : (
              <ul className="space-y-3 max-h-64 overflow-y-auto">
                {audit.slice(0, 8).map((log) => (
                  <li key={log.id} className="flex gap-2.5 text-[12px]">
                    <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600 shrink-0">
                      {log.user?.name?.charAt(0) ?? '?'}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{log.user?.name}</p>
                      <p className="text-[11px] text-gray-400">{log.action} · {log.entityType}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="card p-4">
            <h2 className="section-title mb-2">Properties</h2>
            <p className="text-2xl font-bold text-gray-900 tabular-nums">{loading ? '—' : properties.length}</p>
            <p className="text-[11px] text-gray-400 mt-1">Sites in portfolio</p>
            <Link to="/properties" className="mt-3 block btn-secondary !text-[11px] !py-2 text-center">
              View portfolio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
