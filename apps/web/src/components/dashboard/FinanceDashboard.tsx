import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart } from '../charts/BarChart';
import { DonutChart } from '../charts/DonutChart';
import { ApprovalInbox } from '../finance/ApprovalInbox';
import { KpiRow } from '../synchro/KpiRow';
import { MeetingsPanel } from '../synchro/MeetingsPanel';
import { QuickActions } from '../synchro/QuickActions';
import { usersApi } from '../../lib/api';
import {
  buildApprovals,
  type ApprovalItem,
  type ApprovalStage,
  type InboxTab,
} from '../../lib/approvals';
import { budgetByType, getProjectBudgetLine } from '../../lib/budgets';
import { downloadAccountingExportCsv, downloadBudgetLedgerCsv } from '../../lib/export';
import {
  formatUsd,
  projectStatusLabels,
  projectTypeLabels,
  statusColor,
} from '../../lib/format';
import type { AuditLog, Project, User } from '../../lib/types';

export function FinanceDashboard({
  userName,
  projects,
  audit,
  loading,
  totalBudget,
}: {
  userName: string;
  projects: Project[];
  audit: AuditLog[];
  loading: boolean;
  totalBudget: number;
}) {
  const [team, setTeam] = useState<User[]>([]);
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [inboxTab, setInboxTab] = useState<InboxTab>('mine');

  useEffect(() => {
    usersApi.list().catch(() => []).then(setTeam);
  }, []);

  useEffect(() => {
    if (!loading) setApprovals(buildApprovals(projects));
  }, [projects, loading]);

  const committed = totalBudget * 0.72;
  const available = totalBudget * 0.28;
  const pendingMine = approvals.filter((a) => a.stage === 'Awaiting Finance').length;

  const kpis = [
    { label: 'Portfolio budget', value: loading ? '—' : formatUsd(totalBudget), sub: 'All projects · USD' },
    { label: 'Committed', value: loading ? '—' : formatUsd(committed), sub: '72% allocated' },
    { label: 'Available cash', value: loading ? '—' : formatUsd(available), sub: 'Uncommitted reserve' },
    { label: 'Awaiting you', value: loading ? '—' : pendingMine, sub: 'Finance approvals' },
  ];

  const cashFlowMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((m, i) => ({
    label: m,
    value: Math.round((totalBudget / 6) * (0.55 + Math.sin(i * 0.9) * 0.25)),
    color: i % 2 === 0 ? '#059669' : '#10b981',
  }));

  function handleApprove(id: string) {
    setApprovals((prev) =>
      prev.map((a) => (a.id === id ? { ...a, stage: 'Awaiting CEO' as ApprovalStage } : a)),
    );
  }

  function handleReject(id: string) {
    setApprovals((prev) =>
      prev.map((a) => (a.id === id ? { ...a, stage: 'Rejected' as ApprovalStage } : a)),
    );
  }

  const budgetRows = projects
    .filter((p) => p.budgetUsd)
    .sort((a, b) => parseFloat(b.budgetUsd ?? '0') - parseFloat(a.budgetUsd ?? '0'));

  return (
    <div className="page-shell">
      <p className="text-[12px] text-gray-400 mb-1">Finance · Alamait</p>
      <div className="flex flex-col xl:flex-row gap-5">
        <div className="flex-1 min-w-0 space-y-4 animate-fade-up">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Finance Control Centre</h1>
              <p className="text-[13px] text-gray-500 mt-0.5">
                Welcome, {userName.split(' ')[0]} — approvals, cash flow, and portfolio budgets
              </p>
            </div>
            <div className="flex gap-2">
              <button type="button" className="btn-secondary !text-[12px]" onClick={() => downloadBudgetLedgerCsv(projects)}>Export ledger</button>
              <Link to="/budgets" className="btn-primary !text-[12px]">View budgets</Link>
              <Link to="/approvals" className="btn-secondary !text-[12px]">All approvals</Link>
            </div>
          </div>

          <QuickActions role="FINANCE" />
          <KpiRow stats={kpis} />

          {/* Approval pipeline visual */}
          <div className="card p-4">
            <p className="section-label mb-3">Approval pipeline</p>
            <div className="flex items-center gap-2 flex-wrap">
              {[
                { label: 'PM submits', count: approvals.filter((a) => a.stage === 'PM submitted').length, color: 'bg-gray-200' },
                { label: 'Finance review', count: pendingMine, color: 'bg-amber-400' },
                { label: 'CEO sign-off', count: approvals.filter((a) => a.stage === 'Awaiting CEO').length, color: 'bg-blue-400' },
                { label: 'Released', count: approvals.filter((a) => a.stage === 'Approved').length, color: 'bg-emerald-400' },
              ].map((step, i) => (
                <div key={step.label} className="flex items-center gap-2">
                  {i > 0 && <span className="text-gray-300">→</span>}
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 border border-gray-100">
                    <span className={`w-2 h-2 rounded-full ${step.color}`} />
                    <span className="text-[11px] font-semibold text-gray-700">{step.label}</span>
                    <span className="text-[11px] font-bold text-gray-900 bg-white px-1.5 py-0.5 rounded-md border border-gray-100">{step.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <ApprovalInbox
            approvals={approvals}
            tab={inboxTab}
            onTabChange={setInboxTab}
            onApprove={handleApprove}
            onReject={handleReject}
            role="FINANCE"
            compact
          />
          <Link to="/approvals" className="text-[12px] font-semibold text-teal-700 hover:underline inline-block">
            Open full approvals page →
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="card p-4">
              <h2 className="section-title mb-1">Cash flow forecast</h2>
              <p className="text-[11px] text-gray-400 mb-3">Monthly outflow projection (USD)</p>
              {loading ? <div className="h-40 skeleton" /> : <BarChart data={cashFlowMonths} formatValue={(n) => formatUsd(n)} />}
            </div>
            <div className="card p-4">
              <h2 className="section-title mb-3">Budget by project type</h2>
              {loading ? (
                <div className="h-40 skeleton" />
              ) : (
                <DonutChart
                  segments={budgetByType(projects).map((t) => ({
                    label: projectTypeLabels[t.type],
                    value: t.amount,
                    color: t.type === 'RENOVATION' ? '#f97316' : t.type === 'DEVELOPMENT' ? '#06b6d4' : '#8b5cf6',
                  }))}
                  formatValue={formatUsd}
                />
              )}
            </div>
          </div>

          {/* Project budgets table */}
          <div className="card overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <h2 className="section-title">Project budgets</h2>
              <Link to="/budgets" className="text-[11px] font-semibold text-teal-700 hover:underline">
                Full budget ledger →
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Project</th>
                    <th>Property</th>
                    <th>Budget</th>
                    <th>Spent (est.)</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {budgetRows.map((p) => {
                    const budget = parseFloat(p.budgetUsd ?? '0');
                    const line = getProjectBudgetLine(p);
                    const spentPct = line.utilizationPct;
                    return (
                      <tr key={p.id}>
                        <td className="font-semibold text-gray-900">{p.name}</td>
                        <td className="text-gray-500">{p.property?.name ?? '—'}</td>
                        <td className="font-mono font-semibold tabular-nums">{formatUsd(budget)}</td>
                        <td>
                          <div className="flex items-center gap-2 min-w-[100px]">
                            <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${spentPct}%` }} />
                            </div>
                            <span className="text-[10px] text-gray-500 tabular-nums">{spentPct}%</span>
                          </div>
                        </td>
                        <td><span className={`pill ${statusColor(p.status)}`}>{projectStatusLabels[p.status]}</span></td>
                        <td>
                          <Link to={`/projects/${p.id}`} className="text-[11px] font-semibold text-teal-700 hover:underline">Open</Link>
                        </td>
                      </tr>
                    );
                  })}
                  {budgetRows.length === 0 && (
                    <tr><td colSpan={6} className="py-8 text-center text-gray-400">No budgets recorded yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="xl:w-[280px] shrink-0 space-y-4 animate-fade-up">
          <MeetingsPanel role="FINANCE" />

          <div className="card p-4">
            <h2 className="section-title mb-3">Audit trail</h2>
            {audit.length === 0 ? (
              <p className="text-[12px] text-gray-400 py-2">No recent activity.</p>
            ) : (
              <ul className="space-y-3 max-h-48 overflow-y-auto">
                {audit.slice(0, 8).map((log) => (
                  <li key={log.id} className="text-[12px]">
                    <p className="font-semibold text-gray-800">{log.action} · {log.entityType}</p>
                    <p className="text-[11px] text-gray-400">{log.user?.name} · {new Date(log.createdAt).toLocaleString()}</p>
                  </li>
                ))}
              </ul>
            )}
            <Link to="/audit" className="mt-3 block text-[11px] font-semibold text-teal-700 hover:underline">View full audit →</Link>
            <button
              type="button"
              className="mt-3 w-full btn-secondary !text-[11px] !py-2"
              onClick={() => downloadAccountingExportCsv(projects, audit)}
            >
              Export for accounting
            </button>
          </div>

          {team.length > 0 && (
            <div className="card p-4">
              <h2 className="section-title mb-2">Escalation contacts</h2>
              <ul className="space-y-2">
                {team.filter((m) => m.role === 'CEO' || m.role === 'PM').slice(0, 3).map((m) => (
                  <li key={m.id} className="flex items-center gap-2 text-[12px]">
                    <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600">
                      {m.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{m.name}</p>
                      <p className="text-[10px] text-gray-400">{m.role}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
