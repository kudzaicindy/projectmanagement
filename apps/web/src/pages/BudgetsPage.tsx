import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart } from '../components/charts/BarChart';
import { DonutChart } from '../components/charts/DonutChart';
import { AppPageLayout } from '../components/layout/AppPageLayout';
import { MetricCard } from '../components/ui/MetricCard';
import { downloadBudgetLedgerCsv } from '../lib/export';
import { useAuth } from '../lib/auth';
import {
  budgetByType,
  categoryBreakdown,
  getPortfolioBudgetSummary,
  getProjectBudgetLine,
} from '../lib/budgets';
import {
  formatUsd,
  projectStatusLabels,
  projectTypeLabels,
  statusColor,
  typeColor,
} from '../lib/format';
import { usePortfolioData } from '../hooks/usePortfolioData';

type ViewTab = 'projects' | 'categories' | 'properties';

export function BudgetsPage() {
  const { user } = useAuth();
  const data = usePortfolioData();
  const [tab, setTab] = useState<ViewTab>('projects');
  const [search, setSearch] = useState('');

  const summary = useMemo(
    () => getPortfolioBudgetSummary(data.projects),
    [data.projects],
  );

  const budgetProjects = useMemo(
    () =>
      data.projects
        .filter((p) => p.budgetUsd)
        .map((p) => ({ project: p, line: getProjectBudgetLine(p) }))
        .sort((a, b) => b.line.approved - a.line.approved),
    [data.projects],
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return budgetProjects;
    return budgetProjects.filter(
      ({ project: p }) =>
        p.name.toLowerCase().includes(q) ||
        p.property?.name?.toLowerCase().includes(q),
    );
  }, [budgetProjects, search]);

  const typeBudgets = budgetByType(data.projects);
  const categories = categoryBreakdown(summary.approved);

  const propertyRollup = useMemo(() => {
    const map = new Map<string, { name: string; approved: number; spent: number; count: number }>();
    for (const { project, line } of budgetProjects) {
      const key = project.propertyId;
      const name = project.property?.name ?? 'Unknown';
      const existing = map.get(key) ?? { name, approved: 0, spent: 0, count: 0 };
      existing.approved += line.approved;
      existing.spent += line.spent;
      existing.count += 1;
      map.set(key, existing);
    }
    return [...map.values()].sort((a, b) => b.approved - a.approved);
  }, [budgetProjects]);

  const overBudgetCount = budgetProjects.filter(({ line }) => line.overBudget).length;

  return (
    <AppPageLayout
      eyebrow="Finance · Alamait"
      title="Financial budgets"
      subtitle="Approved budgets, committed spend, disbursements, and remaining capacity across the portfolio (USD)."
      quickActionsRole={user?.role === 'CEO' ? 'CEO' : 'FINANCE'}
      actions={
        <button type="button" className="btn-secondary !text-[12px]" onClick={() => downloadBudgetLedgerCsv(data.projects)}>
          Export ledger
        </button>
      }
    >
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <MetricCard label="Approved budget" value={data.loading ? '—' : formatUsd(summary.approved)} />
        <MetricCard label="Committed" value={data.loading ? '—' : formatUsd(summary.committed)} />
        <MetricCard label="Spent (disbursed)" value={data.loading ? '—' : formatUsd(summary.spent)} />
        <MetricCard label="Remaining" value={data.loading ? '—' : formatUsd(summary.remaining)} />
        <MetricCard
          label="Uncommitted"
          value={data.loading ? '—' : formatUsd(summary.available)}
        />
      </div>

      {overBudgetCount > 0 && !data.loading && (
        <div className="card p-4 mb-4 border-l-4 border-l-amber-400 bg-amber-50/40 animate-fade-up">
          <p className="text-[13px] font-bold text-amber-900">
            {overBudgetCount} project(s) spending ahead of timeline
          </p>
          <p className="text-[11px] text-amber-700/80 mt-0.5">
            Disbursements exceed expected burn rate — review with PM before next release.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6 animate-fade-up">
        <div className="card p-4">
          <h2 className="section-title mb-1">Budget by project type</h2>
          <p className="text-[11px] text-gray-400 mb-3">Approved USD allocation</p>
          {data.loading ? (
            <div className="h-40 skeleton" />
          ) : (
            <BarChart
              data={typeBudgets.map((t) => ({
                label: projectTypeLabels[t.type],
                value: t.amount,
                color: t.type === 'RENOVATION' ? '#f97316' : t.type === 'DEVELOPMENT' ? '#111827' : '#64748b',
              }))}
              formatValue={(n) => formatUsd(n)}
            />
          )}
        </div>
        <div className="card p-4">
          <h2 className="section-title mb-3">Cost category split</h2>
          {data.loading ? (
            <div className="h-40 skeleton" />
          ) : (
            <DonutChart
              segments={categories.map((c) => ({
                label: c.label,
                value: c.amount,
                color: c.color,
              }))}
              formatValue={formatUsd}
            />
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4 animate-fade-up">
        <div className="tab-group">
          {([
            ['projects', 'By project'],
            ['properties', 'By property'],
            ['categories', 'By category'],
          ] as [ViewTab, string][]).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`tab-item ${tab === key ? 'tab-item-active' : 'tab-item-inactive'}`}
            >
              {label}
            </button>
          ))}
        </div>
        {tab === 'projects' && (
          <input
            type="search"
            placeholder="Search projects or properties…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field flex-1 sm:max-w-xs ml-auto"
          />
        )}
      </div>

      {tab === 'projects' && (
        <div className="card overflow-hidden animate-fade-up">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h2 className="section-title">Project budget ledger</h2>
            <span className="text-[11px] text-gray-400">{filtered.length} projects</span>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Type</th>
                  <th>Approved</th>
                  <th>Committed</th>
                  <th>Spent</th>
                  <th>Remaining</th>
                  <th>Utilization</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(({ project: p, line }) => (
                  <tr key={p.id} className={line.overBudget ? 'bg-amber-50/30' : undefined}>
                    <td>
                      <p className="font-semibold text-gray-900">{p.name}</p>
                      <p className="text-[10px] text-gray-400">{p.property?.name ?? '—'}</p>
                    </td>
                    <td><span className={`pill ${typeColor(p.type)}`}>{projectTypeLabels[p.type]}</span></td>
                    <td className="font-mono font-semibold tabular-nums">{formatUsd(line.approved)}</td>
                    <td className="font-mono tabular-nums text-gray-600">{formatUsd(line.committed)}</td>
                    <td className="font-mono tabular-nums text-gray-600">{formatUsd(line.spent)}</td>
                    <td className="font-mono font-semibold tabular-nums text-emerald-700">{formatUsd(line.remaining)}</td>
                    <td>
                      <div className="flex items-center gap-2 min-w-[90px]">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${line.overBudget ? 'bg-amber-500' : 'bg-emerald-500'}`}
                            style={{ width: `${line.utilizationPct}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-gray-500 tabular-nums w-8">{line.utilizationPct}%</span>
                      </div>
                    </td>
                    <td><span className={`pill ${statusColor(p.status)}`}>{projectStatusLabels[p.status]}</span></td>
                    <td>
                      <Link to={`/projects/${p.id}`} className="text-[11px] font-semibold text-teal-700 hover:underline">
                        Open
                      </Link>
                    </td>
                  </tr>
                ))}
                {!data.loading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={9} className="py-10 text-center text-gray-400">
                      {search ? 'No matching budgets.' : 'No project budgets recorded yet.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'properties' && (
        <div className="card overflow-hidden animate-fade-up">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="section-title">Property budget rollup</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Property</th>
                  <th>Projects</th>
                  <th>Approved</th>
                  <th>Spent</th>
                  <th>Remaining</th>
                  <th>Utilization</th>
                </tr>
              </thead>
              <tbody>
                {propertyRollup.map((row) => {
                  const remaining = row.approved - row.spent;
                  const util = row.approved > 0 ? Math.round((row.spent / row.approved) * 100) : 0;
                  return (
                    <tr key={row.name}>
                      <td className="font-semibold text-gray-900">{row.name}</td>
                      <td className="tabular-nums">{row.count}</td>
                      <td className="font-mono font-semibold tabular-nums">{formatUsd(row.approved)}</td>
                      <td className="font-mono tabular-nums">{formatUsd(row.spent)}</td>
                      <td className="font-mono font-semibold tabular-nums text-emerald-700">{formatUsd(remaining)}</td>
                      <td>
                        <div className="flex items-center gap-2 min-w-[90px]">
                          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${util}%` }} />
                          </div>
                          <span className="text-[10px] text-gray-500 tabular-nums">{util}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {!data.loading && propertyRollup.length === 0 && (
                  <tr><td colSpan={6} className="py-10 text-center text-gray-400">No property budgets yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'categories' && (
        <div className="card overflow-hidden animate-fade-up">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="section-title">Portfolio cost categories</h2>
            <p className="text-[11px] text-gray-400 mt-0.5">Estimated split from approved budgets · BOQ detail in Phase 4</p>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Share</th>
                  <th>Allocated (USD)</th>
                  <th>Spent (est.)</th>
                  <th>Remaining</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((c) => {
                  const spent = Math.round(c.amount * (summary.approved > 0 ? summary.spent / summary.approved : 0));
                  const remaining = c.amount - spent;
                  return (
                    <tr key={c.label}>
                      <td className="font-semibold text-gray-900">
                        <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: c.color }} />
                        {c.label}
                      </td>
                      <td className="tabular-nums">{Math.round(c.pct * 100)}%</td>
                      <td className="font-mono font-semibold tabular-nums">{formatUsd(c.amount)}</td>
                      <td className="font-mono tabular-nums">{formatUsd(spent)}</td>
                      <td className="font-mono font-semibold tabular-nums text-emerald-700">{formatUsd(remaining)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <p className="text-[11px] text-gray-400 mt-4">
        Committed and spent figures are derived from approved project budgets until the Phase 5 payment ledger is connected.
      </p>
    </AppPageLayout>
  );
}
