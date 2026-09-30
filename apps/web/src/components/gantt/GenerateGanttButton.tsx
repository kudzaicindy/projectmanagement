import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconCalendar } from '../icons';
import { useAuth } from '../../lib/auth';
import { ensureProjectGantt, openProjectGantt } from '../../lib/openProjectGantt';
import { canEditSchedule } from '../../lib/permissions';

type Props = {
  projectId: string;
  projectName?: string;
  /** Open Gantt page after generate (default true). */
  navigate?: boolean;
  /** Called after schedule is ensured (e.g. reload workspace). */
  onReady?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'link' | 'icon';
  label?: string;
};

export function GenerateGanttButton({
  projectId,
  projectName,
  navigate: shouldNavigate = true,
  onReady,
  className = '',
  variant = 'secondary',
  label = 'Generate Gantt',
}: Props) {
  const { user } = useAuth();
  const nav = useNavigate();
  const [busy, setBusy] = useState(false);
  const canGenerate = canEditSchedule(user);

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!canGenerate || busy) {
      if (!canGenerate && shouldNavigate) {
        nav(`/gantt?project=${projectId}`);
      }
      return;
    }
    setBusy(true);
    try {
      if (shouldNavigate) {
        await openProjectGantt(projectId, nav);
      } else {
        await ensureProjectGantt(projectId);
        onReady?.();
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Could not generate Gantt schedule');
    } finally {
      setBusy(false);
    }
  }

  const title = projectName ? `Gantt schedule · ${projectName}` : 'Gantt schedule';

  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={busy}
        className={`text-gray-400 hover:text-teal-700 disabled:opacity-50 ${className}`}
        title={canGenerate ? title : 'View Gantt (read-only)'}
      >
        <IconCalendar className="w-4 h-4" />
      </button>
    );
  }

  if (variant === 'link') {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={busy}
        className={`text-[12px] font-semibold text-teal-800 hover:underline disabled:opacity-50 ${className}`}
      >
        {busy ? 'Building schedule…' : label}
      </button>
    );
  }

  const base =
    variant === 'primary'
      ? 'btn-primary'
      : 'btn-secondary';

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      className={`${base} !text-[12px] gap-2 ${className}`}
      title={title}
    >
      <IconCalendar className="w-4 h-4 shrink-0" />
      {busy ? 'Creating chart…' : label}
    </button>
  );
}
