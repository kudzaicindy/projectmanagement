import { useRef, useState } from 'react';
import {
  downloadGanttCsv,
  downloadGanttPdf,
  downloadGanttPng,
} from '../../lib/ganttExport';
import type { Project, Task } from '../../lib/types';

export function GanttExportMenu({
  chartRef,
  project,
  tasks,
  disabled,
}: {
  chartRef: React.RefObject<HTMLElement | null>;
  project: Project | null;
  tasks: Task[];
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  async function runExport(type: 'png' | 'pdf' | 'csv') {
    if (!project || !chartRef.current) return;
    if (type !== 'csv' && tasks.length === 0) {
      alert('Add tasks to the schedule before exporting the chart.');
      return;
    }

    setExporting(type);
    setOpen(false);
    try {
      if (type === 'csv') {
        downloadGanttCsv(project, tasks);
      } else if (type === 'png') {
        await downloadGanttPng(chartRef.current, project);
      } else {
        await downloadGanttPdf(chartRef.current, project, tasks);
      }
    } catch (err) {
      console.error(err);
      alert('Export failed. Try again or use CSV export.');
    } finally {
      setExporting(null);
    }
  }

  const busy = exporting !== null;

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        disabled={disabled || !project || busy}
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-[13px] font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors shrink-0"
      >
        {busy ? (
          <>
            <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
            Exporting…
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M7.5 7.5L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            Download report
          </>
        )}
      </button>

      {open && !busy && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} aria-hidden />
          <div className="absolute right-0 top-full mt-2 z-20 w-56 card py-2 shadow-lg">
            <p className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Export schedule</p>
            <button
              type="button"
              onClick={() => runExport('pdf')}
              className="w-full text-left px-4 py-2.5 text-[13px] text-gray-800 hover:bg-gray-50 flex items-center gap-3"
            >
              <span className="text-lg">📄</span>
              <div>
                <p className="font-semibold">PDF report</p>
                <p className="text-[11px] text-gray-400">Chart + task table</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => runExport('png')}
              className="w-full text-left px-4 py-2.5 text-[13px] text-gray-800 hover:bg-gray-50 flex items-center gap-3"
            >
              <span className="text-lg">🖼️</span>
              <div>
                <p className="font-semibold">PNG image</p>
                <p className="text-[11px] text-gray-400">Gantt chart only</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => runExport('csv')}
              className="w-full text-left px-4 py-2.5 text-[13px] text-gray-800 hover:bg-gray-50 flex items-center gap-3"
            >
              <span className="text-lg">📊</span>
              <div>
                <p className="font-semibold">CSV spreadsheet</p>
                <p className="text-[11px] text-gray-400">Task data for Excel</p>
              </div>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
