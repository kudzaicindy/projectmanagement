import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { projectsApi, tasksApi } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { formatDate } from '../../lib/format';
import { canEditSchedule } from '../../lib/permissions';
import type { Project, Task, TaskStatus } from '../../lib/types';
import { GanttChart } from './GanttChart';
import { GanttExportMenu } from './GanttExportMenu';
import { GenerateGanttButton } from './GenerateGanttButton';

const statuses: TaskStatus[] = ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED'];

function toDateInput(value: string) {
  return value.slice(0, 10);
}

export function GanttWorkspace({
  projects,
  initialProjectId,
  canEdit: canEditOverride,
  compact: _compact = false,
}: {
  projects: Project[];
  initialProjectId?: string;
  /** Override schedule edit permission; defaults to role-based check (QA, PM, Admin, CEO) */
  canEdit?: boolean;
  compact?: boolean;
}) {
  const { user } = useAuth();
  const canEdit = canEditOverride ?? canEditSchedule(user);

  const qsProjects = projects.filter((p) => p.type !== 'MANAGED');
  let list = qsProjects.length > 0 ? qsProjects : projects;
  if (initialProjectId && !list.some((p) => p.id === initialProjectId)) {
    const extra = projects.find((p) => p.id === initialProjectId);
    if (extra) list = [extra, ...list];
  }

  const [projectId, setProjectId] = useState(initialProjectId ?? list[0]?.id ?? '');
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selected, setSelected] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async (id: string) => {
    if (!id) return;
    setLoading(true);
    try {
      const [p, t] = await Promise.all([projectsApi.get(id), tasksApi.list(id)]);
      setProject(p);
      setTasks(t);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (projectId) load(projectId);
  }, [projectId, load]);

  useEffect(() => {
    if (initialProjectId && initialProjectId !== projectId) {
      setProjectId(initialProjectId);
      setSelected(null);
    }
  }, [initialProjectId, projectId]);

  useEffect(() => {
    if (!projectId && list[0]?.id) setProjectId(list[0].id);
  }, [list, projectId]);

  useEffect(() => {
    if (selected && editorRef.current) {
      editorRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [selected]);

  async function handleCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!projectId || !canEdit) return;
    const form = new FormData(e.currentTarget);
    setSubmitting(true);
    try {
      await tasksApi.create(projectId, {
        name: form.get('name'),
        startDate: form.get('startDate'),
        endDate: form.get('endDate'),
        progress: Number(form.get('progress') || 0),
        status: form.get('status') || 'NOT_STARTED',
        isMilestone: form.get('isMilestone') === 'on',
        predecessorId: (form.get('predecessorId') as string) || undefined,
      });
      setShowForm(false);
      load(projectId);
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to add task');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdate(task: Task, patch: Record<string, unknown>) {
    if (!canEdit) return;
    try {
      await tasksApi.update(task.id, patch);
      load(projectId);
      setSelected(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Update failed');
    }
  }

  async function handleEditSubmit(e: FormEvent<HTMLFormElement>, task: Task) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    await handleUpdate(task, {
      name: form.get('name'),
      startDate: form.get('startDate'),
      endDate: form.get('endDate'),
      progress: Number(form.get('progress') || 0),
      status: form.get('status'),
      isMilestone: form.get('isMilestone') === 'on',
      predecessorId: (form.get('predecessorId') as string) || null,
    });
  }

  async function handleDelete(taskId: string) {
    if (!canEdit || !confirm('Delete this task?')) return;
    try {
      await tasksApi.remove(taskId);
      setSelected(null);
      load(projectId);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed');
    }
  }

  if (list.length === 0) {
    return (
      <div className="card p-10 text-center text-slate-500 text-sm">
        No renovation or development projects yet. Create a project first, then build its schedule here.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="card p-4 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <label className="section-label">Project schedule</label>
          <select
            value={projectId}
            onChange={(e) => { setProjectId(e.target.value); setSelected(null); }}
            className="mt-1 w-full sm:w-auto min-w-[240px] select-field font-semibold"
          >
            {list.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          {project && (
            <p className="text-[11px] text-slate-400 mt-1.5">
              {project.property?.name} · {formatDate(project.startDate)} – {formatDate(project.endDate)} · {tasks.length} tasks
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <GanttExportMenu chartRef={chartRef} project={project} tasks={tasks} disabled={loading} />
          {projectId && tasks.length === 0 && canEdit && (
            <GenerateGanttButton
              projectId={projectId}
              projectName={project?.name}
              navigate={false}
              onReady={() => load(projectId)}
              variant="secondary"
              label="Generate Gantt"
            />
          )}
          {canEdit && (
            <button type="button" onClick={() => setShowForm(!showForm)} className="btn-primary">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add task
            </button>
          )}
        </div>
      </div>

      {showForm && canEdit && (
        <div className="card p-5 border-l-4 border-l-alamait-gold animate-fade-up">
          <h3 className="text-[14px] font-bold text-gray-900 mb-4">New schedule task</h3>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <input name="name" required placeholder="Task name" className="md:col-span-2 lg:col-span-3 input-field" />
            <input name="startDate" type="date" required className="input-field" />
            <input name="endDate" type="date" required className="input-field" />
            <input name="progress" type="number" min="0" max="100" defaultValue={0} placeholder="Progress %" className="input-field" />
            <select name="status" className="select-field">
              {statuses.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
            <select name="predecessorId" className="select-field">
              <option value="">No predecessor</option>
              {tasks.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <label className="flex items-center gap-2 text-sm text-slate-700 px-2">
              <input name="isMilestone" type="checkbox" className="rounded accent-alamait-navy" />
              Milestone
            </label>
            <div className="md:col-span-2 lg:col-span-3 flex gap-2">
              <button type="submit" disabled={submitting} className="btn-primary">
                {submitting ? 'Saving…' : 'Add to Gantt'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div ref={chartRef} className="card overflow-hidden bg-white">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
          <div>
            <p className="section-label">Alamait EstatePM</p>
            <h2 className="text-[15px] font-bold text-gray-900">{project?.name ?? 'Gantt chart'}</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {project?.property?.name ?? 'Project schedule'} · {tasks.length} tasks
              {canEdit ? ' · Click a task to edit' : ' · View only'}
            </p>
          </div>
          {loading && <span className="text-[11px] text-slate-400 animate-pulse">Loading…</span>}
        </div>
        <GanttChart
          tasks={tasks}
          project={project}
          selectedId={selected?.id}
          onSelect={canEdit ? setSelected : undefined}
          emptyAction={
            projectId && canEdit ? (
              <GenerateGanttButton
                projectId={projectId}
                projectName={project?.name}
                navigate={false}
                onReady={() => load(projectId)}
                variant="primary"
                label="Generate Gantt chart"
              />
            ) : undefined
          }
        />
      </div>

      {/* Selected task editor */}
      {selected && canEdit && (
        <div ref={editorRef} className="card p-5 border-l-4 border-l-alamait-gold animate-fade-up">
          <div className="flex items-start justify-between gap-4 mb-4">
            <h3 className="text-[15px] font-bold text-gray-900">Edit task</h3>
            <button type="button" onClick={() => setSelected(null)} className="btn-ghost text-xs">Close</button>
          </div>
          <form onSubmit={(e) => handleEditSubmit(e, selected)} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <input name="name" required defaultValue={selected.name} className="md:col-span-2 lg:col-span-3 input-field" />
            <input name="startDate" type="date" required defaultValue={toDateInput(selected.startDate)} className="input-field" />
            <input name="endDate" type="date" required defaultValue={toDateInput(selected.endDate)} className="input-field" />
            <input name="progress" type="number" min="0" max="100" defaultValue={selected.progress} className="input-field" />
            <select name="status" defaultValue={selected.status} className="select-field">
              {statuses.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
            <select name="predecessorId" defaultValue={selected.predecessorId ?? ''} className="select-field">
              <option value="">No predecessor</option>
              {tasks.filter((t) => t.id !== selected.id).map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input name="isMilestone" type="checkbox" defaultChecked={selected.isMilestone} className="rounded accent-alamait-navy" />
              Milestone
            </label>
            <div className="md:col-span-2 lg:col-span-3 flex flex-wrap gap-2 pt-2 border-t border-gray-100">
              <button type="submit" className="btn-primary">Save changes</button>
              <button
                type="button"
                onClick={() => handleUpdate(selected, { progress: Math.min(100, selected.progress + 25), status: 'IN_PROGRESS' })}
                className="btn-secondary"
              >
                +25% progress
              </button>
              <button
                type="button"
                onClick={() => handleUpdate(selected, { progress: 100, status: 'COMPLETED' })}
                className="btn-secondary"
              >
                Mark complete
              </button>
              <button
                type="button"
                onClick={() => handleDelete(selected.id)}
                className="btn-ghost text-red-600 hover:bg-red-50 ml-auto"
              >
                Delete task
              </button>
            </div>
          </form>
        </div>
      )}

      {selected && !canEdit && (
        <div className="card p-4 text-[13px] text-slate-500">
          View-only access — schedule editing requires QA, PM, Admin, or CEO role.
        </div>
      )}
    </div>
  );
}
