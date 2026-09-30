import { Navigate, Route, Routes } from 'react-router-dom';

import { Layout } from './components/Layout';

import { useAuth } from './lib/auth';

import { ApprovalsPage } from './pages/ApprovalsPage';

import { AuditPage } from './pages/AuditPage';

import { BudgetsPage } from './pages/BudgetsPage';

import { DashboardPage } from './pages/DashboardPage';

import { DocumentsPage } from './pages/DocumentsPage';

import { GanttPage } from './pages/GanttPage';

import { LoginPage } from './pages/LoginPage';

import { ProjectDetailPage } from './pages/ProjectDetailPage';

import { ProjectsPage } from './pages/ProjectsPage';

import { PropertiesPage } from './pages/PropertiesPage';

import { ReportsPage } from './pages/ReportsPage';
import { TeamPage } from './pages/TeamPage';



function ProtectedRoute({ children }: { children: React.ReactNode }) {

  const { user, loading } = useAuth();



  if (loading) {

    return (

      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f5f6f8] gap-4">

        <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center text-white font-bold text-sm">A</div>

        <div className="w-48 h-2 skeleton !rounded-full" />

        <p className="text-[13px] text-gray-400">Loading EstatePM…</p>

      </div>

    );

  }



  if (!user) {

    return <Navigate to="/login" replace />;

  }



  return <>{children}</>;

}



export default function App() {

  return (

    <Routes>

      <Route path="/login" element={<LoginPage />} />

      <Route

        element={

          <ProtectedRoute>

            <Layout />

          </ProtectedRoute>

        }

      >

        <Route path="/" element={<DashboardPage />} />

        <Route path="/projects" element={<ProjectsPage />} />

        <Route path="/projects/:id" element={<ProjectDetailPage />} />

        <Route path="/properties" element={<PropertiesPage />} />

        <Route path="/gantt" element={<GanttPage />} />

        <Route path="/budgets" element={<BudgetsPage />} />

        <Route path="/documents" element={<DocumentsPage />} />

        <Route path="/approvals" element={<ApprovalsPage />} />

        <Route path="/audit" element={<AuditPage />} />

        <Route path="/team" element={<TeamPage />} />
        <Route path="/reports" element={<ReportsPage />} />

      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>

  );

}

