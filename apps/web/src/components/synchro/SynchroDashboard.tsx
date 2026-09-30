import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { usersApi } from '../../lib/api';
import { formatUsd, roleLabels } from '../../lib/format';
import type { AuditLog, Project, User, UserRole } from '../../lib/types';
import { EmptyState } from '../ui/EmptyState';
import { ActivityFeed } from './ActivityFeed';
import { ActivityTimeline } from './ActivityTimeline';
import { KpiRow } from './KpiRow';
import { MeetingsPanel } from './MeetingsPanel';
import { MilestoneChart } from './MilestoneChart';
import { QuickActions } from './QuickActions';
import { RolePanel } from './RolePanel';
import { TeamPanel } from './TeamPanel';
import { TodayProjectCard } from './TodayProjectCard';

export function SynchroDashboard({
  role,
  userName: _userName,
  projects,
  audit,
  loading,
  totalBudget,
  active,
}: {
  role: UserRole;
  userName: string;
  projects: Project[];
  audit: AuditLog[];
  loading: boolean;
  totalBudget: number;
  active: Project[];
}) {
  const [team, setTeam] = useState<User[]>([]);
  const [teamLoading, setTeamLoading] = useState(true);

  useEffect(() => {
    usersApi.list().then(setTeam).catch(() => []).finally(() => setTeamLoading(false));
  }, []);

  const taskCount = projects.reduce((s, p) => s + (p._count?.tasks ?? 0), 0) + projects.length * 2;

  const kpis = [
    { label: 'Total Projects', value: loading ? '—' : projects.length, sub: `${active.length} active projects` },
    { label: 'Total Tasks', value: loading ? '—' : taskCount, sub: 'Tasks created' },
    { label: 'In Progress', value: loading ? '—' : active.length, sub: 'Active now' },
    { label: 'Budget (USD)', value: loading ? '—' : formatUsd(totalBudget), sub: 'Portfolio value' },
  ];

  return (
    <div className="page-shell">
      <p className="text-[12px] text-gray-400 mb-1">{roleLabels[role]} · Alamait</p>

      <div className="flex flex-col xl:flex-row gap-5">
        <div className="flex-1 min-w-0 space-y-4 animate-fade-up">
          <QuickActions role={role} />
          <KpiRow stats={kpis} />
          <ActivityTimeline projects={projects} />

          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="section-title">Today Projects</h2>
              <div className="flex items-center gap-2">
                <Link to="/projects?new=1" className="btn-primary !py-1.5 !px-3 !text-[12px]">
                  + New Project
                </Link>
                <Link to="/projects" className="p-1.5 rounded-xl border border-gray-200 text-gray-400 hover:bg-gray-50">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                  </svg>
                </Link>
              </div>
            </div>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[1, 2].map((i) => <div key={i} className="h-44 skeleton" />)}
              </div>
            ) : projects.length === 0 ? (
              <EmptyState standalone title="No projects yet" description="Create your first project to get started." action={<Link to="/projects?new=1" className="btn-primary">+ New Project</Link>} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {projects.slice(0, 4).map((p, i) => (
                  <TodayProjectCard key={p.id} project={p} index={i} />
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <MilestoneChart />
            <ActivityFeed logs={audit} />
          </div>

          <RolePanel role={role} projects={projects} totalBudget={totalBudget} />
        </div>

        <div className="xl:w-[280px] shrink-0 space-y-4 animate-fade-up">
          <TeamPanel members={team} loading={teamLoading} />
          <MeetingsPanel role={role} />
        </div>
      </div>
    </div>
  );
}
