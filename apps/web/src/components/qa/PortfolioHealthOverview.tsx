import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart } from '../charts/BarChart';
import { DonutChart } from '../charts/DonutChart';
import { MetricCard } from '../ui/MetricCard';
import {
  filterPortfolioHealth,
  formatVariance,
  getHealthDistribution,
  getProjectMetrics,
  healthLabel,
  type HealthFilter,
  type PortfolioProjectHealth,
} from '../../lib/portfolioHealth';
import { formatPercent, formatUsd, formatUsdCell } from '../../lib/format';
import { PortfolioOverviewTable } from './PortfolioOverviewTable';
import type { PortfolioOverviewTotals } from '../../lib/portfolioHealth';

const OVERVIEW_ID = '__overview__';

const FILTERS: { id: HealthFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'at_risk', label: 'At risk' },
  { id: 'ongoing', label: 'In progress' },
  { id: 'completed', label: 'Done' },
];

const HEALTH_DOT = { healthy: 'bg-emerald-500', watch: 'bg-amber-500', at_risk: 'bg-red-500' } as const;
const HEALTH_COLORS = { healthy: '#059669', watch: '#d97706', at_risk: '#dc2626' } as const;

const HEALTH_LEGEND: {
  key: keyof typeof HEALTH_COLORS;
  label: string;
  description: string;
}[] = [
  {
    key: 'healthy',
    label: 'On track',
    description: 'Within budget; no serious variance and nothing flagged over 100% complete.',
  },
  {
    key: 'watch',
    label: 'Watch',
    description: 'Active work in progress, or minor issues worth monitoring this period.',
  },
  {
    key: 'at_risk',
    label: 'At risk',
    description: 'Over budget (negative variance), material overspend, or progress above 100%.',
  },
];

function HealthPill({ level }: { level: ReturnType<typeof healthLabel> }) {
  const labels = { healthy: 'On track', watch: 'Watch', at_risk: 'At risk' };
  const styles = {
    healthy: 'bg-emerald-50 text-emerald-800 ring-emerald-200/60',
    watch: 'bg-amber-50 text-amber-800 ring-amber-200/60',
    at_risk: 'bg-red-50 text-red-800 ring-red-200/60',
  };
  return <span className={`pill text-[10px] ring-1 ${styles[level]}`}>{labels[level]}</span>;
}

function ProgressCell({ pct }: { pct: number }) {
  const w = Math.min(100, Math.max(0, pct));
  return (
    <div className="flex items-center gap-2 min-w-[120px]">
      <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
        <div className={`h-full rounded-full ${pct > 100 ? 'bg-red-500' : 'bg-teal-600'}`} style={{ width: `${w}%` }} />
      </div>
      <span className={`text-[11px] font-semibold tabular-nums w-9 text-right ${pct > 100 ? 'text-red-600' : 'text-gray-700'}`}>
        {pct}%
      </span>
    </div>
  );
}

