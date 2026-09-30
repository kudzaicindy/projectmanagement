import { CEODashboard } from '../components/dashboard/CEODashboard';

import { FinanceDashboard } from '../components/dashboard/FinanceDashboard';

import { PMDashboard } from '../components/dashboard/PMDashboard';

import { QADashboard } from '../components/dashboard/QADashboard';

import { SynchroDashboard } from '../components/synchro/SynchroDashboard';

import { usePortfolioData } from '../hooks/usePortfolioData';

import { useAuth } from '../lib/auth';



export function DashboardPage() {

  const { user } = useAuth();

  const data = usePortfolioData();



  if (!user) return null;



  if (user.role === 'QA') {

    return (

      <QADashboard

        userName={user.name}

        projects={data.projects}

        loading={data.loading}

        totalBudget={data.totalBudget}

      />

    );

  }



  if (user.role === 'FINANCE') {

    return (

      <FinanceDashboard

        userName={user.name}

        projects={data.projects}

        audit={data.audit}

        loading={data.loading}

        totalBudget={data.totalBudget}

      />

    );

  }



  if (user.role === 'CEO' || user.role === 'ADMIN') {

    return (

      <CEODashboard

        userName={user.name}

        projects={data.projects}

        properties={data.properties}

        audit={data.audit}

        loading={data.loading}

        totalBudget={data.totalBudget}

        active={data.active}

        onHold={data.onHold}

        overdue={data.overdue}

      />

    );

  }



  if (user.role === 'PM') {

    return (

      <PMDashboard

        userName={user.name}

        projects={data.projects}

        loading={data.loading}

        dueSoon={data.dueSoon}

        overdue={data.overdue}

      />

    );

  }



  return (

    <SynchroDashboard

      role={user.role}

      userName={user.name}

      projects={data.projects}

      audit={data.audit}

      loading={data.loading}

      totalBudget={data.totalBudget}

      active={data.active}

    />

  );

}

