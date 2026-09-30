import { Link } from 'react-router-dom';
import {
  filterApprovals,
  stageStyles,
  type ApprovalItem,
  type ApprovalStage,
  type InboxTab,
} from '../../lib/approvals';
import { formatUsd } from '../../lib/format';
import type { UserRole } from '../../lib/types';

export function ApprovalInbox({
  approvals,
  tab,
  onTabChange,
  onApprove,
  onReject,
  role = 'FINANCE',
  compact = false,
}: {
  approvals: ApprovalItem[];
  tab: InboxTab;
  onTabChange: (tab: InboxTab) => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  role?: UserRole;
  compact?: boolean;
}) {
  const pendingMine = filterApprovals(approvals, 'mine', role).length;
  const filtered = filterApprovals(approvals, tab, role);
  const canActFinance = role === 'FINANCE' || role === 'ADMIN';
  const canActCeo = role === 'CEO' || role === 'ADMIN';

  return (
    <div className="card overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="section-title">Approval inbox</h2>
          <p className="text-[11px] text-gray-400 mt-0.5">PM → Finance → CEO · USD releases</p>
        </div>
        <div className="tab-group">
          {([
            ['mine', role === 'CEO' ? 'Awaiting me' : 'Awaiting me'],
            ['all', 'All'],
            ['ceo', 'At CEO'],
            ['done', 'Completed'],
          ] as [InboxTab, string][]).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => onTabChange(key)}
              className={`tab-item !text-[11px] ${tab === key ? 'tab-item-active' : 'tab-item-inactive'}`}
            >
              {label}
              {key === 'mine' && pendingMine > 0 && (
                <span className="ml-1 bg-amber-500 text-white text-[9px] px-1 rounded-full">{pendingMine}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-center py-10 text-[13px] text-gray-400">No items in this queue.</p>
      ) : (
        <ul className={`divide-y divide-gray-50 ${compact ? 'max-h-80 overflow-y-auto' : ''}`}>
          {filtered.map((a) => {
            const awaitingFinance = a.stage === 'Awaiting Finance';
            const awaitingCeo = a.stage === 'Awaiting CEO';
            const highlight = awaitingFinance || awaitingCeo;
            const canApprove =
              (awaitingFinance && canActFinance && onApprove) ||
              (awaitingCeo && canActCeo && onApprove);

            return (
              <li
                key={a.id}
                className={`px-4 py-3 flex flex-col lg:flex-row lg:items-center gap-3 ${
                  highlight ? 'bg-amber-50/40' : 'hover:bg-gray-50/80'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-[13px] font-semibold text-gray-900">{a.title}</p>
                    <span className={`pill ${a.type === 'payment' ? 'bg-violet-100 text-violet-700' : 'bg-cyan-100 text-cyan-700'}`}>
                      {a.type === 'payment' ? 'Payment' : 'Budget rev'}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {a.project} · {new Date(a.submittedAt).toLocaleDateString()}
                  </p>
                </div>
                <p className="text-[15px] font-bold text-gray-900 tabular-nums shrink-0">{formatUsd(a.amount)}</p>
                <span className={`pill shrink-0 ${stageStyles[a.stage as ApprovalStage]}`}>{a.stage}</span>
                {canApprove && (
                  <div className="flex gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => onApprove!(a.id)}
                      className="btn-primary !py-1.5 !px-3 !text-[11px]"
                    >
                      Approve
                    </button>
                    {onReject && (
                      <button
                        type="button"
                        onClick={() => onReject(a.id)}
                        className="btn-secondary !py-1.5 !px-3 !text-[11px]"
                      >
                        Reject
                      </button>
                    )}
                  </div>
                )}
                <Link to={`/projects/${a.projectId}`} className="text-[11px] font-semibold text-teal-700 hover:underline shrink-0">
                  View project →
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
