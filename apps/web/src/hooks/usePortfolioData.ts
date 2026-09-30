import { useEffect, useState } from 'react';
import { auditApi, projectsApi, propertiesApi } from '../lib/api';
import { useAuth } from '../lib/auth';
import type { AuditLog, Project, Property } from '../lib/types';

export function usePortfolioData() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [audit, setAudit] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      projectsApi.list().then(setProjects),
      propertiesApi.list().then(setProperties),
      user && ['CEO', 'FINANCE', 'ADMIN'].includes(user.role)
        ? auditApi.list().then(setAudit)
        : Promise.resolve([]),
    ])
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const totalBudget = projects.reduce(
    (sum, p) => sum + (p.budgetUsd ? parseFloat(p.budgetUsd) : 0),
    0,
  );

  const byStatus = (status: Project['status']) => projects.filter((p) => p.status === status);
  const byType = (type: Project['type']) => projects.filter((p) => p.type === type);

  const overdue = projects.filter((p) => {
    if (!p.endDate || p.status === 'COMPLETED' || p.status === 'CANCELLED') return false;
    return new Date(p.endDate) < new Date();
  });

  const dueSoon = projects.filter((p) => {
    if (!p.endDate || p.status === 'COMPLETED') return false;
    const days = (new Date(p.endDate).getTime() - Date.now()) / 86400000;
    return days >= 0 && days <= 30;
  });

  return {
    projects,
    properties,
    audit,
    loading,
    totalBudget,
    active: byStatus('ACTIVE'),
    onHold: byStatus('ON_HOLD'),
    completed: byStatus('COMPLETED'),
    renovations: byType('RENOVATION'),
    developments: byType('DEVELOPMENT'),
    managed: byType('MANAGED'),
    overdue,
    dueSoon,
  };
}
