import { Link } from 'react-router-dom';
import { IconBuilding, IconChevron, IconMapPin, IconProjects } from '../icons';
import type { Project, Property } from '../../lib/types';
import { getProjectTracking } from '../../lib/projectTracking';
import {
  formatPercent,
  formatUsd,
  projectStatusLabels,
  projectTypeLabels,
  statusColor,
} from '../../lib/format';

export type PropertyStats = {
  projectCount: number;
  activeCount: number;
  totalBudget: number;
  projects: Project[];
};

export function getPropertyStats(projects: Project[]): PropertyStats {
  const activeCount = projects.filter((p) => p.status === 'ACTIVE').length;
  const totalBudget = projects.reduce((s, p) => s + parseFloat(p.budgetUsd ?? '0'), 0);
  return {
    projectCount: projects.length,
    activeCount,
    totalBudget,
    projects,
  };
}

export function PropertyCard({
  property,
  stats,
}: {
  property: Property;
  stats: PropertyStats;
  index?: number;
}) {
  const { projectCount, activeCount, totalBudget, projects } = stats;
  const primary = projects.find((p) => p.status === 'ACTIVE') ?? projects[0];

  return (
    <article className="card card-hover p-4 flex flex-col h-full">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 shrink-0">
          <IconBuilding className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-[15px] font-bold text-gray-900 leading-snug">{property.name}</h3>
          <p className="text-[11px] text-gray-500 flex items-start gap-1 mt-1">
            <IconMapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span className="line-clamp-2">{property.address}</span>
          </p>
          {property.city && (
            <span className="inline-block mt-2 pill bg-gray-100 text-gray-600 text-[10px]">{property.city}</span>
          )}
        </div>
      </div>

      <dl className="grid grid-cols-3 gap-2 mt-4 py-3 border-y border-gray-100">
        <div>
          <dt className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">Projects</dt>
          <dd className="text-[15px] font-bold text-gray-900 tabular-nums mt-0.5">{projectCount}</dd>
        </div>
        <div>
          <dt className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">Active</dt>
          <dd className="text-[15px] font-bold text-emerald-700 tabular-nums mt-0.5">{activeCount}</dd>
        </div>
        <div>
          <dt className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">CapEx</dt>
          <dd className="text-[13px] font-bold text-gray-900 tabular-nums mt-0.5 truncate" title={formatUsd(totalBudget)}>
            {totalBudget > 0 ? formatUsd(totalBudget) : '—'}
          </dd>
        </div>
      </dl>

      {primary ? (
        <div className="mt-3 p-2.5 rounded-lg bg-gray-50/80 border border-gray-100">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Primary project</p>
          <p className="text-[12px] font-semibold text-gray-900 mt-0.5 truncate">{primary.name}</p>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            <span className={`pill text-[10px] ${statusColor(primary.status)}`}>
              {projectStatusLabels[primary.status]}
            </span>
            <span className="pill text-[10px] bg-gray-100 text-gray-600">{projectTypeLabels[primary.type]}</span>
          </div>
        </div>
      ) : (
        <p className="mt-3 text-[12px] text-gray-400 flex items-center gap-2">
          <IconProjects className="w-4 h-4" />
          No linked projects
        </p>
      )}

      <div className="flex gap-2 mt-4 pt-1">
        <Link
          to={`/projects?property=${property.id}`}
          className="btn-secondary flex-1 !py-2 !text-[11px] justify-center"
        >
          View projects
        </Link>
        <Link
          to={`/projects?new=1&property=${property.id}`}
          className="btn-primary flex-1 !py-2 !text-[11px] justify-center"
        >
          Add project
        </Link>
      </div>
    </article>
  );
}

export function PropertyListRow({
  property,
  stats,
}: {
  property: Property;
  stats: PropertyStats;
  index?: number;
}) {
  const { projectCount, activeCount, totalBudget, projects } = stats;
  const latest = projects.find((p) => p.status === 'ACTIVE') ?? projects[0];
  const tracking = latest ? getProjectTracking(latest) : null;

  return (
    <tr className="group">
      <td>
        <div className="flex items-center gap-3 min-w-[180px]">
          <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 shrink-0">
            <IconBuilding className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-gray-900">{property.name}</p>
            {property.city && <p className="text-[10px] text-gray-400">{property.city}</p>}
          </div>
        </div>
      </td>
      <td className="text-gray-500 max-w-[200px]">
        <span className="line-clamp-1 text-[12px]">{property.address}</span>
      </td>
      <td className="num">{projectCount}</td>
      <td className="num text-emerald-700">{activeCount}</td>
      <td className="num">{tracking ? formatPercent(tracking.schedulePct) : '—'}</td>
      <td>
        {latest ? (
          <span className={`pill text-[10px] ${statusColor(latest.status)}`}>
            {projectStatusLabels[latest.status]}
          </span>
        ) : (
          <span className="text-gray-300">—</span>
        )}
      </td>
      <td className="num">{totalBudget > 0 ? formatUsd(totalBudget) : '—'}</td>
      <td className="max-w-[160px]">
        {latest ? (
          <Link to={`/projects/${latest.id}`} className="text-[12px] text-teal-800 hover:underline font-medium line-clamp-1">
            {latest.name}
          </Link>
        ) : (
          <span className="text-gray-300">—</span>
        )}
      </td>
      <td className="text-right">
        <Link
          to={`/projects?property=${property.id}`}
          className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-gray-600 hover:text-gray-900"
        >
          Open
          <IconChevron className="w-3 h-3" />
        </Link>
      </td>
    </tr>
  );
}
