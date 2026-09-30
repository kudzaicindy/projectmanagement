import { PortfolioRowStatus, TaskStatus } from '@prisma/client';

const DAY_MS = 86400000;

const DEFAULT_PHASE_NAMES = [
  'Planning & approvals',
  'Design & procurement',
  'Construction / delivery',
  'Commissioning & handover',
];

export type PhaseSeed = {
  name: string;
  sortOrder: number;
  percentComplete: number | null;
  status: PortfolioRowStatus | null;
};

export function portfolioSiteIdFromProjectId(projectId: string): string | null {
  const prefix = 'alamait-proj-';
  if (projectId.startsWith(prefix)) return projectId.slice(prefix.length);
  return null;
}

export function mapPhaseToTaskStatus(
  status: PortfolioRowStatus | null,
  percentComplete: number | null,
): { status: TaskStatus; progress: number } {
  const pct = percentComplete ?? 0;
  if (status === 'COMPLETED' || pct >= 100) {
    return { status: TaskStatus.COMPLETED, progress: 100 };
  }
  if (status === 'ONGOING' || pct > 0) {
    return { status: TaskStatus.IN_PROGRESS, progress: Math.min(99, Math.max(1, pct)) };
  }
  return { status: TaskStatus.NOT_STARTED, progress: 0 };
}

export function defaultProjectWindow(): { start: Date; end: Date } {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setMonth(end.getMonth() + 12);
  return { start, end };
}

export function resolveProjectWindow(
  startDate: Date | null,
  endDate: Date | null,
  phaseCount: number,
): { start: Date; end: Date } {
  if (startDate && endDate && endDate >= startDate) {
    return { start: startDate, end: endDate };
  }
  if (startDate && !endDate) {
    const end = new Date(startDate);
    end.setMonth(end.getMonth() + Math.max(3, phaseCount * 2));
    return { start: startDate, end };
  }
  if (!startDate && endDate) {
    const start = new Date(endDate);
    start.setMonth(start.getMonth() - Math.max(3, phaseCount * 2));
    return { start, end: endDate };
  }
  return defaultProjectWindow();
}

/** Split [start, end] into contiguous date ranges (inclusive end per chunk). */
export function splitTimeline(start: Date, end: Date, count: number): { start: Date; end: Date }[] {
  if (count <= 0) return [];
  const startMs = start.getTime();
  const endMs = end.getTime();
  const span = Math.max(DAY_MS, endMs - startMs);
  const chunk = span / count;
  const ranges: { start: Date; end: Date }[] = [];
  for (let i = 0; i < count; i++) {
    const chunkStart = new Date(startMs + chunk * i);
    const chunkEnd =
      i === count - 1 ? new Date(endMs) : new Date(startMs + chunk * (i + 1) - DAY_MS);
    if (chunkEnd < chunkStart) {
      ranges.push({ start: chunkStart, end: chunkStart });
    } else {
      ranges.push({ start: chunkStart, end: chunkEnd });
    }
  }
  return ranges;
}

export function seedsForProject(phases: PhaseSeed[]): PhaseSeed[] {
  if (phases.length > 0) {
    return [...phases].sort((a, b) => a.sortOrder - b.sortOrder);
  }
  return DEFAULT_PHASE_NAMES.map((name, i) => ({
    name,
    sortOrder: i,
    percentComplete: null,
    status: null,
  }));
}
