import { useEffect, useState, type FormEvent } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Card } from '../components/Card';
import { GanttWorkspace } from '../components/gantt/GanttWorkspace';
import { GenerateGanttButton } from '../components/gantt/GenerateGanttButton';
import {
  IconArrowLeft,
  IconBuilding,
  IconCalendar,
  IconDocument,
  IconDollar,
  IconUpload,
} from '../components/icons';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { FormField } from '../components/ui/FormField';
import { MetricCard } from '../components/ui/MetricCard';
import { documentsApi, projectsApi } from '../lib/api';
import { useAuth } from '../lib/auth';
import { canEditSchedule } from '../lib/permissions';
import {
  formatDate,
  formatUsd,
  projectProgress,
  projectStatusLabels,
  projectTypeLabels,
  roleLabels,
  statusColor,
  typeColor,
} from '../lib/format';
import type { Document, DocumentCategory, Project } from '../lib/types';

const docCategories: DocumentCategory[] = ['PLAN', 'PERMIT', 'CONTRACT', 'REPORT', 'OTHER'];

const docCategoryLabels: Record<DocumentCategory, string> = {
  PLAN: 'Plan',
  PERMIT: 'Permit',
  CONTRACT: 'Contract',
  REPORT: 'Report',
  OTHER: 'Other',
};

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const initialTab = searchParams.get('tab');
  const [tab, setTab] = useState<'schedule' | 'documents' | 'overview'>(
    initialTab === 'documents' || initialTab === 'schedule' ? initialTab : 'overview',
  );

  const canUpload = user && ['PM', 'QA', 'ADMIN', 'CEO', 'FINANCE'].includes(user.role);
  const canEditGantt = canEditSchedule(user);

  function load() {
    if (!id) return;
    projectsApi.get(id).then(setProject).catch(console.error);
  }

  useEffect(() => { load(); }, [id]);

  async function handleUpload(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!id) return;
    const form = new FormData(e.currentTarget);
    const file = form.get('file') as File;
    if (!file?.size) return;
    await uploadFile(file, (form.get('name') as string) || file.name, (form.get('category') as string) || 'OTHER');
    (e.target as HTMLFormElement).reset();
  }

  async function uploadFile(file: File, name: string, category: string) {
    if (!id) return;
    setUploading(true);
    try {
      await documentsApi.upload(id, file, name, category);
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  if (!project) {
    return (
      <div className="page-shell">
        <div className="h-40 skeleton mb-6" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-24 skeleton" />)}
        </div>
        <div className="h-72 skeleton" />
      </div>
    );
  }

  const documents = project.documents ?? [];
  const progress = projectProgress(project.startDate, project.endDate);
  const taskCount = project._count?.tasks ?? project.tasks?.length ?? 0;

  const stats = [
    { label: 'Budget (USD)', value: formatUsd(project.budgetUsd), icon: <IconDollar className="w-5 h-5" /> },
    { label: 'Timeline', value: `${progress}%`, icon: <IconCalendar className="w-5 h-5" /> },
    { label: 'Schedule tasks', value: String(taskCount), icon: <IconCalendar className="w-5 h-5" /> },
    { label: 'Documents', value: String(documents.length), icon: <IconDocument className="w-5 h-5" /> },
  ];

  return (
    <div className="page-shell pb-10">
      {/* Breadcrumb + header */}
      <div className="animate-fade-up">
        <Link
          to="/projects"
          className="inline-flex items-center gap-1.5 text-[13px] text-gray-400 hover:text-gray-700 font-medium transition-colors mb-4"
        >
          <IconArrowLeft className="w-4 h-4" />
          Back to projects
        </Link>

        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap gap-2 mb-3">
              <span className={`pill ${typeColor(project.type)}`}>{projectTypeLabels[project.type]}</span>
              <span className={`pill ${statusColor(project.status)}`}>{projectStatusLabels[project.status]}</span>
            </div>
            <h1 className="text-2xl lg:text-[28px] font-bold text-gray-900 tracking-tight">{project.name}</h1>
            {project.description && (
              <p className="text-[14px] text-slate-500 mt-2 max-w-2xl leading-relaxed">{project.description}</p>
            )}
            <div className="flex flex-wrap items-center gap-4 mt-4 text-[13px] text-slate-500">
              <span className="flex items-center gap-1.5">
                <IconCalendar className="w-4 h-4 text-slate-400" />
                {formatDate(project.startDate)} — {formatDate(project.endDate)}
              </span>
              {project.property && (
                <span className="flex items-center gap-1.5">
                  <IconBuilding className="w-4 h-4 text-slate-400" />
                  {project.property.name}
                </span>
              )}
            </div>
          </div>

          <div className="card p-5 min-w-[220px] shrink-0 border-l-4 border-l-alamait-gold space-y-4">
            <div>
              <p className="metric-card-label">Timeline progress</p>
              <p className="text-4xl font-bold text-gray-900 tabular-nums mt-1">{progress}%</p>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mt-4">
                <div
                  className="h-full bg-alamait-gold rounded-full transition-all duration-700"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <GenerateGanttButton
              projectId={project.id}
              projectName={project.name}
              variant="primary"
              label="Generate Gantt chart"
              className="w-full justify-center"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6 pb-6 border-b border-gray-200/80 animate-fade-up animate-fade-up-delay-1">
        {stats.map((s) => (
          <MetricCard key={s.label} label={s.label} value={s.value} icon={s.icon} />
        ))}
      </div>

      {/* Tabs */}
      <div className="mt-6 animate-fade-up animate-fade-up-delay-2">
        <div className="tab-group">
          {(['overview', 'schedule', 'documents'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`tab-item capitalize ${tab === t ? 'tab-item-active' : 'tab-item-inactive'}`}
            >
              {t === 'schedule' ? 'Gantt schedule' : t}
            </button>
          ))}
        </div>
      </div>

      {/* Overview tab */}
      {tab === 'overview' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mt-6 animate-fade-up">
          <div className="xl:col-span-2 space-y-5">
            <Card title="Project tracking">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Created by', value: project.createdBy?.name ?? '—', sub: project.createdBy?.role ? roleLabels[project.createdBy.role] : undefined },
                  { label: 'Project manager', value: project.manager?.name ?? 'Unassigned', sub: project.manager?.email },
                  { label: 'Property', value: project.property?.name ?? '—', sub: project.property?.address },
                  { label: 'Status', value: projectStatusLabels[project.status], sub: projectTypeLabels[project.type] },
                ].map((item) => (
                  <div key={item.label} className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{item.label}</p>
                    <p className="text-[14px] font-semibold text-gray-900 mt-1">{item.value}</p>
                    {item.sub && <p className="text-[12px] text-gray-400 mt-0.5 truncate">{item.sub}</p>}
                  </div>
                ))}
              </div>
            </Card>

            <Card title="Schedule preview">
              <GanttWorkspace
                projects={[project]}
                initialProjectId={project.id}
                canEdit={canEditGantt}
                compact
              />
            </Card>
          </div>

          <div className="space-y-5">
            <Card title="Quick links">
              <div className="space-y-2">
                <button type="button" onClick={() => setTab('schedule')} className="w-full text-left px-4 py-3 rounded-xl bg-gray-900/5 text-gray-900 text-[13px] font-semibold hover:bg-gray-900/10 transition-colors">
                  Open full Gantt schedule →
                </button>
                <button type="button" onClick={() => setTab('documents')} className="w-full text-left px-4 py-3 rounded-lg bg-slate-50 text-slate-700 text-[13px] font-semibold hover:bg-slate-100 transition-colors">
                  View documents ({documents.length}) →
                </button>
                <div className="px-4 py-3 rounded-lg bg-slate-50">
                  <GenerateGanttButton
                    projectId={project.id}
                    projectName={project.name}
                    variant="link"
                    label="Generate / open Gantt chart →"
                    className="!text-slate-700"
                  />
                </div>
              </div>
            </Card>

            <Card title="Activity summary" variant="flat">
              <dl className="space-y-3">
                {[
                  ['Schedule tasks', taskCount],
                  ['Documents uploaded', documents.length],
                  ['Budget (USD)', formatUsd(project.budgetUsd)],
                  ['Timeline', `${progress}% elapsed`],
                ].map(([label, value]) => (
                  <div key={label as string} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <dt className="text-[13px] text-gray-500">{label}</dt>
                    <dd className="text-[13px] font-bold text-gray-900">{value}</dd>
                  </div>
                ))}
              </dl>
            </Card>
          </div>
        </div>
      )}

      {/* Schedule tab */}
      {tab === 'schedule' && (
        <div className="mt-6 animate-fade-up">
          <GanttWorkspace
            projects={[project]}
            initialProjectId={project.id}
            canEdit={canEditGantt}
          />
        </div>
      )}

      {/* Documents tab */}
      {tab === 'documents' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mt-6 animate-fade-up">
          <div className="xl:col-span-2">
            <Card title="Documents & files">
              {canUpload && (
                <div
                  className={`mb-6 p-6 rounded-2xl border-2 border-dashed transition-all duration-200 ${
                    dragOver
                      ? 'border-teal-400 bg-teal-50/50'
                      : 'border-gray-200 bg-gray-50/50 hover:border-gray-300'
                  }`}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    const file = e.dataTransfer.files[0];
                    if (file) uploadFile(file, file.name, 'OTHER');
                  }}
                >
                  <form onSubmit={handleUpload} className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-white shadow-sm border border-gray-100">
                        <IconUpload className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Upload document</p>
                        <p className="text-[12px] text-gray-400">Drag & drop or browse — plans, permits, contracts</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <FormField label="Name">
                        <input name="name" placeholder="Document name" className="input-field" />
                      </FormField>
                      <FormField label="Category">
                        <select name="category" className="select-field">
                          {docCategories.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </FormField>
                      <FormField label="File">
                        <input
                          name="file"
                          type="file"
                          required
                          className="input-field file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-gray-900 file:text-white file:text-xs file:font-semibold"
                        />
                      </FormField>
                    </div>
                    <Button type="submit" disabled={uploading} icon={
                      uploading ? (
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <IconUpload className="w-4 h-4" />
                      )
                    }>
                      {uploading ? 'Uploading…' : 'Upload file'}
                    </Button>
                  </form>
                </div>
              )}

              {documents.length === 0 ? (
                <EmptyState
                  icon={<IconDocument className="w-7 h-7" />}
                  title="No documents yet"
                  description="Upload plans, permits, or contracts for this project."
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {documents.map((doc: Document) => (
                    <div
                      key={doc.id}
                      className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:border-gray-200 hover:shadow-sm transition-all group"
                    >
                      <div className="w-11 h-11 rounded-lg bg-alamait-navy/5 border border-gray-100 flex items-center justify-center shrink-0">
                        <IconDocument className="w-5 h-5 text-alamait-navy/60" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-900 truncate">{doc.name}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {doc.category} · {doc.uploadedBy?.name} · {new Date(doc.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        type="button"
                        className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-colors opacity-0 group-hover:opacity-100"
                        onClick={() => {
                          const token = localStorage.getItem('estatepm_token');
                          fetch(documentsApi.downloadUrl(doc.id), {
                            headers: { Authorization: `Bearer ${token}` },
                          })
                            .then((r) => r.blob())
                            .then((blob) => {
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = doc.name;
                              a.click();
                              URL.revokeObjectURL(url);
                            });
                        }}
                      >
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          <Card title="Document summary" variant="flat">
            <dl className="space-y-3">
              {docCategories.map((cat) => {
                const count = documents.filter((d) => d.category === cat).length;
                return (
                  <div key={cat} className="flex items-center justify-between py-2">
                    <dt className="text-[13px] text-slate-500">{docCategoryLabels[cat]}</dt>
                    <dd className="text-[13px] font-bold text-gray-900">{count}</dd>
                  </div>
                );
              })}
            </dl>
          </Card>
        </div>
      )}
    </div>
  );
}
