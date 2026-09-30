import type { ProjectStatus, ProjectType, UserRole } from './types';

const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

export function formatUsd(value?: string | number | null) {
  if (value == null || value === '') return '—';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (Number.isNaN(num)) return '—';
  return usdFormatter.format(num);
}

/** Currency for table cells; null/undefined → em dash, zero → $0. */
export function formatUsdCell(value?: number | null) {
  if (value == null) return '—';
  return usdFormatter.format(value);
}

/** Display whole-number percent; allows values over 100 (e.g. 102%). */
export function formatPercent(value?: number | null) {
  if (value == null || Number.isNaN(value)) return '—';
  return `${Math.round(value)}%`;
}

export function formatDate(value?: string | null) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function projectProgress(startDate?: string | null, endDate?: string | null): number {
  if (!startDate || !endDate) return 0;
  const now = Date.now();
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  if (now < start) return 0;
  if (now > end) return 100;
  return Math.round(((now - start) / (end - start)) * 100);
}

export const projectTypeLabels: Record<ProjectType, string> = {
  MANAGED: 'Managed Property',
  RENOVATION: 'Renovation',
  DEVELOPMENT: 'Development',
};

export const projectStatusLabels: Record<ProjectStatus, string> = {
  DRAFT: 'Draft',
  ACTIVE: 'Active',
  ON_HOLD: 'On Hold',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export const roleLabels: Record<UserRole, string> = {
  PM: 'Property Manager',
  QA: 'QA / QS',
  FINANCE: 'Finance',
  CEO: 'CEO',
  ADMIN: 'Admin',
};

export function statusColor(status: ProjectStatus) {
  switch (status) {
    case 'ACTIVE':
      return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60';
    case 'DRAFT':
      return 'bg-slate-100 text-slate-600 ring-1 ring-slate-200/60';
    case 'ON_HOLD':
      return 'bg-amber-50 text-amber-700 ring-1 ring-amber-200/60';
    case 'COMPLETED':
      return 'bg-blue-50 text-blue-700 ring-1 ring-blue-200/60';
    case 'CANCELLED':
      return 'bg-red-50 text-red-700 ring-1 ring-red-200/60';
  }
}

export function typeColor(type: ProjectType) {
  switch (type) {
    case 'MANAGED':
      return 'bg-violet-50 text-violet-700 ring-1 ring-violet-200/60';
    case 'RENOVATION':
      return 'bg-orange-50 text-orange-700 ring-1 ring-orange-200/60';
    case 'DEVELOPMENT':
      return 'bg-cyan-50 text-cyan-700 ring-1 ring-cyan-200/60';
  }
}

export function roleBadgeColor(role: UserRole) {
  switch (role) {
    case 'PM': return 'bg-blue-100 text-blue-800';
    case 'QA': return 'bg-purple-100 text-purple-800';
    case 'FINANCE': return 'bg-green-100 text-green-800';
    case 'CEO': return 'bg-alamait-gold/20 text-alamait-gold-dark';
    case 'ADMIN': return 'bg-slate-200 text-slate-700';
  }
}

export const propertyGradients = ['property-gradient-1', 'property-gradient-2', 'property-gradient-3'];

export function propertyGradient(index: number) {
  return propertyGradients[index % propertyGradients.length];
}
