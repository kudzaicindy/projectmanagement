import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppPageLayout } from '../layout/AppPageLayout';
import { PortfolioHealthOverview } from '../qa/PortfolioHealthOverview';
import { KpiRow } from '../synchro/KpiRow';
import { TeamPanel } from '../synchro/TeamPanel';
import { usersApi } from '../../lib/api';
import { usePortfolioHealth } from '../../hooks/usePortfolioHealth';
import { formatVariance, getPortfolioHealthTotals, healthLabel } from '../../lib/portfolioHealth';
import { formatUsd } from '../../lib/format';
import type { Project, User } from '../../lib/types';

export function QADashboard({
  userName,
  projects,
  loading,
  totalBudget,
}: {
  userName: string;
  projects: Project[];
  loading: boolean;
  totalBudget: number;
}) {
  const [team, setTeam] = useState<User[]>([]);
  const qsProjects = projects.filter((p) => p.type !== 'MANAGED');
  const { projects: portfolioSites, totals: portfolioTotals, loading: portfolioLoading } = usePortfolioHealth();
  const totals = useMemo(() => getPortfolioHealthTotals(portfolioSites), [portfolioSites]);
  const atRisk = useMemo(
    () => portfolioSites.filter((p) => healthLabel(p) === 'at_risk'),
    [portfolioSites],
  );

  useEffect(() => {
    usersApi.list().catch(() => []).then(setTeam);
  }, []);

  const kpis = [
    { label: 'Portfolio sites', value: totals.projectCount, sub: 'Alamait tracking' },
    { label: 'At risk', value: totals.atRiskCount, sub: totals.atRiskCount ? 'Needs QA review' : 'Clear' },
    { label: 'Net variance', value: formatVariance(totals.totalVariance), sub: 'Vs approved CapEx' },
    { label: 'Cash · 30d', value: formatUsd(totals.cashNeed30d), sub: 'Funding window' },
  ];

  return (
    <AppPageLayout
      eyebrow="QA / Quantity Surveying · Alamait"
      title="Quantity surveying dashboard"
      subtitle={`${userName.split(' ')[0]}, review portfolio health, variances, and phases — then open schedules in Gantt when needed.`}
      quickActionsRole="QA"
      actions={
        <>
          <Link to="/gantt" className="btn-secondary !text-[12px]">
            Gantt
          </Link>
          <Link to="/projects" className="btn-primary !text-[12px]">
            Projects
          </Link>
        </>
      }
      sidebar={<TeamPanel members={team} loading={false} />}
    >
      <KpiRow stats={kpis} />

      {atRisk.length > 0 && (
        <div className="card p-4 border-l-4 border-l-red-400 bg-red-50/35">
          <p className="text-[13px] font-bold text-red-900">
            {atRisk.length} project{atRisk.length === 1 ? '' : 's'} flagged: {atRisk.map((p) => p.name).join(', ')}
          </p>
        </div>
      )}

      <PortfolioHealthOverview projects={portfolioSites} totals={portfolioTotals} loading={portfolioLoading} />

      <div className="card p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="section-label">EstatePM data</p>
          <p className="text-[13px] text-gray-600 mt-0.5">
            {loading ? 'Loading…' : `${qsProjects.length} QS project(s) · ${formatUsd(totalBudget)} approved in app`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/gantt" className="btn-secondary !text-[11px]">
            Schedules
          </Link>
          <Link to="/properties" className="btn-secondary !text-[11px]">
            Portfolio sites
          </Link>
        </div>
      </div>
    </AppPageLayout>
  );
}