function ProjectMain({ project }: { project: PortfolioProjectHealth }) {
  const m = getProjectMetrics(project);
  const level = healthLabel(project);

  return (
    <div className="p-5 space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{project.name}</h3>
          <div className="mt-2">
            <HealthPill level={level} />
          </div>
        </div>
        <Link to="/gantt" className="btn-secondary !text-[12px]">
          Open schedule
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard label="Approved CapEx" value={formatUsd(m.budget)} />
        <MetricCard label="Spent to date" value={formatUsd(m.actual)} />
        <MetricCard label="Forecast" value={formatUsd(m.forecast)} />
        <MetricCard
          label="Variance"
          value={formatVariance(m.variance)}
          sub={m.variance < 0 ? 'Over budget' : 'Within budget'}
        />
      </div>

      <ProgressCell pct={m.progress} />

      {project.summary?.notes && (
        <div className="rounded-xl border border-amber-100 bg-amber-50/60 px-4 py-3 text-[13px] text-amber-950">
          {project.summary.notes}
        </div>
      )}

      <div>
        <h4 className="section-title mb-2">Phases</h4>
        <div className="border border-gray-100 rounded-xl overflow-hidden">
          <table className="data-table text-[12px]">
            <thead>
              <tr className="bg-gray-50/80">
                <th>Phase</th>
                <th className="num">% complete</th>
                <th>Status</th>
                <th className="num">CapEx</th>
                <th className="num">Spent (TD)</th>
                <th className="num">Est. to complete</th>
                <th className="num">Forecast</th>
                <th className="num">Variance</th>
                <th className="num">Cash · 30d</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {project.phases.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center text-gray-400 py-6">
                    No phases for this site.
                  </td>
                </tr>
              ) : (
                project.phases.map((ph) => (
                  <tr key={ph.id}>
                    <td className="font-medium text-gray-900 max-w-[220px]">{ph.name}</td>
                    <td className="num">{formatPercent(ph.percentComplete)}</td>
                    <td className="text-gray-600 whitespace-nowrap">
                      {ph.status === 'ongoing' ? 'On going' : ph.status === 'completed' ? 'Completed' : '—'}
                    </td>
                    <td className="num">{formatUsdCell(ph.budgetCapex)}</td>
                    <td className="num">{formatUsdCell(ph.actualSpend)}</td>
                    <td className="num">{formatUsdCell(ph.estToComplete)}</td>
                    <td className="num">{formatUsdCell(ph.forecastTotal)}</td>
                    <td className={`num ${ph.variance != null && ph.variance < 0 ? 'text-red-600 font-semibold' : ''}`}>
                      {ph.variance != null ? formatVariance(ph.variance) : '—'}
                    </td>
                    <td className="num">{formatUsdCell(ph.cashFlowNeed30d)}</td>
                    <td className="notes">{ph.notes?.trim() ? ph.notes : '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function OverviewMain({
  projects,
  totals,
}: {
  projects: PortfolioProjectHealth[];
  totals: PortfolioOverviewTotals | null;
}) {
  const health = getHealthDistribution(projects);
  const short = (n: string) => (n.length > 11 ? `${n.slice(0, 10)}…` : n);

  const withBudget = projects.filter((p) => getProjectMetrics(p).budget > 0);
  const budgetBars = withBudget
    .map((p) => ({
      label: short(p.name),
      value: getProjectMetrics(p).budget,
      color: healthLabel(p) === 'at_risk' ? '#dc2626' : healthLabel(p) === 'watch' ? '#d97706' : '#0d9488',
    }))
    .sort((a, b) => b.value - a.value);

  const varianceBars = withBudget
    .filter((p) => getProjectMetrics(p).variance !== 0)
    .map((p) => ({
      label: short(p.name),
      value: Math.abs(getProjectMetrics(p).variance),
      color: '#dc2626',
    }));

  return (
    <div className="p-5 space-y-5">
      <p className="text-[13px] text-gray-500">
        Whole-portfolio view — select a project on the left for phase-level cost detail.
      </p>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <div className="xl:col-span-5 card p-5 !shadow-none border border-gray-100 bg-gradient-to-b from-white to-gray-50/30">
          <p className="section-label mb-3">Health distribution</p>
          <DonutChart
            size={168}
            centerLabel="sites"
            legendTitle="Health key"
            formatValue={(n) => `${n}`}
            segments={HEALTH_LEGEND.map((item) => ({
              label: item.label,
              value: health[item.key],
              color: HEALTH_COLORS[item.key],
              description: item.description,
            }))}
          />
        </div>
        <div className="xl:col-span-7 card p-5 !shadow-none border border-gray-100">
          <p className="section-label mb-4">CapEx by project</p>
          {budgetBars.length > 0 ? (
            <BarChart data={budgetBars} formatValue={(n) => formatUsd(n)} layout="horizontal" />
          ) : (
            <p className="text-[12px] text-gray-400 py-8 text-center">No budget data</p>
          )}
        </div>
        {varianceBars.length > 0 && (
          <div className="xl:col-span-12 card p-5 !shadow-none border border-gray-100">
            <p className="section-label mb-4">Variance exposure</p>
            <BarChart data={varianceBars} formatValue={(n) => formatUsd(n)} layout="horizontal" />
          </div>
        )}
      </div>

      <div>
        <h4 className="section-title mb-2">Portfolio overview</h4>
        <p className="text-[12px] text-gray-500 mb-3">
          Same structure as the Alamait executive sheet — sites, phases, and totals.
        </p>
        <PortfolioOverviewTable projects={projects} totals={totals} />
      </div>
    </div>
  );
}

export function PortfolioHealthOverview({
  projects,
  totals = null,
  loading = false,
}: {
  projects: PortfolioProjectHealth[];
  totals?: PortfolioOverviewTotals | null;
  loading?: boolean;
}) {
  const [selectedId, setSelectedId] = useState(OVERVIEW_ID);
  const [filter, setFilter] = useState<HealthFilter>('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(
    () => filterPortfolioHealth(projects, filter, search),
    [projects, filter, search],
  );

  const selectedProject = useMemo(
    () => (selectedId === OVERVIEW_ID ? null : projects.find((p) => p.id === selectedId)),
    [selectedId, projects],
  );

  if (loading) {
    return <div className="card min-h-[540px] p-8 skeleton" />;
  }

  if (projects.length === 0) {
    return (
      <div className="card min-h-[200px] p-8 text-center">
        <p className="text-[14px] font-semibold text-gray-900">No portfolio overview data</p>
        <p className="text-[12px] text-gray-500 mt-2 max-w-md mx-auto">
          Load executive data with <code className="text-[11px] bg-gray-100 px-1 rounded">npm run db:portfolio</code>{' '}
          or run <code className="text-[11px] bg-gray-100 px-1 rounded">scripts/alamait-portfolio-overview.sql</code> in
          pgAdmin.
        </p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden flex flex-col lg:flex-row min-h-[540px]">
      <aside className="lg:w-[272px] shrink-0 border-b lg:border-b-0 lg:border-r border-gray-100 flex flex-col bg-gray-50/30">
        <div className="p-4 border-b border-gray-100 bg-white">
          <h2 className="section-title">Portfolio</h2>
          <input
            type="search"
            placeholder="Search projects…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field !py-2 !text-[12px] w-full mt-3"
          />
          <div className="flex flex-wrap gap-1.5 mt-3">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={`px-2.5 py-1 rounded-md text-[10px] font-semibold ${
                  filter === f.id ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-2 space-y-0.5" aria-label="Portfolio navigation">
          <button
            type="button"
            onClick={() => setSelectedId(OVERVIEW_ID)}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-[12px] font-semibold transition-colors ${
              selectedId === OVERVIEW_ID
                ? 'bg-white text-gray-900 shadow-sm border border-gray-100'
                : 'text-gray-600 hover:bg-white/70'
            }`}
          >
            Portfolio overview
            <span className="block text-[10px] font-normal text-gray-400 mt-0.5">Charts & summary table</span>
          </button>

          {filtered.map((p) => {
            const level = healthLabel(p);
            const active = p.id === selectedId;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedId(p.id)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-[12px] transition-colors flex gap-2 items-start ${
                  active ? 'bg-white text-gray-900 shadow-sm border border-gray-100' : 'text-gray-600 hover:bg-white/70'
                }`}
              >
                <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${HEALTH_DOT[level]}`} aria-hidden />
                <span className="min-w-0 flex-1">
                  <span className="font-semibold line-clamp-2">{p.name}</span>
                  <span className="block text-[10px] text-gray-400 mt-0.5 tabular-nums">
                    {getProjectMetrics(p).progress}% · {formatUsd(getProjectMetrics(p).budget)}
                  </span>
                </span>
              </button>
            );
          })}

          {filtered.length === 0 && (
            <p className="text-[12px] text-gray-400 text-center py-6">No projects match.</p>
          )}
        </nav>
      </aside>

      <main className="flex-1 min-w-0 bg-white overflow-y-auto">
        {selectedProject ? (
          <ProjectMain project={selectedProject} />
        ) : (
          <OverviewMain projects={filtered} totals={totals} />
        )}
      </main>
    </div>
  );
}
