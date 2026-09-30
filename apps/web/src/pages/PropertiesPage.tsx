import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { AppPageLayout } from '../components/layout/AppPageLayout';
import { getPropertyStats, PropertyCard, PropertyListRow } from '../components/portfolio/PropertyCard';
import { IconBuilding } from '../components/icons';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { FormField } from '../components/ui/FormField';
import { MetricCard } from '../components/ui/MetricCard';
import { projectsApi, propertiesApi } from '../lib/api';
import { useAuth } from '../lib/auth';
import { formatUsd } from '../lib/format';
import type { Project, Property } from '../lib/types';

type ViewMode = 'grid' | 'list';

export function PropertiesPage() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [view, setView] = useState<ViewMode>('list');
  const [cityFilter, setCityFilter] = useState<string | null>(null);

  function load() {
    setLoading(true);
    Promise.all([propertiesApi.list().then(setProperties), projectsApi.list().then(setProjects)])
      .catch(console.error)
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setSubmitting(true);
    try {
      await propertiesApi.create({
        name: form.get('name'),
        address: form.get('address'),
        city: form.get('city') || undefined,
        description: form.get('description') || undefined,
      });
      setShowForm(false);
      load();
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed');
    } finally {
      setSubmitting(false);
    }
  }

  const projectsByProperty = useMemo(() => {
    const map = new Map<string, Project[]>();
    for (const p of projects) {
      const list = map.get(p.propertyId) ?? [];
      list.push(p);
      map.set(p.propertyId, list);
    }
    return map;
  }, [projects]);

  const cities = useMemo(
    () => [...new Set(properties.map((p) => p.city).filter(Boolean))] as string[],
    [properties],
  );

  const filtered = useMemo(() => {
    let list = properties;
    if (cityFilter) list = list.filter((p) => p.city === cityFilter);
    const q = search.toLowerCase().trim();
    if (!q) return list;
    return list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.address.toLowerCase().includes(q) ||
        (p.city?.toLowerCase().includes(q) ?? false),
    );
  }, [properties, search, cityFilter]);

  const portfolioStats = useMemo(() => {
    const totalProjects = projects.length;
    const activeProjects = projects.filter((p) => p.status === 'ACTIVE').length;
    const totalBudget = projects.reduce((s, p) => s + parseFloat(p.budgetUsd ?? '0'), 0);
    return { totalProjects, activeProjects, totalBudget };
  }, [projects]);

  return (
    <AppPageLayout
      eyebrow="Alamait · EstatePM"
      title="Portfolio"
      subtitle="Development sites and linked projects — budget and status at a glance."
      quickActionsRole={user?.role}
      actions={
        <>
          <Link to="/projects" className="btn-secondary !text-[12px]">
            All projects
          </Link>
          <Button size="sm" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ Add site'}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard label="Sites" value={loading ? '—' : properties.length} sub="In portfolio" />
        <MetricCard label="Projects" value={loading ? '—' : portfolioStats.totalProjects} sub="Linked to sites" />
        <MetricCard label="Active" value={loading ? '—' : portfolioStats.activeProjects} sub="In delivery" />
        <MetricCard label="Total CapEx" value={loading ? '—' : formatUsd(portfolioStats.totalBudget)} sub="Approved budget" />
      </div>

      <div className="card p-3 flex flex-col lg:flex-row lg:items-center gap-3 flex-wrap">
        <div className="tab-group">
          {(['list', 'grid'] as ViewMode[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={`tab-item ${view === v ? 'tab-item-active' : 'tab-item-inactive'}`}
            >
              {v === 'list' ? 'Table' : 'Cards'}
            </button>
          ))}
        </div>
        <input
          type="search"
          placeholder="Search site, address, city…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field !py-2 !text-[13px] flex-1 min-w-[160px] lg:max-w-sm"
        />
        {cities.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setCityFilter(null)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold ${
                cityFilter === null ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              All cities
            </button>
            {cities.map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => setCityFilter(city === cityFilter ? null : city)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold ${
                  cityFilter === city ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <div className="card p-4 border-l-4 border-l-teal-500">
          <h2 className="section-title mb-1">New site</h2>
          <p className="text-[12px] text-gray-500 mb-4">Add a property before linking projects.</p>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl">
            <FormField label="Name" className="md:col-span-2">
              <input name="name" required className="input-field" placeholder="Site name" />
            </FormField>
            <FormField label="Address" className="md:col-span-2">
              <input name="address" required className="input-field" placeholder="Street address" />
            </FormField>
            <FormField label="City">
              <input name="city" className="input-field" placeholder="City" />
            </FormField>
            <FormField label="Notes" className="md:col-span-2">
              <textarea name="description" rows={2} className="textarea-field" placeholder="Optional" />
            </FormField>
            <div className="md:col-span-2 flex gap-2">
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Saving…' : 'Save site'}
              </Button>
              <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          <div className="h-48 skeleton" />
          <div className="h-48 skeleton hidden md:block" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          standalone
          icon={<IconBuilding className="w-7 h-7" />}
          title={search || cityFilter ? 'No matches' : 'No properties yet'}
          description={
            search || cityFilter
              ? 'Try another search or clear filters.'
              : 'Run npm run db:properties or add a site manually.'
          }
          action={!search && !cityFilter ? <Button onClick={() => setShowForm(true)}>+ Add site</Button> : undefined}
        />
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <PropertyCard
              key={p.id}
              property={p}
              stats={getPropertyStats(projectsByProperty.get(p.id) ?? [])}
            />
          ))}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="section-title">Sites</h2>
              <p className="text-[11px] text-gray-400 mt-0.5">{filtered.length} in portfolio</p>
            </div>
            <Link to="/reports" className="text-[11px] font-semibold text-teal-800 hover:underline">
              Export reports
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Site</th>
                  <th>Address</th>
                  <th className="num">Projects</th>
                  <th className="num">Active</th>
                  <th className="num">Schedule %</th>
                  <th>Status</th>
                  <th className="num">CapEx budget</th>
                  <th>Latest project</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <PropertyListRow
                    key={p.id}
                    property={p}
                    stats={getPropertyStats(projectsByProperty.get(p.id) ?? [])}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AppPageLayout>
  );
}
