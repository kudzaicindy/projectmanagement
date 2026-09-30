import { useEffect, useState } from 'react';
import { portfolioApi } from '../lib/api';
import type { PortfolioOverviewTotals, PortfolioProjectHealth } from '../lib/portfolioHealth';

export function usePortfolioHealth() {
  const [projects, setProjects] = useState<PortfolioProjectHealth[]>([]);
  const [totals, setTotals] = useState<PortfolioOverviewTotals | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    portfolioApi
      .health()
      .then((data) => {
        setProjects(data.projects);
        setTotals(data.totals);
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load portfolio'))
      .finally(() => setLoading(false));
  }, []);

  return { projects, totals, loading, error };
}
