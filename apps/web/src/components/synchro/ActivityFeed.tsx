import type { AuditLog } from '../../lib/types';

export function ActivityFeed({ logs }: { logs: AuditLog[] }) {
  const items = logs.slice(0, 8).map((log) => ({
    user: log.user?.name ?? 'System',
    action: `${log.action.toLowerCase()} ${log.entityType.toLowerCase()}`,
    time: new Date(log.createdAt).toLocaleString(),
  }));

  return (
    <div className="card p-6 h-full">
      <h2 className="text-[15px] font-bold text-gray-900 mb-4">Activity</h2>
      {items.length === 0 ? (
        <p className="text-[12px] text-gray-400">No activity yet. Actions in EstatePM will appear here.</p>
      ) : (
        <ul className="space-y-4">
          {items.map((item, i) => (
            <li key={i} className="text-[12px] leading-relaxed">
              <span className="font-semibold text-gray-900">{item.user}</span>
              <span className="text-gray-500"> {item.action}</span>
              <p className="text-[11px] text-gray-400 mt-0.5">{item.time}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
