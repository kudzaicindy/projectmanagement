import { getProjectBudgetLine } from './budgets';
import { projectProgress } from './format';
import type { Project } from './types';

export type ProjectTracking = {
  /** Average task completion (0–100), or timeline % if no tasks */
  schedulePct: number;
  timelinePct: number;
  taskCount: number;
  tasksComplete: number;
  tasksBlocked: number;
  /** Schedule vs timeline delta — negative = behind plan dates */
  scheduleDelta: number;
  trackingLabel: 'On track' | 'Behind' | 'Ahead' | 'No dates';
  trackingTone: 'ok' | 'warn' | 'bad' | 'muted';
  budgetUtilPct: number;
  isOverdue: boolean;
};

export function getProjectTracking(project: Project): ProjectTracking {
  const timelinePct = projectProgress(project.startDate, project.endDate);
  const tasks = project.tasks ?? [];
  const taskCount = tasks.length || project._count?.tasks || 0;

  let schedulePct = timelinePct;
  let tasksComplete = 0;
  let tasksBlocked = 0;

  if (tasks.length > 0) {
    schedulePct = Math.round(tasks.reduce((s, t) => s + t.progress, 0) / tasks.length);
    tasksComplete = tasks.filter((t) => t.status === 'COMPLETED').length;
    tasksBlocked = tasks.filter((t) => t.status === 'BLOCKED').length;
  } else if (taskCount === 0 && !project.startDate) {
    schedulePct = 0;
  }

  const hasDates = Boolean(project.startDate && project.endDate);
  const scheduleDelta = hasDates ? schedulePct - timelinePct : 0;

  let trackingLabel: ProjectTracking['trackingLabel'] = 'No dates';
  let trackingTone: ProjectTracking['trackingTone'] = 'muted';

  if (hasDates) {
    if (scheduleDelta >= -5) {
      trackingLabel = scheduleDelta > 10 ? 'Ahead' : 'On track';
      trackingTone = 'ok';
    } else if (scheduleDelta >= -15) {
      trackingLabel = 'Behind';
      trackingTone = 'warn';
    } else {
      trackingLabel = 'Behind';
      trackingTone = 'bad';
    }
  }

  const end = project.endDate ? new Date(project.endDate).getTime() : null;
  const isOverdue =
    end != null &&
    Date.now() > end &&
    project.status !== 'COMPLETED' &&
    project.status !== 'CANCELLED';

  const budgetLine = getProjectBudgetLine(project);

  return {
    schedulePct,
    timelinePct,
    taskCount: tasks.length || taskCount,
    tasksComplete,
    tasksBlocked,
    scheduleDelta,
    trackingLabel,
    trackingTone,
    budgetUtilPct: budgetLine.utilizationPct,
    isOverdue,
  };
}
