import type { AuditLog, Project } from './types';
import { formatDate, formatUsd } from './format';
import { getPortfolioBudgetSummary, getProjectBudgetLine } from './budgets';

export function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function toCsv(headers: string[], rows: string[][]) {
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  return [headers, ...rows].map((row) => row.map(escape).join(',')).join('\r\n');
}

export function downloadBudgetLedgerCsv(projects: Project[]) {
  const summary = getPortfolioBudgetSummary(projects);
  const budgetProjects = projects.filter((p) => p.budgetUsd);

  const meta = [
    ['Alamait EstatePM — Budget Ledger'],
    ['Generated', new Date().toLocaleString()],
    ['Currency', 'USD'],
    [],
    ['Portfolio Summary'],
    ['Approved', formatUsd(summary.approved)],
    ['Committed', formatUsd(summary.committed)],
    ['Spent', formatUsd(summary.spent)],
    ['Remaining', formatUsd(summary.remaining)],
    ['Uncommitted', formatUsd(summary.available)],
    [],
  ];

  const headers = ['Project', 'Property', 'Type', 'Status', 'Approved', 'Committed', 'Spent', 'Remaining', 'Utilization %'];
  const rows = budgetProjects.map((p) => {
    const line = getProjectBudgetLine(p);
    return [
      p.name,
      p.property?.name ?? '',
      p.type,
      p.status,
      formatUsd(line.approved),
      formatUsd(line.committed),
      formatUsd(line.spent),
      formatUsd(line.remaining),
      String(line.utilizationPct),
    ];
  });

  const csv = [...meta.map((r) => r.join(',')), toCsv(headers, rows)].join('\r\n');
  triggerDownload(new Blob([csv], { type: 'text/csv;charset=utf-8' }), `alamait-budget-ledger-${Date.now()}.csv`);
}

export function downloadAccountingExportCsv(projects: Project[], audit: AuditLog[]) {
  const summary = getPortfolioBudgetSummary(projects);
  const headers = ['Date', 'User', 'Action', 'Entity', 'Details'];
  const auditRows = audit.map((log) => [
    new Date(log.createdAt).toLocaleString(),
    log.user?.name ?? '',
    log.action,
    log.entityType,
    log.entityId ?? '',
  ]);

  const preamble = [
    'Alamait EstatePM — Accounting Export',
    `Generated,${new Date().toLocaleString()}`,
    `Portfolio Approved,${formatUsd(summary.approved)}`,
    `Portfolio Spent,${formatUsd(summary.spent)}`,
    '',
    '--- Audit Trail ---',
  ];

  const csv = [...preamble, toCsv(headers, auditRows)].join('\r\n');
  triggerDownload(new Blob([csv], { type: 'text/csv;charset=utf-8' }), `alamait-accounting-export-${Date.now()}.csv`);
}

export function downloadAuditCsv(logs: AuditLog[]) {
  const headers = ['Timestamp', 'User', 'Role', 'Action', 'Entity Type', 'Entity ID'];
  const rows = logs.map((log) => [
    new Date(log.createdAt).toISOString(),
    log.user?.name ?? '',
    log.user?.role ?? '',
    log.action,
    log.entityType,
    log.entityId ?? '',
  ]);
  const csv = toCsv(headers, rows);
  triggerDownload(new Blob([csv], { type: 'text/csv;charset=utf-8' }), `alamait-audit-trail-${Date.now()}.csv`);
}

export type DocExportRow = {
  name: string;
  category: string;
  projectName: string;
  propertyName: string;
  uploadedBy: string;
  createdAt: string;
};

export function downloadDocumentsCsv(documents: DocExportRow[]) {
  const headers = ['Document', 'Category', 'Project', 'Property', 'Uploaded By', 'Date'];
  const rows = documents.map((d) => [
    d.name,
    d.category,
    d.projectName,
    d.propertyName,
    d.uploadedBy,
    formatDate(d.createdAt),
  ]);
  const csv = toCsv(headers, rows);
  triggerDownload(new Blob([csv], { type: 'text/csv;charset=utf-8' }), `alamait-documents-${Date.now()}.csv`);
}
