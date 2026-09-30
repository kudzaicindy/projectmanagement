import { formatUsd } from '../../lib/format';
import type { Project, UserRole } from '../../lib/types';

export function RolePanel({
  role,
  projects,
  totalBudget,
}: {
  role: UserRole;
  projects: Project[];
  totalBudget: number;
}) {
  if (role === 'FINANCE') {
    const pending = projects.filter((p) => p.status === 'ACTIVE').slice(0, 3);
    return (
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[15px] font-bold text-gray-900">Approval inbox</h2>
          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md">PM → Finance → CEO</span>
        </div>
        <div className="space-y-3">
          {pending.map((p, i) => (
            <div key={p.id} className={`flex items-center justify-between p-4 rounded-xl border ${i === 0 ? 'border-amber-200 bg-amber-50/50' : 'border-gray-100'}`}>
              <div>
                <p className="text-[13px] font-semibold text-gray-900">Payment release — {p.name}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{i === 0 ? 'Awaiting Finance' : 'PM submitted'}</p>
              </div>
              <p className="text-[14px] font-bold text-gray-900">{formatUsd(parseFloat(p.budgetUsd ?? '0') * 0.15)}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (role === 'QA') {
    return (
      <div className="card p-6">
        <h2 className="text-[15px] font-bold text-gray-900 mb-4">BOQ assignments</h2>
        <table className="w-full text-[12px]">
          <thead>
            <tr className="text-gray-400 border-b border-gray-100">
              <th className="text-left py-2 font-semibold">Project</th>
              <th className="text-left py-2 font-semibold">Budget</th>
              <th className="text-left py-2 font-semibold">BOQ</th>
            </tr>
          </thead>
          <tbody>
            {projects.filter((p) => p.type !== 'MANAGED').map((p, i) => (
              <tr key={p.id} className="border-b border-gray-50">
                <td className="py-3 font-semibold text-gray-800">{p.name}</td>
                <td className="py-3 text-gray-600">{formatUsd(p.budgetUsd)}</td>
                <td className="py-3">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${i === 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {i === 0 ? 'Draft' : 'Not started'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (role === 'CEO' || role === 'ADMIN') {
    return (
      <div className="card p-6">
        <h2 className="text-[15px] font-bold text-gray-900 mb-4">Investment decisions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { type: 'Acquire', title: 'Eastside land parcel', amount: 420000 },
            { type: 'Dispose', title: 'Block C retail unit', amount: 310000 },
          ].map((d) => (
            <div key={d.title} className="p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${d.type === 'Acquire' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>{d.type}</span>
              <p className="text-[13px] font-semibold text-gray-900 mt-2">{d.title}</p>
              <p className="text-[14px] font-bold text-gray-900 mt-1">{formatUsd(d.amount)}</p>
              <button type="button" className="mt-3 w-full py-2 rounded-lg bg-gray-900 text-white text-[11px] font-bold hover:bg-gray-800">Go / No-go</button>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-gray-400 mt-4">Portfolio budget: {formatUsd(totalBudget)}</p>
      </div>
    );
  }

  // PM — permits checklist
  return (
    <div className="card p-6">
      <h2 className="text-[15px] font-bold text-gray-900 mb-4">Compliance checklist</h2>
      <div className="space-y-2">
        {['Plans uploaded', 'Permit application submitted', 'Contract signed', 'BOQ approved by QA'].map((item, i) => (
          <label key={item} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer">
            <input type="checkbox" defaultChecked={i < 2} className="w-4 h-4 rounded accent-gray-900" />
            <span className="text-[13px] text-gray-700">{item}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
