import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ApprovalInbox } from '../components/finance/ApprovalInbox';
import { AppPageLayout } from '../components/layout/AppPageLayout';
import { KpiRow } from '../components/synchro/KpiRow';
import { MeetingsPanel } from '../components/synchro/MeetingsPanel';
import {
  buildApprovals,
  type ApprovalItem,
  type ApprovalStage,
  type InboxTab,
} from '../lib/approvals';
import { formatUsd } from '../lib/format';
import { useAuth } from '../lib/auth';
import { usePortfolioData } from '../hooks/usePortfolioData';

export function ApprovalsPage() {
  const { user } = useAuth();
  const data = usePortfolioData();
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [tab, setTab] = useState<InboxTab>('mine');

  useEffect(() => {
    if (!data.loading) setApprovals(buildApprovals(data.projects));
  }, [data.projects, data.loading]);

  const pendingFinance = approvals.filter((a) => a.stage === 'Awaiting Finance').length;
  const pendingCeo = approvals.filter((a) => a.stage === 'Awaiting CEO').length;
  const completed = approvals.filter((a) => a.stage === 'Approved' || a.stage === 'Rejected').length;

  const kpis = [
    { label: 'Awaiting Finance', value: data.loading ? '—' : pendingFinance, sub: 'Finance review queue' },
    { label: 'Awaiting CEO', value: data.loading ? '—' : pendingCeo, sub: 'Executive sign-off' },
    { label: 'Completed', value: data.loading ? '—' : completed, sub: 'Approved or rejected' },
    { label: 'Total value', value: data.loading ? '—' : formatUsd(approvals.reduce((s, a) => s + a.amount, 0)), sub: 'In pipeline · USD' },
  ];

  function handleApprove(id: string) {
    setApprovals((prev) =>
      prev.map((a) => {
        if (a.id !== id) return a;
        if (a.stage === 'Awaiting Finance') return { ...a, stage: 'Awaiting CEO' as ApprovalStage };
        if (a.stage === 'Awaiting CEO') return { ...a, stage: 'Approved' as ApprovalStage };
        return a;
      }),
    );
  }

  function handleReject(id: string) {
    setApprovals((prev) =>
      prev.map((a) => (a.id === id ? { ...a, stage: 'Rejected' as ApprovalStage } : a)),
    );
  }

  const role = user?.role ?? 'FINANCE';

  return (
    <AppPageLayout
      eyebrow="Finance · Alamait"
      title="Approvals"
      subtitle="Payment releases and budget revisions — PM submits, Finance reviews, CEO signs off."
      quickActionsRole={role === 'CEO' ? 'CEO' : 'FINANCE'}
      actions={
        <Link to="/budgets" className="btn-secondary !text-[12px]">View budgets</Link>
      }
      sidebar={<MeetingsPanel role={role === 'CEO' ? 'CEO' : 'FINANCE'} />}
    >
      <KpiRow stats={kpis} />

      <div className="card p-4">
        <p className="section-label mb-3">Approval pipeline</p>
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { label: 'PM submits', count: approvals.filter((a) => a.stage === 'PM submitted').length, color: 'bg-gray-300' },
            { label: 'Finance review', count: pendingFinance, color: 'bg-amber-400' },
            { label: 'CEO sign-off', count: pendingCeo, color: 'bg-blue-400' },
            { label: 'Released', count: approvals.filter((a) => a.stage === 'Approved').length, color: 'bg-emerald-400' },
          ].map((step, i) => (
            <div key={step.label} className="flex items-center gap-2">
              {i > 0 && <span className="text-gray-300">→</span>}
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 border border-gray-100">
                <span className={`w-2 h-2 rounded-full ${step.color}`} />
                <span className="text-[11px] font-semibold text-gray-700">{step.label}</span>
                <span className="text-[11px] font-bold bg-white px-1.5 py-0.5 rounded-md border border-gray-100">{step.count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ApprovalInbox
        approvals={approvals}
        tab={tab}
        onTabChange={setTab}
        onApprove={handleApprove}
        onReject={handleReject}
        role={role}
      />
    </AppPageLayout>
  );
}
