import type { NavigateFunction } from 'react-router-dom';
import { tasksApi } from './api';
import type { Task } from './types';

export async function ensureProjectGantt(projectId: string): Promise<{ tasks: Task[]; generated: boolean }> {
  return tasksApi.generate(projectId);
}

/** Create schedule tasks if needed, then open the Gantt page for this project. */
export async function openProjectGantt(projectId: string, navigate: NavigateFunction) {
  await ensureProjectGantt(projectId);
  navigate(`/gantt?project=${projectId}`);
}
