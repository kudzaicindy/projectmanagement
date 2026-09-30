/** Portfolio health types & helpers — data loaded from PostgreSQL via /api/portfolio/health. */

export type PhaseStatus = 'completed' | 'ongoing' | 'not_started';

export type PortfolioPhase = {
  id: string;
  name: string;
  percentComplete: number;
  status: PhaseStatus;
  budgetCapex?: number;
  actualSpend?: number;
  estToComplete?: number;
  forecastTotal?: number;
  /** Budget minus forecast; negative = over budget */
  variance?: number;
  cashFlowNeed30d?: number;
  notes?: string;
};

export type PortfolioProjectHealth = {
  id: string;
  name: string;
  summary?: PortfolioPhase;
  phases: PortfolioPhase[];
};

export type PortfolioOverviewTotals = {
  budgetCapex: number;
  actualSpend: number;
  estToComplete: number;
  forecastTotal: number;
  variance: number;
  cashFlowNeed30d: number;
};

export type HealthFilter = 'all' | 'at_risk' | 'ongoing' | 'completed';

export type PortfolioHealthTotals = {
  projectCount: number;
  phaseCount: number;
  totalBudget: number;
  totalVariance: number;
  cashNeed30d: number;
  atRiskCount: number;
};

export function formatVariance(value?: number): string {
  if (value == null || value === 0) return value === 0 ? '$0' : '—';
  const abs = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Math.abs(value));
  return value < 0 ? `(${abs})` : abs;
}

export function phaseHasFinancials(p: PortfolioPhase): boolean {
  return p.budgetCapex != null && p.budgetCapex > 0;
}

export function isAtRisk(phase: PortfolioPhase): boolean {
  if (phase.variance != null && phase.variance < 0) return true;
  if (phase.percentComplete > 100) return true;
  return false;
}

export function healthLabel(project: PortfolioProjectHealth): 'healthy' | 'watch' | 'at_risk' {
  const rows = project.summary ? [project.summary, ...project.phases] : project.phases;
  const risks = rows.filter(isAtRisk).length;
  const withVariance = rows.filter((r) => r.variance != null && r.variance < -500).length;
  if (withVariance > 0 || (project.summary && isAtRisk(project.summary))) return 'at_risk';
  if (risks > 0) return 'watch';
  const ongoing = rows.some((r) => r.status === 'ongoing');
  if (ongoing) return 'watch';
  return 'healthy';
}

export function getPortfolioHealthTotals(projects: PortfolioProjectHealth[]): PortfolioHealthTotals {
  let totalBudget = 0;
  let totalVariance = 0;
  let cashNeed30d = 0;
  let phaseCount = 0;
  let atRiskCount = 0;

  for (const proj of projects) {
    if (healthLabel(proj) === 'at_risk') atRiskCount += 1;
    const seen = new Set<string>();
    const add = (p: PortfolioPhase) => {
      if (seen.has(p.id)) return;
      seen.add(p.id);
      phaseCount += 1;
      if (p.budgetCapex) totalBudget += p.budgetCapex;
      if (p.variance) totalVariance += p.variance;
      if (p.cashFlowNeed30d) cashNeed30d += p.cashFlowNeed30d;
    };
    if (proj.summary) add(proj.summary);
    for (const ph of proj.phases) add(ph);
  }

  return {
    projectCount: projects.length,
    phaseCount,
    totalBudget,
    totalVariance,
    cashNeed30d,
    atRiskCount,
  };
}

export type ProjectMetrics = {
  budget: number;
  actual: number;
  forecast: number;
  variance: number;
  progress: number;
  cash30d: number;
};

export function getProjectMetrics(project: PortfolioProjectHealth): ProjectMetrics {
  if (project.summary?.budgetCapex != null) {
    const s = project.summary;
    return {
      budget: s.budgetCapex ?? 0,
      actual: s.actualSpend ?? 0,
      forecast: s.forecastTotal ?? s.budgetCapex ?? 0,
      variance: s.variance ?? 0,
      progress: s.percentComplete,
      cash30d: s.cashFlowNeed30d ?? 0,
    };
  }
  let budget = 0;
  let actual = 0;
  let forecast = 0;
  let variance = 0;
  let cash30d = 0;
  let progressSum = 0;
  let progressN = 0;
  for (const ph of project.phases) {
    if (ph.budgetCapex) budget += ph.budgetCapex;
    if (ph.actualSpend) actual += ph.actualSpend;
    if (ph.forecastTotal) forecast += ph.forecastTotal;
    else if (ph.budgetCapex) forecast += ph.budgetCapex;
    if (ph.variance) variance += ph.variance;
    if (ph.cashFlowNeed30d) cash30d += ph.cashFlowNeed30d;
    progressSum += ph.percentComplete;
    progressN += 1;
  }
  return {
    budget,
    actual,
    forecast: forecast || budget,
    variance,
    progress: progressN ? Math.round(progressSum / progressN) : 0,
    cash30d,
  };
}

export function getHealthDistribution(projects: PortfolioProjectHealth[]) {
  const counts = { healthy: 0, watch: 0, at_risk: 0 };
  for (const p of projects) counts[healthLabel(p)] += 1;
  return counts;
}

export function filterPortfolioHealth(
  projects: PortfolioProjectHealth[],
  filter: HealthFilter,
  query: string,
): PortfolioProjectHealth[] {
  const q = query.trim().toLowerCase();
  return projects.filter((proj) => {
    const label = healthLabel(proj);
    if (filter === 'at_risk' && label !== 'at_risk') return false;
    if (filter === 'ongoing') {
      const rows = proj.summary ? [proj.summary, ...proj.phases] : proj.phases;
      if (!rows.some((r) => r.status === 'ongoing')) return false;
    }
    if (filter === 'completed') {
      const rows = proj.phases.length ? proj.phases : proj.summary ? [proj.summary] : [];
      if (!rows.every((r) => r.status === 'completed')) return false;
    }
    if (q) {
      const hay = [proj.name, ...proj.phases.map((p) => p.name), proj.summary?.notes ?? '']
        .join(' ')
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}
