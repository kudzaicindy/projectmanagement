import { projectProgress } from './format';
import type { Project, ProjectType } from './types';

export type ProjectBudgetLine = {
  projectId: string;
  approved: number;
  committed: number;
  spent: number;
  remaining: number;
  utilizationPct: number;
  timelinePct: number;
  overBudget: boolean;
};

function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/** Derive finance figures from approved budget until Phase 5 ledger is built. */
export function getProjectBudgetLine(project: Project): ProjectBudgetLine {
  const approved = parseFloat(project.budgetUsd ?? '0');
  const h = hashId(project.id);
  const timelinePct = projectProgress(project.startDate, project.endDate);

  // Committed = POs & approved releases (55–84% of approved)
  const committedPct = 0.55 + (h % 30) / 100;
  const committed = Math.round(approved * committedPct);

  // Spent tracks timeline with slight variance per project
  const spentVariance = ((h % 11) - 5) / 100;
  const spentPct = Math.min(0.95, Math.max(0.05, timelinePct / 100 + spentVariance));
  const spent = Math.round(approved * spentPct);

  const remaining = Math.max(0, approved - spent);
  const utilizationPct = approved > 0 ? Math.round((spent / approved) * 100) : 0;

  return {
    projectId: project.id,
    approved,
    committed,
    spent,
    remaining,
    utilizationPct,
    timelinePct,
    overBudget: utilizationPct > timelinePct + 15,
  };
}

export type PortfolioBudgetSummary = {
  approved: number;
  committed: number;
  spent: number;
  remaining: number;
  available: number;
};

export function getPortfolioBudgetSummary(projects: Project[]): PortfolioBudgetSummary {
  const lines = projects.filter((p) => p.budgetUsd).map(getProjectBudgetLine);
  const approved = lines.reduce((s, l) => s + l.approved, 0);
  const committed = lines.reduce((s, l) => s + l.committed, 0);
  const spent = lines.reduce((s, l) => s + l.spent, 0);
  return {
    approved,
    committed,
    spent,
    remaining: approved - spent,
    available: approved - committed,
  };
}

export function budgetByType(projects: Project[]): { type: ProjectType; amount: number }[] {
  const types: ProjectType[] = ['RENOVATION', 'DEVELOPMENT', 'MANAGED'];
  return types.map((type) => ({
    type,
    amount: projects
      .filter((p) => p.type === type)
      .reduce((s, p) => s + parseFloat(p.budgetUsd ?? '0'), 0),
  }));
}

export const costCategories = [
  { label: 'Construction & labor', pct: 0.42, color: '#111827' },
  { label: 'Materials', pct: 0.28, color: '#059669' },
  { label: 'Professional fees', pct: 0.12, color: '#7c3aed' },
  { label: 'Permits & compliance', pct: 0.08, color: '#f97316' },
  { label: 'Contingency', pct: 0.10, color: '#64748b' },
] as const;

export function categoryBreakdown(totalApproved: number) {
  return costCategories.map((c) => ({
    ...c,
    amount: Math.round(totalApproved * c.pct),
  }));
}
