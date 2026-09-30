import { useMemo } from 'react';
import { AppPageLayout } from '../components/layout/AppPageLayout';
import { IconDocument } from '../components/icons';
import { usePortfolioData } from '../hooks/usePortfolioData';
import { usePortfolioHealth } from '../hooks/usePortfolioHealth';
import { useAuth } from '../lib/auth';
import {
  downloadAccountingExportCsv,
  downloadAuditCsv,
  downloadBudgetLedgerCsv,
} from '../lib/export';
import {
  downloadPortfolioHealthCsv,
  downloadPortfolioSummaryCsv,
  downloadProjectTrackingCsv,
  printPortfolioReport,
} from '../lib/reports';

type ReportDef = {
  id: string;
  title: string;
  description: string;
  formats: ('csv' | 'print')[];
  roles?: string[];
  run: (format: 'csv' | 'print') => void;
};

export function ReportsPage() {
  const { user } = useAuth();
  const data = usePortfolioData();
  const { projects: portfolioHealth } = usePortfolioHealth();

  const reports = useMemo((): ReportDef[] => {
    if (!user) return [];

    const base: ReportDef[] = [
      {
        id: 'portfolio-summary',
        title: 'Portfolio summary',
        description: 'All properties and projects with budget, schedule %, timeline, and task counts.',
        formats: ['csv', 'print'],
        run: (format) => {
          if (format === 'csv') downloadPortfolioSummaryCsv(data.projects, data.properties, user);
          else printPortfolioReport(data.projects, data.properties, user, data.audit, portfolioHealth);
        },
      },
      {
        id: 'project-tracking',
        title: 'Project tracking',
        description: 'Schedule vs timeline, overdue flags, task completion, and budget utilization.',
        formats: ['csv'],
        run: () => downloadProjectTrackingCsv(data.projects),
      },
      {
        id: 'portfolio-health',
        title: 'Portfolio health (executive)',
        description: 'QA / executive phase-level CapEx, variance, and cash need — Alamait development sites.',
        formats: ['csv'],
        run: () => downloadPortfolioHealthCsv(portfolioHealth),
      },
      {
        id: 'budget-ledger',
        title: 'Budget ledger',
        description: 'Approved, committed, spent, and remaining by project (derived until live ledger).',
        formats: ['csv'],
        run: () => downloadBudgetLedgerCsv(data.projects),
      },
    ];

    if (['CEO', 'FINANCE', 'ADMIN'].includes(user.role)) {
      base.push({
        id: 'accounting',
        title: 'Accounting export',
        description: 'Portfolio totals plus audit trail entries for finance reconciliation.',
        formats: ['csv'],
        roles: ['CEO', 'FINANCE', 'ADMIN'],
        run: () => downloadAccountingExportCsv(data.projects, data.audit),
      });
      base.push({
        id: 'audit',
        title: 'Audit trail',
        description: 'Full system audit log export.',
        formats: ['csv'],
        roles: ['CEO', 'FINANCE', 'ADMIN'],
        run: () => downloadAuditCsv(data.audit),
      });
    }

    return base;
  }, [user, data.projects, data.properties, data.audit, portfolioHealth]);

  return (
    <AppPageLayout
      eyebrow="Alamait · EstatePM"
      title="Reports"
      subtitle="Generate CSV downloads or a printable portfolio report from live project, budget, and tracking data."
      quickActionsRole={user?.role}
    >
      {data.loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 skeleton" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reports.map((report) => (
            <article key={report.id} className="card p-5 flex flex-col">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 shrink-0">
                  <IconDocument className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-[15px] font-bold text-gray-900">{report.title}</h2>
                  <p className="text-[12px] text-gray-500 mt-1 leading-relaxed">{report.description}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
                {report.formats.includes('csv') && (
                  <button
                    type="button"
                    className="btn-primary !text-[12px]"
                    onClick={() => report.run('csv')}
                  >
                    Download CSV
                  </button>
                )}
                {report.formats.includes('print') && (
                  <button
                    type="button"
                    className="btn-secondary !text-[12px]"
                    onClick={() => report.run('print')}
                  >
                    Print / PDF
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      <p className="text-[11px] text-gray-400 mt-4 leading-relaxed max-w-2xl">
        CSV files open in Excel or Google Sheets. For PDF, choose Print / PDF and select &quot;Save as PDF&quot; in your
        browser print dialog. Reports use data visible in EstatePM at generation time.
      </p>
    </AppPageLayout>
  );
}
