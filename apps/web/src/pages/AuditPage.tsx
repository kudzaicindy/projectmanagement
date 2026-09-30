import { useEffect, useMemo, useState } from 'react';
import { AppPageLayout } from '../components/layout/AppPageLayout';
import { Button } from '../components/ui/Button';
import { MetricCard } from '../components/ui/MetricCard';
import { auditApi } from '../lib/api';
import { useAuth } from '../lib/auth';
import { downloadAuditCsv } from '../lib/export';
import type { AuditLog } from '../lib/types';

export function AuditPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    auditApi
      .list()
      .then(setLogs)
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return logs;
    return logs.filter(
      (l) =>
        l.action.toLowerCase().includes(q) ||
        l.entityType.toLowerCase().includes(q) ||
        l.user?.name?.toLowerCase().includes(q),
    );
  }, [logs, search]);

  const uniqueUsers = new Set(logs.map((l) => l.user?.name).filter(Boolean)).size;

  return (
    <AppPageLayout
      eyebrow="Administration · Alamait"
      title="Audit trail"
      subtitle="System activity log — uploads, changes, and approvals across EstatePM."
      quickActionsRole={user?.role === 'CEO' ? 'CEO' : 'ADMIN'}
      actions={
        <Button variant="secondary" className="!text-[12px]" onClick={() => downloadAuditCsv(logs)} disabled={logs.length === 0}>
          Export CSV
        </Button>
      }
    >
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <MetricCard label="Total events" value={loading ? '—' : logs.length} />
        <MetricCard label="Contributors" value={loading ? '—' : uniqueUsers} />
        <MetricCard label="Latest" value={loading ? '—' : logs[0] ? new Date(logs[0].createdAt).toLocaleDateString() : '—'} />
      </div>

      <div className="card p-3">
        <input
          type="search"
          placeholder="Search by user, action, or entity…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field"
        />
      </div>

      <div className="card overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="section-title">Activity log</h2>
        </div>
        {loading ? (
          <div className="p-4 space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-12 skeleton" />)}</div>
        ) : filtered.length === 0 ? (
          <p className="text-center py-12 text-[13px] text-gray-400">No audit events found.</p>
        ) : (
          <ul className="divide-y divide-gray-50 max-h-[600px] overflow-y-auto">
            {filtered.map((log) => (
              <li key={log.id} className="px-4 py-3 flex gap-3 hover:bg-gray-50/80">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600 shrink-0">
                  {log.user?.name?.charAt(0) ?? '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-gray-900">
                    {log.user?.name ?? 'System'} · {log.action}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {log.entityType}{log.entityId ? ` · ${log.entityId.slice(0, 8)}…` : ''} · {new Date(log.createdAt).toLocaleString()}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppPageLayout>
  );
}
