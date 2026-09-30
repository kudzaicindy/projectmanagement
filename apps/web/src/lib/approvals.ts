import type { Project } from './types';

export type ApprovalStage = 'PM submitted' | 'Awaiting Finance' | 'Awaiting CEO' | 'Approved' | 'Rejected';

export type ApprovalItem = {
  id: string;
  projectId: string;
  title: string;
  project: string;
  amount: number;
  stage: ApprovalStage;
  type: 'payment' | 'budget';
  submittedAt: string;
};

export function buildApprovals(projects: Project[]): ApprovalItem[] {
  const active = projects.filter((p) => p.status === 'ACTIVE' || p.status === 'ON_HOLD');
  return active.flatMap((p, i) => {
    const budget = parseFloat(p.budgetUsd ?? '0');
    const items: ApprovalItem[] = [];
    if (budget > 0) {
      items.push({
        id: `${p.id}-pay`,
        projectId: p.id,
        title: `Payment release — ${p.name}`,
        project: p.property?.name ?? p.name,
        amount: Math.round(budget * 0.15),
        stage: (['Awaiting Finance', 'PM submitted', 'Awaiting CEO', 'Approved'] as ApprovalStage[])[i % 4],
        type: 'payment',
        submittedAt: new Date(Date.now() - i * 86400000 * 2).toISOString(),
      });
    }
    if (i % 2 === 0 && budget > 0) {
      items.push({
        id: `${p.id}-rev`,
        projectId: p.id,
        title: `Budget revision — ${p.name}`,
        project: p.property?.name ?? p.name,
        amount: Math.round(budget * 0.08),
        stage: i === 0 ? 'Awaiting Finance' : 'PM submitted',
        type: 'budget',
        submittedAt: new Date(Date.now() - i * 86400000).toISOString(),
      });
    }
    return items;
  });
}

export const stageStyles: Record<ApprovalStage, string> = {
  'PM submitted': 'bg-gray-100 text-gray-600',
  'Awaiting Finance': 'bg-amber-100 text-amber-800 ring-1 ring-amber-200',
  'Awaiting CEO': 'bg-blue-100 text-blue-800',
  Approved: 'bg-emerald-100 text-emerald-700',
  Rejected: 'bg-red-100 text-red-700',
};

export type InboxTab = 'all' | 'mine' | 'ceo' | 'done';

export function filterApprovals(approvals: ApprovalItem[], tab: InboxTab, role?: string) {
  switch (tab) {
    case 'mine':
      if (role === 'CEO') return approvals.filter((a) => a.stage === 'Awaiting CEO');
      return approvals.filter((a) => a.stage === 'Awaiting Finance');
    case 'ceo':
      return approvals.filter((a) => a.stage === 'Awaiting CEO');
    case 'done':
      return approvals.filter((a) => a.stage === 'Approved' || a.stage === 'Rejected');
    default:
      return approvals;
  }
}
