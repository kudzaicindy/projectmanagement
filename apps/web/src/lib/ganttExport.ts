import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import type { Project, Task } from './types';
import { formatDate, formatUsd } from './format';

function slug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadGanttCsv(project: Project, tasks: Task[]) {
  const headers = [
    'Project',
    'Property',
    'Task',
    'Start Date',
    'End Date',
    'Progress (%)',
    'Status',
    'Milestone',
    'Predecessor',
  ];

  const rows = tasks.map((t) => [
    project.name,
    project.property?.name ?? '',
    t.name,
    formatDate(t.startDate),
    formatDate(t.endDate),
    String(t.progress),
    t.status.replace('_', ' '),
    t.isMilestone ? 'Yes' : 'No',
    t.predecessor?.name ?? '',
  ]);

  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const csv = [headers, ...rows].map((row) => row.map(escape).join(',')).join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  triggerDownload(blob, `gantt-${slug(project.name)}-schedule.csv`);
}

export async function downloadGanttPng(chartEl: HTMLElement, project: Project) {
  const dataUrl = await toPng(chartEl, {
    pixelRatio: 2,
    backgroundColor: '#ffffff',
    cacheBust: true,
  });

  const res = await fetch(dataUrl);
  const blob = await res.blob();
  triggerDownload(blob, `gantt-${slug(project.name)}.png`);
}

export async function downloadGanttPdf(
  chartEl: HTMLElement,
  project: Project,
  tasks: Task[],
) {
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageW = pdf.internal.pageSize.getWidth();
  const margin = 14;
  let y = 16;

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.text('Alamait EstatePM — Project Schedule Report', margin, y);

  y += 8;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.setTextColor(80, 80, 80);
  pdf.text(`Generated: ${new Date().toLocaleString('en-US')}`, margin, y);

  y += 7;
  pdf.setTextColor(0, 0, 0);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.text(`Project: ${project.name}`, margin, y);

  y += 5;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  const meta = [
    project.property?.name && `Property: ${project.property.name}`,
    project.startDate && `Timeline: ${formatDate(project.startDate)} – ${formatDate(project.endDate)}`,
    project.budgetUsd && `Budget: ${formatUsd(project.budgetUsd)}`,
    `Tasks: ${tasks.length}`,
  ].filter(Boolean).join('  ·  ');
  pdf.text(meta, margin, y);

  y += 8;

  const imgData = await toPng(chartEl, {
    pixelRatio: 2,
    backgroundColor: '#ffffff',
    cacheBust: true,
  });

  const imgW = pageW - margin * 2;
  const imgH = Math.min(100, imgW * 0.35);
  pdf.addImage(imgData, 'PNG', margin, y, imgW, imgH);

  y += imgH + 10;

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.text('Task schedule', margin, y);
  y += 6;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);

  const colWidths = [52, 28, 28, 14, 22, 18, 28];
  const headers = ['Task', 'Start', 'End', '%', 'Status', 'Milestone', 'Predecessor'];

  pdf.setFillColor(245, 245, 245);
  pdf.rect(margin, y - 4, pageW - margin * 2, 6, 'F');
  let x = margin;
  headers.forEach((h, i) => {
    pdf.text(h, x + 1, y);
    x += colWidths[i];
  });
  y += 6;

  for (const task of tasks) {
    if (y > pdf.internal.pageSize.getHeight() - 14) {
      pdf.addPage();
      y = 16;
    }
    x = margin;
    const cells = [
      task.name.length > 28 ? `${task.name.slice(0, 27)}…` : task.name,
      formatDate(task.startDate),
      formatDate(task.endDate),
      String(task.progress),
      task.status.replace('_', ' '),
      task.isMilestone ? 'Yes' : '—',
      task.predecessor?.name?.slice(0, 18) ?? '—',
    ];
    cells.forEach((cell, i) => {
      pdf.text(cell, x + 1, y);
      x += colWidths[i];
    });
    y += 5;
  }

  pdf.save(`gantt-${slug(project.name)}-report.pdf`);
}
