import { Link } from 'react-router-dom';
import type { Project } from '../../lib/types';
import { projectProgress, projectStatusLabels, roleLabels, statusColor } from '../../lib/format';

const priorities = [
  { label: 'Medium', class: 'bg-orange-100 text-orange-700' },
  { label: 'Urgent', class: 'bg-red-100 text-red-700' },
  { label: 'Low', class: 'bg-gray-100 text-gray-600' },
];

const barColors = ['bg-orange-400', 'bg-teal-400', 'bg-violet-400', 'bg-pink-400'];

export function TodayProjectCard({
  project,
  index = 0,
  showTracking = false,
}: {
  project: Project;
  index?: number;
  showTracking?: boolean;
}) {
  const progress = projectProgress(project.startDate, project.endDate);
  const priority = priorities[index % 3];
  const barColor = barColors[index % barColors.length];
  const taskCount = project._count?.tasks ?? 0;
  const docCount = project._count?.documents ?? 0;

  return (
    <Link to={`/projects/${project.id}`} className="card card-hover p-4 flex flex-col h-full group">
      <div className="flex items-start justify-between gap-2">
        <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-gray-200 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
          </svg>
        </div>
        <button
          type="button"
          onClick={(e) => e.preventDefault()}
          className="p-1 rounded-lg text-gray-300 hover:text-gray-500 hover:bg-gray-50 opacity-0 group-hover:opacity-100 transition-all"
          aria-label="Options"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
      </div>

      <div className="flex items-center gap-2 mt-3 flex-wrap">
        <h3 className="text-[13px] font-bold text-gray-900 group-hover:text-teal-700 transition-colors leading-snug">
          {project.name}
        </h3>
        {showTracking ? (
          <span className={`pill ${statusColor(project.status)}`}>{projectStatusLabels[project.status]}</span>
        ) : (
          <span className={`pill ${priority.class}`}>{priority.label}</span>
        )}
      </div>

      <p className="text-[11px] text-gray-400 mt-1.5 line-clamp-2 leading-relaxed flex-1">
        {project.description ?? `${project.property?.name ?? 'Alamait'} — ${project.type.toLowerCase()}`}
      </p>

      {showTracking && project.createdBy && (
        <p className="text-[10px] text-gray-500 mt-1.5">
          by {project.createdBy.name}
          {project.createdBy.role && <span className="text-gray-400"> · {roleLabels[project.createdBy.role]}</span>}
        </p>
      )}

      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] text-gray-400">Progress: {progress}%</span>
        </div>
        <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
          <div className={`h-full ${barColor} rounded-full`} style={{ width: `${progress}%` }} />
        </div>
        <div className="flex items-center justify-between mt-2.5">
          <div className="flex -space-x-1.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-5 h-5 rounded-full bg-gray-200 border-2 border-white text-[8px] font-bold flex items-center justify-center text-gray-500">
                {project.manager?.name?.charAt(i) ?? String.fromCharCode(65 + i)}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2.5 text-gray-400">
            <span className="flex items-center gap-0.5 text-[10px]">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              {taskCount}
            </span>
            <span className="flex items-center gap-0.5 text-[10px]">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              {docCount}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
