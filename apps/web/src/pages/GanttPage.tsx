import { Link } from 'react-router-dom';

import { useSearchParams } from 'react-router-dom';

import { AppPageLayout } from '../components/layout/AppPageLayout';

import { GanttWorkspace } from '../components/gantt/GanttWorkspace';

import { MetricCard } from '../components/ui/MetricCard';

import { formatUsd } from '../lib/format';

import { useAuth } from '../lib/auth';

import { usePortfolioData } from '../hooks/usePortfolioData';



export function GanttPage() {

  const { user } = useAuth();

  const data = usePortfolioData();

  const [params] = useSearchParams();

  const projectId = params.get('project') ?? undefined;

  const scheduleCount = data.projects.filter((p) => p.type !== 'MANAGED').length;



  const role = user?.role ?? 'PM';

  const quickRole = role === 'QA' ? 'QA' : role === 'CEO' ? 'CEO' : role === 'ADMIN' ? 'ADMIN' : 'PM';



  return (

    <AppPageLayout

      eyebrow="Schedules · Alamait"

      title="Gantt charts"

      subtitle="Build and maintain project timelines with tasks, milestones, and dependencies. Export to PDF, PNG, or CSV from the toolbar."

      quickActionsRole={quickRole}

      actions={

        <Link to="/projects?new=1" className="btn-primary !text-[12px]">+ New project</Link>

      }

    >

      <div className="grid grid-cols-3 gap-3">

        <MetricCard label="Schedulable projects" value={data.loading ? '—' : scheduleCount || data.projects.length} />

        <MetricCard label="Active" value={data.loading ? '—' : data.active.length} />

        <MetricCard label="Portfolio budget" value={data.loading ? '—' : formatUsd(data.totalBudget)} />

      </div>



      <GanttWorkspace projects={data.projects} initialProjectId={projectId} />

    </AppPageLayout>

  );

}

