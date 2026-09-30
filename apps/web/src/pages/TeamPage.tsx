import { useEffect, useState } from 'react';
import { AppPageLayout } from '../components/layout/AppPageLayout';
import { usersApi } from '../lib/api';
import { useAuth } from '../lib/auth';
import { roleLabels, roleBadgeColor } from '../lib/format';
import type { User, UserRole } from '../lib/types';

const avatarColors = ['bg-pink-200', 'bg-blue-200', 'bg-teal-200', 'bg-orange-200', 'bg-violet-200'];

export function TeamPage() {
  const { user } = useAuth();
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<UserRole | 'ALL'>('ALL');

  useEffect(() => {
    usersApi.list().then(setMembers).catch(() => []).finally(() => setLoading(false));
  }, []);

  const filtered = roleFilter === 'ALL' ? members : members.filter((m) => m.role === roleFilter);
  const roles = [...new Set(members.map((m) => m.role))];

  return (
    <AppPageLayout
      eyebrow="Alamait · People"
      title="Team directory"
      subtitle="Property managers, QA, finance, and leadership across EstatePM."
      quickActionsRole={user?.role}
    >
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setRoleFilter('ALL')}
          className={`px-3 py-1.5 rounded-xl text-[12px] font-semibold ${roleFilter === 'ALL' ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}
        >
          All ({members.length})
        </button>
        {roles.map((role) => (
          <button
            key={role}
            type="button"
            onClick={() => setRoleFilter(role)}
            className={`px-3 py-1.5 rounded-xl text-[12px] font-semibold ${roleFilter === role ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}
          >
            {roleLabels[role]} ({members.filter((m) => m.role === role).length})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-28 skeleton" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((m, i) => (
            <div key={m.id} className="card p-4 flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full ${avatarColors[i % avatarColors.length]} flex items-center justify-center text-sm font-bold text-gray-700 shrink-0`}>
                {m.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-bold text-gray-900 truncate">{m.name}</p>
                <p className="text-[12px] text-gray-500 truncate">{m.email}</p>
                <span className={`pill mt-1.5 ${roleBadgeColor(m.role)}`}>{roleLabels[m.role]}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppPageLayout>
  );
}
