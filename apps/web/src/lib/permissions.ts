import type { User } from './types';

/** Roles allowed to create/update/delete Gantt schedule tasks */
export function canEditSchedule(user: User | null | undefined): boolean {
  return !!user && ['QA', 'PM', 'ADMIN', 'CEO'].includes(user.role);
}
