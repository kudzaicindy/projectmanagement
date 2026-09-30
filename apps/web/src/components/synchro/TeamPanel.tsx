import { Link } from 'react-router-dom';
import type { User } from '../../lib/types';
import { roleLabels } from '../../lib/format';

const avatarColors = ['bg-pink-200', 'bg-blue-200', 'bg-teal-200', 'bg-orange-200', 'bg-violet-200'];

export function TeamPanel({ members, loading }: { members: User[]; loading: boolean }) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="section-title">Team</h2>
        <Link to="/team" className="text-[10px] font-semibold text-teal-700 hover:underline">View all</Link>
      </div>
      {loading ? (
        <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-10 skeleton" />)}</div>
      ) : (
        <ul className="space-y-1">
          {members.slice(0, 5).map((m, i) => (
            <li key={m.id} className="flex items-center gap-2.5 px-1 py-2 rounded-xl hover:bg-gray-50 transition-colors">
              <div className={`w-8 h-8 rounded-full ${avatarColors[i % avatarColors.length]} flex items-center justify-center text-[10px] font-bold text-gray-700 shrink-0`}>
                {m.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
              </div>
              <div className="min-w-0">
                <p className="text-[12px] font-semibold text-gray-900 truncate">{m.name}</p>
                <p className="text-[10px] text-gray-400">{roleLabels[m.role]}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
