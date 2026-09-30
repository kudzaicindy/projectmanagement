import {
  formatVariance,
  type PortfolioOverviewTotals,
  type PortfolioPhase,
  type PortfolioProjectHealth,
} from '../../lib/portfolioHealth';
import { formatPercent, formatUsd, formatUsdCell } from '../../lib/format';

type Row = {
  id: string;
  name: string;
  indent: boolean;
  percentComplete?: number;
  statusLabel: string;
  budgetCapex?: number;
  actualSpend?: number;
  estToComplete?: number;
  forecastTotal?: number;
  variance?: number;
  cashFlowNeed30d?: number;
  notes?: string;
  isTotals?: boolean;
};

function phaseStatusLabel(status: PortfolioPhase['status']): string {
  if (status === 'completed') return 'Completed';
  if (status === 'ongoing') return 'On going';
  if (status === 'not_started') return '—';
  return '—';
}

function rowFromPhase(ph: PortfolioPhase, indent: boolean): Row {
  return {
    id: ph.id,
    name: ph.name,
    indent,
    percentComplete: ph.percentComplete,
    statusLabel: phaseStatusLabel(ph.status),
    budgetCapex: ph.budgetCapex,
    actualSpend: ph.actualSpend,
    estToComplete: ph.estToComplete,
    forecastTotal: ph.forecastTotal,
    variance: ph.variance,
    cashFlowNeed30d: ph.cashFlowNeed30d,
    notes: ph.notes,
  };
}

function rowFromSummary(project: PortfolioProjectHealth): Row | null {
  const s = project.summary;
  if (!s) return null;
  return {
    id: `${project.id}-summary`,
    name: project.name,
    indent: false,
    percentComplete: s.percentComplete,
    statusLabel: phaseStatusLabel(s.status),
    budgetCapex: s.budgetCapex,
    actualSpend: s.actualSpend,
    estToComplete: s.estToComplete,
    forecastTotal: s.forecastTotal,
    variance: s.variance,
    cashFlowNeed30d: s.cashFlowNeed30d,
    notes: s.notes,
  };
}

function emptySiteRow(project: PortfolioProjectHealth): Row {
  return {
    id: project.id,
    name: project.name,
    indent: false,
    statusLabel: '—',
  };
}

export function buildExecutiveRows(projects: PortfolioProjectHealth[]): Row[] {
  const rows: Row[] = [];
  for (const project of projects) {
    const summaryRow = rowFromSummary(project);
    if (summaryRow) {
      rows.push(summaryRow);
      for (const ph of project.phases) rows.push(rowFromPhase(ph, true));
    } else if (project.phases.length > 0) {
      rows.push(emptySiteRow(project));
      for (const ph of project.phases) rows.push(rowFromPhase(ph, true));
    } else {
      rows.push(emptySiteRow(project));
    }
  }
  return rows;
}

function MoneyCell({ value }: { value?: number }) {
  const text = formatUsdCell(value);
  if (text === '—') return <span className="text-gray-300">—</span>;
  return <>{text}</>;
}

function VarianceCell({ value }: { value?: number }) {
  if (value == null) return <span className="text-gray-300">—</span>;
  const negative = value < 0;
  return (
    <span className={negative ? 'text-red-600 font-semibold' : 'text-gray-900'}>
      {formatVariance(value)}
    </span>
  );
}

export function PortfolioOverviewTable({
  projects,
  totals,
}: {
  projects: PortfolioProjectHealth[];
  totals: PortfolioOverviewTotals | null;
}) {
  const rows = buildExecutiveRows(projects);

  return (
    <div className="border border-gray-100 rounded-xl overflow-x-auto">
      <table className="data-table text-[12px] min-w-[960px]">
        <thead>
          <tr className="bg-gray-50/90">
            <th className="min-w-[200px] sticky left-0 bg-gray-50/95 z-[1]">Project name</th>
            <th className="num w-[72px]">% complete</th>
            <th className="w-[88px]">Status</th>
            <th className="num w-[108px]">CapEx budget</th>
            <th className="num w-[108px]">Spent (TD)</th>
            <th className="num w-[100px]">Est. to complete</th>
            <th className="num w-[108px]">Forecast</th>
            <th className="num w-[96px]">Variance</th>
            <th className="num w-[96px]">Cash · 30d</th>
            <th className="min-w-[160px]">Notes</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className={r.indent ? 'row-phase' : 'row-site'}>
              <td
                className={`sticky left-0 bg-white z-[1] shadow-[4px_0_8px_-4px_rgba(0,0,0,0.06)] ${r.indent ? 'pl-8' : ''}`}
              >
                {r.name}
              </td>
              <td className="num">{formatPercent(r.percentComplete)}</td>
              <td className="text-[11px] text-gray-600 whitespace-nowrap">{r.statusLabel}</td>
              <td className="num">
                <MoneyCell value={r.budgetCapex} />
              </td>
              <td className="num">
                <MoneyCell value={r.actualSpend} />
              </td>
              <td className="num">
                <MoneyCell value={r.estToComplete} />
              </td>
              <td className="num">
                <MoneyCell value={r.forecastTotal} />
              </td>
              <td className="num">
                <VarianceCell value={r.variance} />
              </td>
              <td className="num">
                <MoneyCell value={r.cashFlowNeed30d} />
              </td>
              <td className="notes">{r.notes?.trim() ? r.notes : '—'}</td>
            </tr>
          ))}
          {totals && (
            <tr className="row-totals">
              <td className="sticky left-0 bg-gray-50 z-[1] shadow-[4px_0_8px_-4px_rgba(0,0,0,0.06)]">TOTALS</td>
              <td className="num">—</td>
              <td>—</td>
              <td className="num">{formatUsd(totals.budgetCapex)}</td>
              <td className="num">{formatUsd(totals.actualSpend)}</td>
              <td className="num">{formatUsd(totals.estToComplete)}</td>
              <td className="num">{formatUsd(totals.forecastTotal)}</td>
              <td className="num">
                <VarianceCell value={totals.variance} />
              </td>
              <td className="num">{formatUsd(totals.cashFlowNeed30d)}</td>
              <td className="notes">—</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
