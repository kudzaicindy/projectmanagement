import { Link } from 'react-router-dom';

import {

  IconCalendar,

  IconDocument,

  IconDollar,

  IconPlus,

  IconProjects,

} from '../icons';

import type { UserRole } from '../../lib/types';



type Action = { label: string; icon: React.ReactNode; color: string; to: string };



const actionsByRole: Record<UserRole, Action[]> = {

  PM: [

    { label: 'New project', icon: <IconPlus className="w-4 h-4" />, color: 'bg-blue-50 text-blue-600', to: '/projects?new=1' },

    { label: 'Gantt schedule', icon: <IconCalendar className="w-4 h-4" />, color: 'bg-violet-50 text-violet-600', to: '/gantt' },

    { label: 'Documents', icon: <IconDocument className="w-4 h-4" />, color: 'bg-orange-50 text-orange-600', to: '/documents' },

    { label: 'Reports', icon: <IconDocument className="w-4 h-4" />, color: 'bg-slate-50 text-slate-600', to: '/reports' },

  ],

  QA: [

    { label: 'Gantt schedule', icon: <IconCalendar className="w-4 h-4" />, color: 'bg-violet-50 text-violet-600', to: '/gantt' },

    { label: 'New project', icon: <IconPlus className="w-4 h-4" />, color: 'bg-blue-50 text-blue-600', to: '/projects?new=1' },

    { label: 'All projects', icon: <IconProjects className="w-4 h-4" />, color: 'bg-cyan-50 text-cyan-600', to: '/projects' },

    { label: 'Reports', icon: <IconDocument className="w-4 h-4" />, color: 'bg-slate-50 text-slate-600', to: '/reports' },

  ],

  FINANCE: [

    { label: 'Review budgets', icon: <IconDollar className="w-4 h-4" />, color: 'bg-green-50 text-green-600', to: '/budgets' },

    { label: 'Approvals', icon: <IconDocument className="w-4 h-4" />, color: 'bg-amber-50 text-amber-600', to: '/approvals' },

    { label: 'Documents', icon: <IconDocument className="w-4 h-4" />, color: 'bg-orange-50 text-orange-600', to: '/documents' },

    { label: 'Reports', icon: <IconDocument className="w-4 h-4" />, color: 'bg-slate-50 text-slate-600', to: '/reports' },

  ],

  CEO: [

    { label: 'Budgets', icon: <IconDollar className="w-4 h-4" />, color: 'bg-green-50 text-green-600', to: '/budgets' },

    { label: 'Approvals', icon: <IconDocument className="w-4 h-4" />, color: 'bg-amber-50 text-amber-600', to: '/approvals' },

    { label: 'Gantt', icon: <IconCalendar className="w-4 h-4" />, color: 'bg-violet-50 text-violet-600', to: '/gantt' },

    { label: 'Reports', icon: <IconDocument className="w-4 h-4" />, color: 'bg-slate-50 text-slate-600', to: '/reports' },

  ],

  ADMIN: [

    { label: 'Projects', icon: <IconProjects className="w-4 h-4" />, color: 'bg-cyan-50 text-cyan-600', to: '/projects' },

    { label: 'Budgets', icon: <IconDollar className="w-4 h-4" />, color: 'bg-green-50 text-green-600', to: '/budgets' },

    { label: 'Gantt', icon: <IconCalendar className="w-4 h-4" />, color: 'bg-violet-50 text-violet-600', to: '/gantt' },

    { label: 'Reports', icon: <IconDocument className="w-4 h-4" />, color: 'bg-slate-50 text-slate-600', to: '/reports' },

  ],

};



export function QuickActions({ role }: { role: UserRole }) {

  return (

    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">

      {actionsByRole[role].map((a) => (

        <Link key={a.label} to={a.to} className="card card-hover flex items-center gap-3 p-3.5 group">

          <div className={`w-9 h-9 rounded-xl ${a.color} flex items-center justify-center shrink-0`}>

            {a.icon}

          </div>

          <span className="text-[12px] font-semibold text-gray-800">{a.label}</span>

        </Link>

      ))}

    </div>

  );

}

