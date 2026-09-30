import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppPageLayout } from '../components/layout/AppPageLayout';
import { IconDocument } from '../components/icons';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { MetricCard } from '../components/ui/MetricCard';
import { documentsApi, projectsApi } from '../lib/api';
import { useAuth } from '../lib/auth';
import { downloadDocumentsCsv } from '../lib/export';
import type { Document, DocumentCategory, Project } from '../lib/types';

type DocRow = Document & { project: Project };

const categories: DocumentCategory[] = ['PLAN', 'PERMIT', 'CONTRACT', 'REPORT', 'OTHER'];

export function DocumentsPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<DocRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<DocumentCategory | 'ALL'>('ALL');

  useEffect(() => {
    setLoading(true);
    projectsApi
      .list()
      .then(async (projects) => {
        const withDocs = projects.filter((p) => (p._count?.documents ?? 0) > 0);
        const lists = await Promise.all(
          withDocs.map(async (project) => {
            const docs = await documentsApi.listByProject(project.id);
            return docs.map((doc) => ({ ...doc, project }));
          }),
        );
        setRows(lists.flat().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list = rows;
    if (categoryFilter !== 'ALL') list = list.filter((d) => d.category === categoryFilter);
    const q = search.toLowerCase().trim();
    if (!q) return list;
    return list.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.project.name.toLowerCase().includes(q) ||
        d.project.property?.name?.toLowerCase().includes(q),
    );
  }, [rows, search, categoryFilter]);

  const byCategory = useMemo(() => {
    const map = new Map<DocumentCategory, number>();
    for (const c of categories) map.set(c, 0);
    for (const d of rows) map.set(d.category, (map.get(d.category) ?? 0) + 1);
    return map;
  }, [rows]);

  function handleExport() {
    downloadDocumentsCsv(
      rows.map((d) => ({
        name: d.name,
        category: d.category,
        projectName: d.project.name,
        propertyName: d.project.property?.name ?? '',
        uploadedBy: d.uploadedBy?.name ?? '',
        createdAt: d.createdAt,
      })),
    );
  }

  async function handleDownload(doc: DocRow) {
    const token = localStorage.getItem('estatepm_token');
    const res = await fetch(documentsApi.downloadUrl(doc.id), {
      headers: { Authorization: `Bearer ${token}` },
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = doc.name;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <AppPageLayout
      eyebrow={`${user?.role === 'FINANCE' ? 'Finance' : 'Operations'} · Alamait`}
      title="Documents"
      subtitle="Plans, permits, contracts, and reports across all projects."
      quickActionsRole={user?.role}
      actions={
        <>
          <Button variant="secondary" className="!text-[12px]" onClick={handleExport} disabled={rows.length === 0}>
            Export CSV
          </Button>
          <Link to="/projects" className="btn-primary !text-[12px]">Browse projects</Link>
        </>
      }
      sidebar={
        <>
          <div className="card p-4">
            <h2 className="section-title mb-3">By category</h2>
            <ul className="space-y-2">
              {categories.map((cat) => (
                <li key={cat} className="flex items-center justify-between text-[12px]">
                  <span className="text-gray-500">{cat}</span>
                  <span className="font-bold text-gray-900 tabular-nums">{byCategory.get(cat) ?? 0}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="card p-4">
            <h2 className="section-title mb-2">Upload documents</h2>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Open a project and use the Documents tab to upload files per site.
            </p>
            <Link to="/projects" className="mt-3 block btn-secondary !text-[11px] !py-2 text-center">
              Go to projects →
            </Link>
          </div>
        </>
      }
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard label="Total files" value={loading ? '—' : rows.length} />
        <MetricCard label="Projects" value={loading ? '—' : new Set(rows.map((r) => r.project.id)).size} />
        <MetricCard label="Plans" value={loading ? '—' : byCategory.get('PLAN') ?? 0} />
        <MetricCard label="Contracts" value={loading ? '—' : byCategory.get('CONTRACT') ?? 0} />
      </div>

      <div className="card p-3 flex flex-col sm:flex-row gap-3">
        <input
          type="search"
          placeholder="Search documents, projects, properties…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field flex-1"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as DocumentCategory | 'ALL')}
          className="select-field sm:w-40"
        >
          <option value="ALL">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-16 skeleton" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          standalone
          icon={<IconDocument className="w-7 h-7" />}
          title={search || categoryFilter !== 'ALL' ? 'No matching documents' : 'No documents yet'}
          description="Upload plans, permits, or contracts from a project's Documents tab."
          action={<Link to="/projects" className="btn-primary">Open projects</Link>}
        />
      ) : (
        <div className="card overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>Document</th>
                <th>Category</th>
                <th>Project</th>
                <th>Property</th>
                <th>Uploaded</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((doc) => (
                <tr key={doc.id}>
                  <td className="font-semibold text-gray-900">{doc.name}</td>
                  <td><span className="pill bg-gray-100 text-gray-600">{doc.category}</span></td>
                  <td>
                    <Link to={`/projects/${doc.project.id}?tab=documents`} className="text-teal-700 hover:underline text-[12px] font-medium">
                      {doc.project.name}
                    </Link>
                  </td>
                  <td className="text-gray-500">{doc.project.property?.name ?? '—'}</td>
                  <td className="text-[12px] text-gray-500">
                    {doc.uploadedBy?.name} · {new Date(doc.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => handleDownload(doc)}
                      className="text-[11px] font-semibold text-teal-700 hover:underline"
                    >
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppPageLayout>
  );
}
