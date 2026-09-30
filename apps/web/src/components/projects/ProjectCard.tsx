import { Link } from 'react-router-dom';
import { GenerateGanttButton } from '../gantt/GenerateGanttButton';
import { IconCalendar, IconDocument } from '../icons';
import type { Project } from '../../lib/types';
import { getProjectTracking } from '../../lib/projectTracking';
import {
  formatDate,
  formatPercent,
  formatUsd,
  projectStatusLabels,
  projectTypeLabels,
  statusColor,
  typeColor,
} from '../../lib/format';

function TrackingPill({ label, tone }: { label: string; tone: 'ok' | 'warn' | 'bad' | 'muted' }) {
  const styles = {
    ok: 'bg-emerald-50 text-emerald-800 ring-emerald-200/60',
    warn: 'bg-amber-50 text-amber-800 ring-amber-200/60',
    bad: 'bg-red-50 text-red-800 ring-red-200/60',
    muted: 'bg-gray-100 text-gray-600 ring-gray-200/60',
  };
  return <span className={`pill text-[10px] ring-1 ${styles[tone]}`}>{label}</span>;
}

function ProgressTrack({ pct, accent = 'bg-teal-600' }: { pct: number; accent?: string }) {
  const w = Math.min(100, Math.max(0, pct));
  return (
    <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
      <div className={`h-full rounded-full ${accent}`} style={{ width: `${w}%` }} />
    </div>
  );
}

export function ProjectCard({ project }: { project: Project }) {
  const t = getProjectTracking(project);

  return (
    <Link to={`/projects/${project.id}`} className="card card-hover p-4 flex flex-col h-full group">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="text-[14px] font-bold text-gray-900 truncate group-hover:text-teal-700">{project.name}</h3>
          <p className="text-[11px] text-gray-500 truncate mt-0.5">{project.property?.name ?? '—'}</p>
        </div>
        <span className={`pill shrink-0 ${statusColor(project.status)}`}>{projectStatusLabels[project.status]}</span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 mt-3">
        <span className={`pill ${typeColor(project.type)}`}>{projectTypeLabels[project.type]}</span>
        <TrackingPill label={t.trackingLabel} tone={t.trackingTone} />
        {t.isOverdue && <span className="pill bg-red-50 text-red-700 ring-red-200/60">Overdue</span>}
      </div>

      <div className="mt-4 space-y-3 flex-1">
        <div>
          <div className="flex justify-between text-[10px] mb-1">
            <span className="text-gray-500 font-medium">Schedule (tasks)</span>
            <span className="font-bold tabular-nums text-gray-800">{t.schedulePct}%</span>
          </div>
          <ProgressTrack pct={t.schedulePct} />
        </div>
        <div>
          <div className="flex justify-between text-[10px] mb-1">
            <span className="text-gray-500 font-medium">Timeline</span>
            <span className="font-bold tabular-nums text-gray-600">{t.timelinePct}%</span>
          </div>
          <ProgressTrack pct={t.timelinePct} accent="bg-gray-400" />
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
        <span className="tabular-nums">{formatUsd(project.budgetUsd)}</span>
        <span>
          {t.tasksComplete}/{t.taskCount} tasks · Due {formatDate(project.endDate)}
        </span>
      </div>

      <div className="flex gap-2 mt-3" onClick={(e) => e.preventDefault()}>
        <GenerateGanttButton
          projectId={project.id}
          projectName={project.name}
          variant="link"
          label="Gantt"
          className="flex-1 text-center py-1.5 rounded-lg border border-gray-100 text-[11px] font-semibold text-gray-700 hover:bg-gray-50 !no-underline"
        />
        <Link
          to={`/projects/${project.id}?tab=documents`}
          className="flex-1 text-center py-1.5 rounded-lg border border-gray-100 text-[11px] font-semibold text-gray-700 hover:bg-gray-50 inline-flex items-center justify-center gap-1"
        >
          <IconDocument className="w-3.5 h-3.5" /> Docs
        </Link>
      </div>
    </Link>
  );
}

export function ProjectListRow({ project }: { project: Project }) {
  const t = getProjectTracking(project);

  return (
    <tr className="group">
      <td className="!py-3">
        <Link to={`/projects/${project.id}`} className="text-[13px] font-semibold text-gray-900 hover:text-teal-700">
          {project.name}
        </Link>
        <p className="text-[11px] text-gray-400">{project.property?.name}</p>
      </td>
      <td className="!py-3">
        <span className={`pill ${typeColor(project.type)}`}>{projectTypeLabels[project.type]}</span>
      </td>
      <td className="!py-3">
        <span className={`pill ${statusColor(project.status)}`}>{projectStatusLabels[project.status]}</span>
      </td>
      <td className="!py-3 min-w-[120px]">
        <div className="flex items-center gap-2">
          <div className="flex-1 max-w-[80px]">
            <ProgressTrack pct={t.schedulePct} />
          </div>
          <span className="num inline-block !py-0 !px-0 text-[11px] font-bold">{formatPercent(t.schedulePct)}</span>
        </div>
        <p className="text-[10px] text-gray-400 mt-0.5">
          {t.tasksComplete}/{t.taskCount} done
        </p>
      </td>
      <td className="!py-3">
        <TrackingPill label={t.trackingLabel} tone={t.trackingTone} />
        {t.isOverdue && (
          <span className="block mt-1 text-[10px] font-semibold text-red-600">Past due</span>
        )}
      </td>
      <td className="num !py-3">{formatUsd(project.budgetUsd)}</td>
      <td className="!py-3 text-[11px] text-gray-500 whitespace-nowrap">{formatDate(project.endDate)}</td>
      <td className="!py-3 whitespace-nowrap">
        <GenerateGanttButton
          projectId={project.id}
          projectName={project.name}
          variant="link"
          label="Gantt chart"
        />
      </td>
      <td className="!py-3">
        <Link to={`/projects/${project.id}?tab=documents`} className="text-gray-400 hover:text-teal-700" title="Documents">
          <IconDocument className="w-4 h-4" />
        </Link>
      </td>
    </tr>
  );
}
