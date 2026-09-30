import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AppPageLayout } from '../components/layout/AppPageLayout';
import { ProjectCard, ProjectListRow } from '../components/projects/ProjectCard';
import { MetricCard } from '../components/ui/MetricCard';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { FormField } from '../components/ui/FormField';
import { projectsApi, propertiesApi } from '../lib/api';
import { useAuth } from '../lib/auth';
import { getProjectTracking } from '../lib/projectTracking';
import { formatUsd, projectStatusLabels, projectTypeLabels } from '../lib/format';
import type { Project, ProjectStatus, ProjectType, Property } from '../lib/types';

type Tab = 'all' | 'mine';
type ViewMode = 'list' | 'grid';

export function ProjectsPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tab, setTab] = useState<Tab>('all');
  const [view, setView] = useState<ViewMode>('list');
  const [projects, setProjects] = useState<Project[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [showForm, setShowForm] = useState(searchParams.get('new') === '1');
  const [submitting, setSubmitting] = useState(false);
  const [addProperty, setAddProperty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'ALL'>('ALL');

  function load(currentTab: Tab = tab) {
    setLoading(true);
    projectsApi
      .list(currentTab === 'mine' ? { mine: true } : undefined)
      .then(setProjects)
      .catch(console.error)
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    propertiesApi.list().then(setProperties).catch(console.error);
  }, [tab]);

  useEffect(() => {
    if (searchParams.get('new') === '1') setShowForm(true);
  }, [searchParams]);

  function openForm() {
    setShowForm(true);
    const property = searchParams.get('property');
    setSearchParams(property ? { new: '1', property } : { new: '1' });
  }

  function closeForm() {
    setShowForm(false);
    setAddProperty(false);
    const property = searchParams.get('property');
    setSearchParams(property ? { property } : {});
  }

  async function handleCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setSubmitting(true);
    try {
      let propertyId = form.get('propertyId') as string;
      if (addProperty) {
        const created = await propertiesApi.create({
          name: form.get('propertyName'),
          address: form.get('propertyAddress'),
          city: form.get('propertyCity') || undefined,
        });
        propertyId = created.id;
        setProperties((prev) => [...prev, created]);
      }
      await projectsApi.create({
        name: form.get('name'),
        type: form.get('type'),
        status: form.get('status') || 'DRAFT',
        propertyId,
        description: form.get('description') || undefined,
        budgetUsd: form.get('budgetUsd') ? Number(form.get('budgetUsd')) : undefined,
        startDate: form.get('startDate') || undefined,
        endDate: form.get('endDate') || undefined,
      });
      closeForm();
      setTab('mine');
      load('mine');
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed');
    } finally {
      setSubmitting(false);
    }
  }

  const propertyFilter = searchParams.get('property') ?? undefined;
  const propertyFilterName = properties.find((p) => p.id === propertyFilter)?.name;

  const filtered = useMemo(() => {
    let list = projects;
    if (propertyFilter) list = list.filter((p) => p.propertyId === propertyFilter);
    if (statusFilter !== 'ALL') list = list.filter((p) => p.status === statusFilter);
    const q = search.toLowerCase().trim();
    if (q) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.property?.name?.toLowerCase().includes(q),
      );
    }
    return list;
  }, [projects, propertyFilter, statusFilter, search]);

  const trackingStats = useMemo(() => {
    const track = projects.map(getProjectTracking);
    return {
      active: projects.filter((p) => p.status === 'ACTIVE').length,
      overdue: track.filter((t) => t.isOverdue).length,
      behind: track.filter((t) => t.trackingTone === 'bad' || t.trackingTone === 'warn').length,
      totalBudget: projects.reduce((s, p) => s + parseFloat(p.budgetUsd ?? '0'), 0),
      avgSchedule:
        track.length > 0
          ? Math.round(track.reduce((s, t) => s + t.schedulePct, 0) / track.length)
          : 0,
    };
  }, [projects]);

  const pageTitle = user?.role === 'PM' ? 'My projects' : 'Project tracking';

  return (
    <AppPageLayout
      eyebrow="Alamait · EstatePM"
      title={pageTitle}
      subtitle="Track schedule progress from tasks, compare to timeline dates, budget, and status — open Gantt or project detail for more."
      quickActionsRole={user?.role}
      actions={
        <>
          <Link to="/gantt" className="btn-secondary !text-[12px]">
            Gantt
          </Link>
          <Button size="sm" onClick={() => (showForm ? closeForm() : openForm())}>
            {showForm ? 'Cancel' : '+ New project'}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard label="Projects" value={loading ? '—' : filtered.length} sub={tab === 'mine' ? 'Assigned to you' : 'In portfolio'} />
        <MetricCard label="Active" value={loading ? '—' : trackingStats.active} sub="In delivery" />
        <MetricCard label="Needs attention" value={loading ? '—' : trackingStats.behind + trackingStats.overdue} sub={`${trackingStats.overdue} overdue`} />
        <MetricCard label="Avg schedule %" value={loading ? '—' : `${trackingStats.avgSchedule}%`} sub={formatUsd(trackingStats.totalBudget)} />
      </div>

      <div className="card p-3 flex flex-col lg:flex-row lg:items-center gap-3 flex-wrap">
        <div className="tab-group">
          {(['all', 'mine'] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`tab-item ${tab === t ? 'tab-item-active' : 'tab-item-inactive'}`}
            >
              {t === 'all' ? 'All projects' : 'Mine'}
            </button>
          ))}
        </div>
        <div className="tab-group">
          {(['list', 'grid'] as ViewMode[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={`tab-item capitalize ${view === v ? 'tab-item-active' : 'tab-item-inactive'}`}
            >
              {v === 'list' ? 'Tracking table' : 'Cards'}
            </button>
          ))}
        </div>
        <input
          type="search"
          placeholder="Search project or property…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field !py-2 !text-[13px] flex-1 min-w-[160px] lg:max-w-xs"
        />
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold ${statusFilter === 'ALL' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}`}
          >
            All statuses
          </button>
          {(Object.keys(projectStatusLabels) as ProjectStatus[]).map((s) => {
            const count = projects.filter((p) => p.status === s).length;
            if (!count) return null;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setStatusFilter(statusFilter === s ? 'ALL' : s)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold ${statusFilter === s ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}`}
              >
                {projectStatusLabels[s]} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {propertyFilter && propertyFilterName && (
        <div className="flex items-center gap-2 text-[12px] px-1">
          <span className="text-gray-500">Filtered by property:</span>
          <span className="font-semibold text-gray-900">{propertyFilterName}</span>
          <button type="button" onClick={() => setSearchParams({})} className="text-teal-700 font-semibold hover:underline">
            Clear
          </button>
        </div>
      )}

      {showForm && (
        <div className="card p-4 border-l-4 border-l-teal-500">
          <h2 className="section-title mb-3">New project</h2>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <FormField label="Name" className="md:col-span-2 lg:col-span-4">
              <input name="name" required placeholder="Project name" className="input-field" />
            </FormField>
            <FormField label="Type">
              <select name="type" required className="select-field">
                {(Object.keys(projectTypeLabels) as ProjectType[]).map((t) => (
                  <option key={t} value={t}>{projectTypeLabels[t]}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Status">
              <select name="status" className="select-field">
                {(Object.keys(projectStatusLabels) as ProjectStatus[]).map((s) => (
                  <option key={s} value={s}>{projectStatusLabels[s]}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Budget (USD)">
              <input name="budgetUsd" type="number" placeholder="Optional" className="input-field" />
            </FormField>
            <FormField label="Start date">
              <input name="startDate" type="date" className="input-field" />
            </FormField>
            <FormField label="End date">
              <input name="endDate" type="date" className="input-field" />
            </FormField>
            {!addProperty ? (
              <FormField label="Property" className="md:col-span-2">
                <select name="propertyId" required={!addProperty} className="select-field" defaultValue={propertyFilter ?? ''}>
                  <option value="">Select property…</option>
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </FormField>
            ) : (
              <>
                <FormField label="New property name" className="md:col-span-2">
                  <input name="propertyName" required className="input-field" />
                </FormField>
                <FormField label="Address" className="md:col-span-2">
                  <input name="propertyAddress" required className="input-field" />
                </FormField>
              </>
            )}
            <label className="md:col-span-2 flex items-center gap-2 text-[12px] text-gray-600 cursor-pointer">
              <input type="checkbox" checked={addProperty} onChange={(e) => setAddProperty(e.target.checked)} className="rounded accent-gray-900" />
              Create new property
            </label>
            <div className="md:col-span-2 lg:col-span-4">
              <Button type="submit" disabled={submitting}>{submitting ? 'Saving…' : 'Create project'}</Button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 skeleton" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          standalone
          title="No projects"
          description={search || statusFilter !== 'ALL' ? 'Try clearing filters.' : 'Create a project to start tracking.'}
          action={<Button onClick={openForm}>+ New project</Button>}
        />
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="data-table">
            <thead>
              <tr className="bg-gray-50/80">
                <th>Project</th>
                <th>Type</th>
                <th>Status</th>
                <th>Schedule</th>
                <th>Tracking</th>
                <th className="num">Budget (USD)</th>
                <th className="whitespace-nowrap">Due date</th>
                <th>Schedule</th>
                <th aria-label="Documents" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <ProjectListRow key={p.id} project={p} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppPageLayout>
  );
}
